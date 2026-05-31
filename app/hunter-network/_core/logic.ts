// ---------------------------------------------------------------------------
// Hunter Network (HN) — Operational Core v1 · business rules
//
// Pure functions only. These encode the rules the brief calls "critical" —
// classification, score normalisation, campaign access. They are deliberately
// kept out of the UI and out of the repository so they can be unit-tested and
// reused by a future API/SaaS layer unchanged.
//
// Guiding principle: payment buys evaluation, performance buys campaigns, and
// brand protection beats volume. The functions below are where that lives.
// ---------------------------------------------------------------------------

import type {
  BrandRiskLevel,
  Campaign,
  CommercialAccessEvaluation,
  EvaluationResult,
  Hunter,
  HunterLevel,
  HNSettings,
  Lead,
  OverviewStats,
  RankingRow,
  TestCall,
  TestCallScores,
} from "./types";

// --- Level ordering ---------------------------------------------------------

// Single source of truth for "is level A at least level B". Used by campaign
// access, ranking eligibility and status/level reconciliation.
const LEVEL_ORDER: Record<HunterLevel, number> = {
  none: 0,
  trainee: 1,
  junior: 2,
  active: 3,
  hunter: 4,
  partner: 5,
};

export function levelRank(level: HunterLevel): number {
  return LEVEL_ORDER[level];
}

export function levelAtLeast(have: HunterLevel, required: HunterLevel): boolean {
  return LEVEL_ORDER[have] >= LEVEL_ORDER[required];
}

// --- Test-call scoring ------------------------------------------------------

// The 13 dimensions, in display order. Single list so logic + UI never drift.
export const TEST_CALL_DIMENSIONS: ReadonlyArray<keyof TestCallScores> = [
  "voice_score",
  "clarity_score",
  "energy_score",
  "naturalness_score",
  "respect_score",
  "conversation_control_score",
  "product_understanding_score",
  "qualification_questions_score",
  "objection_handling_score",
  "meeting_close_score",
  "brand_care_score",
  "crm_accuracy_score",
  "discipline_score",
];

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

// 13 dimensions × 0–10 = max 130 raw → normalise to 0–100, rounded to 1 dp.
export function testCallTotal(scores: TestCallScores): number {
  const raw = TEST_CALL_DIMENSIONS.reduce((sum, key) => sum + clamp(scores[key], 0, 10), 0);
  const max = TEST_CALL_DIMENSIONS.length * 10;
  return Math.round((raw / max) * 1000) / 10;
}

// --- Classification ---------------------------------------------------------

// Maps a final_score to a level using the configurable thresholds. Never
// returns `partner` — partner is manual only (critical rule #5). Below the
// trainee floor is "not qualified", represented as level `none`.
export function classifyScore(finalScore: number, settings: HNSettings): HunterLevel {
  const t = settings.score_thresholds;
  if (finalScore >= t.hunter) return "hunter";
  if (finalScore >= t.active) return "active";
  if (finalScore >= t.junior) return "junior";
  if (finalScore >= t.trainee) return "trainee";
  return "none";
}

// The evaluation `result` form of the same decision. `none` → rejected.
// classifyScore never returns `partner` (manual only), so the remaining levels
// map 1:1 onto EvaluationResult; the switch makes that exhaustive for TS.
export function classifyResult(finalScore: number, settings: HNSettings): EvaluationResult {
  const level = classifyScore(finalScore, settings);
  switch (level) {
    case "trainee":
      return "trainee";
    case "junior":
      return "junior";
    case "active":
      return "active";
    case "hunter":
    case "partner":
      return "hunter";
    case "none":
      return "rejected";
  }
}

// Translate a decided evaluation into the hunter status it implies. Partner is
// never auto-assigned; a partner_review result keeps the hunter at `under_review`
// pending a manual decision.
export function statusForResult(result: EvaluationResult): Hunter["status"] {
  switch (result) {
    case "rejected":
      return "not_qualified";
    case "trainee":
      return "trainee";
    case "junior":
      return "junior";
    case "active":
      return "active";
    case "hunter":
      return "hunter";
    case "partner_review":
      return "under_review";
  }
}

export function levelForResult(result: EvaluationResult): HunterLevel {
  switch (result) {
    case "rejected":
    case "partner_review":
      return result === "partner_review" ? "hunter" : "none";
    case "trainee":
      return "trainee";
    case "junior":
      return "junior";
    case "active":
      return "active";
    case "hunter":
      return "hunter";
  }
}

// Roll the completed test calls of an evaluation into average/final scores.
// final_score defaults to the average; an operator override is applied on top
// elsewhere. Returns rounded-to-1dp figures.
export function evaluationScores(calls: TestCall[]): { average: number; completed: number } {
  const scored = calls.filter((c) => c.total_score > 0);
  if (scored.length === 0) return { average: 0, completed: 0 };
  const mean = scored.reduce((s, c) => s + c.total_score, 0) / scored.length;
  return { average: Math.round(mean * 10) / 10, completed: scored.length };
}

// --- Campaign access (the hard guard) ---------------------------------------

// A hunter may only touch a campaign — or any lead from it — if their level
// meets the campaign's minimum. This is enforced here and called from every
// assignment path so the rule cannot be bypassed by one screen forgetting it.
export function meetsCampaignLevel(hunter: Pick<Hunter, "level">, campaign: Pick<Campaign, "minimum_level_required">): boolean {
  return levelAtLeast(hunter.level, campaign.minimum_level_required);
}

// Richer access check used by lead assignment: also blocks suspended/banned
// hunters and critical brand-risk hunters from real campaigns, and verifies the
// hunter level is permitted for the campaign's risk band per settings.
export interface AccessCheck {
  allowed: boolean;
  reason: string | null;
}

export function checkCampaignAccess(
  hunter: Pick<Hunter, "level" | "status" | "brand_risk_level">,
  campaign: Pick<Campaign, "minimum_level_required" | "campaign_risk_level" | "status">,
  settings: HNSettings,
): AccessCheck {
  if (hunter.status === "suspended" || hunter.status === "banned") {
    return { allowed: false, reason: "hunter_suspended_or_banned" };
  }
  if (campaign.status !== "active") {
    return { allowed: false, reason: "campaign_not_active" };
  }
  if (!meetsCampaignLevel(hunter, campaign)) {
    return { allowed: false, reason: "level_below_minimum" };
  }
  // Premium campaigns require low brand risk regardless of level (rule #6).
  if (campaign.campaign_risk_level === "premium" && hunter.brand_risk_level !== "low") {
    return { allowed: false, reason: "brand_risk_too_high_for_premium" };
  }
  if (hunter.brand_risk_level === "critical") {
    return { allowed: false, reason: "brand_risk_critical" };
  }
  // Settings-defined risk allow-list for the hunter's level.
  if (hunter.level !== "none") {
    const allowedBands = settings.campaign_access_rules[hunter.level];
    if (!allowedBands.includes(campaign.campaign_risk_level)) {
      return { allowed: false, reason: "risk_band_not_permitted_for_level" };
    }
  }
  return { allowed: true, reason: null };
}

// --- Ranking ----------------------------------------------------------------

const BRAND_RISK_RANK: Record<BrandRiskLevel, number> = { low: 0, medium: 1, high: 2, critical: 3 };

// Build one ranking row per hunter from their calls and meeting outcomes.
// Premium eligibility = hunter level or above AND low brand risk (rule #6).
export function buildRankingRow(hunter: Hunter, calls: TestCall[], leads: Lead[]): RankingRow {
  const scored = calls.filter((c) => c.total_score > 0);
  const reviewed = calls.filter((c) => c.operator_reviewed);
  const avg = scored.length ? Math.round((scored.reduce((s, c) => s + c.total_score, 0) / scored.length) * 10) / 10 : 0;

  const hunterLeads = leads.filter((l) => l.assigned_hunter_id === hunter.id);
  const meetings = hunterLeads.filter((l) => l.status === "meeting_booked").length;
  const contacted = hunterLeads.filter((l) => l.status !== "new" && l.status !== "assigned" && l.status !== "invalid").length;
  const noShow = hunterLeads.filter((l) => l.status === "no_answer").length;
  const campaignsCompleted = new Set(
    hunterLeads.filter((l) => l.status === "closed_won").map((l) => l.campaign_id),
  ).size;

  return {
    hunter_id: hunter.id,
    name: hunter.name,
    country: hunter.country,
    level: hunter.level,
    total_score: hunter.total_score,
    average_call_score: avg,
    total_calls: calls.length,
    reviewed_calls: reviewed.length,
    meetings_booked: meetings,
    meeting_conversion_rate: contacted ? Math.round((meetings / contacted) * 100) / 100 : 0,
    show_up_rate: contacted ? Math.round(((contacted - noShow) / contacted) * 100) / 100 : 0,
    campaigns_completed: campaignsCompleted,
    brand_risk_level: hunter.brand_risk_level,
    reliability_score: hunter.reliability_score,
    premium_eligible: levelAtLeast(hunter.level, "hunter") && hunter.brand_risk_level === "low",
  };
}

// Sort ranking: highest total_score first, then lower brand risk, then
// reliability. Stable, deterministic — drives the Ranking table default order.
export function sortRanking(rows: RankingRow[]): RankingRow[] {
  return [...rows].sort((a, b) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    const risk = BRAND_RISK_RANK[a.brand_risk_level] - BRAND_RISK_RANK[b.brand_risk_level];
    if (risk !== 0) return risk;
    return b.reliability_score - a.reliability_score;
  });
}

// --- Overview projection ----------------------------------------------------

// Statuses that count as "approved / qualified to represent".
const APPROVED_STATUSES: ReadonlyArray<Hunter["status"]> = ["active", "hunter", "partner"];
// Statuses waiting on an operator's attention before they can progress.
const PENDING_STATUSES: ReadonlyArray<Hunter["status"]> = [
  "aspirant",
  "pending_access_payment",
  "pending_audio",
  "pending_operator_review",
  "ready_for_evaluation",
];

export function buildOverview(
  hunters: Hunter[],
  evaluations: CommercialAccessEvaluation[],
  campaigns: Campaign[],
  leads: Lead[],
): OverviewStats {
  const scored = hunters.filter((h) => h.total_score > 0);
  const avgScore = scored.length
    ? Math.round((scored.reduce((s, h) => s + h.total_score, 0) / scored.length) * 10) / 10
    : 0;

  return {
    total_hunters: hunters.length,
    pending_candidates: hunters.filter((h) => PENDING_STATUSES.includes(h.status)).length,
    pending_access_evaluations: evaluations.filter(
      (e) => e.payment_status === "pending" || e.evaluation_status === "pending",
    ).length,
    active_evaluations: evaluations.filter(
      (e) => e.evaluation_status === "in_progress" || e.evaluation_status === "ready",
    ).length,
    approved_hunters: hunters.filter((h) => APPROVED_STATUSES.includes(h.status)).length,
    rejected_candidates: hunters.filter((h) => h.status === "not_qualified" || h.status === "banned").length,
    average_score: avgScore,
    active_campaigns: campaigns.filter((c) => c.status === "active").length,
    assigned_leads: leads.filter((l) => l.assigned_hunter_id !== null).length,
    meetings_booked: leads.filter((l) => l.status === "meeting_booked").length,
    brand_risk_alerts: hunters.filter(
      (h) => h.brand_risk_level === "high" || h.brand_risk_level === "critical",
    ).length,
  };
}

// Hunters who are a brand liability — surfaced on the overview and flagged in
// ranking so an operator can act (suspend / downgrade) quickly (rule #10).
export function riskyHunters(hunters: Hunter[]): Hunter[] {
  return hunters
    .filter((h) => h.brand_risk_level === "high" || h.brand_risk_level === "critical")
    .sort((a, b) => BRAND_RISK_RANK[b.brand_risk_level] - BRAND_RISK_RANK[a.brand_risk_level]);
}

// Top performers among qualified hunters, for the overview leaderboard.
export function topHunters(hunters: Hunter[], limit = 5): Hunter[] {
  return [...hunters]
    .filter((h) => APPROVED_STATUSES.includes(h.status) || h.level !== "none")
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, limit);
}
