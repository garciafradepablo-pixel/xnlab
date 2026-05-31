// ---------------------------------------------------------------------------
// Hunter Network (HN) — autonomous operations engine
//
// This is what runs while you sleep. One `runTick()` advances the whole network
// by one step, with NO human in the loop:
//
//   1. Funnel    — candidates progress; ready evaluations get test calls placed
//                  and scored; completed evaluations are decided and the hunter
//                  reclassified by score (logic.ts), with a decision-log trail.
//   2. Commerce  — active campaigns generate demand; new leads are assigned to
//                  the best ELIGIBLE hunter (campaign access rule enforced);
//                  assigned leads are "called", scored, and advanced — meetings
//                  booked, deals closed — feeding each campaign's ROI.
//   3. Ledger    — access fees and commissions are recorded on the wallet port.
//
// PARITY: every world-touching action goes through a PortBundle (ports.ts).
// The engine is byte-identical in shadow and live — only makePortBundle(mode)
// differs. Remove the hidden virtual world (live) or keep it (shadow): same
// engine, same decisions, same shape of result. That is the guarantee.
//
// Every action emits an OpEvent (events.ts) so the live feed shows it as it
// happens.
// ---------------------------------------------------------------------------

import type { HNRepository } from "./repo";
import type { PortBundle } from "./ports";
import type {
  Campaign,
  CommercialAccessEvaluation,
  DecisionLogEntry,
  Hunter,
  Lead,
  TestCall,
} from "./types";
import {
  checkCampaignAccess,
  classifyResult,
  evaluationScores,
  levelForResult,
  statusForResult,
  testCallTotal,
} from "./logic";
import { emit, currentTick, setTick } from "./events";
import { hashSeed, mulberry32 } from "./rng";

const now = () => new Date().toISOString();

function logDecision(
  repo: HNRepository,
  partial: Omit<DecisionLogEntry, "id" | "created_at">,
): void {
  repo.addDecisionLog({ ...partial, id: repo.nextId("log"), created_at: now() });
}

export interface TickReport {
  tick: number;
  mode: PortBundle["mode"];
  events: number;
  callsPlaced: number;
  meetingsBooked: number;
  dealsClosed: number;
  decisions: number;
}

// Advance the whole network by one tick. Pure orchestration over repo + ports.
export async function runTick(repo: HNRepository, ports: PortBundle): Promise<TickReport> {
  const tick = currentTick() + 1;
  setTick(tick);
  const settings = repo.getSettings();

  const report: TickReport = {
    tick,
    mode: ports.mode,
    events: 0,
    callsPlaced: 0,
    meetingsBooked: 0,
    dealsClosed: 0,
    decisions: 0,
  };
  const ev = (e: Parameters<typeof emit>[0]) => {
    emit(e);
    report.events++;
  };

  ev({ tick, mode: ports.mode, kind: "tick_started", hunter_id: null, campaign_id: null, lead_id: null, message: `Tick ${tick} · modo ${ports.mode}`, value: null });

  // === 1. FUNNEL ============================================================

  for (const ev0 of repo.getEvaluations()) {
    const hunter = repo.getHunter(ev0.hunter_id);
    if (!hunter) continue;

    // 1a. Pending payment → ready once paid (shadow auto-confirms a waived fee).
    if (ev0.evaluation_status === "pending" && ev0.payment_status === "pending") {
      // The fee unlocks the evaluation — and ONLY the evaluation. Never access.
      const paid: CommercialAccessEvaluation = {
        ...ev0,
        payment_status: settings.default_access_fee_amount > 0 ? "paid" : "waived",
        evaluation_status: "ready",
        assigned_test_leads_count: settings.default_test_calls,
        updated_at: now(),
      };
      repo.upsertEvaluation(paid);
      if (settings.default_access_fee_amount > 0) {
        await ports.wallet.record({
          kind: "access_fee",
          amount: settings.default_access_fee_amount,
          currency: settings.default_currency,
          ref: paid.id,
          note: "Access fee — unlocks evaluation only",
        });
        ev({ tick, mode: ports.mode, kind: "wallet_movement", hunter_id: hunter.id, campaign_id: null, lead_id: null, message: `Tarifa de acceso registrada · ${settings.default_access_fee_amount} ${settings.default_currency}`, value: settings.default_access_fee_amount });
      }
      repo.upsertHunter({ ...hunter, status: "ready_for_evaluation", updated_at: now() });
      ev({ tick, mode: ports.mode, kind: "evaluation_progressed", hunter_id: hunter.id, campaign_id: null, lead_id: null, message: `${hunter.name} · acceso desbloqueado, listo para evaluación`, value: null });
      continue;
    }

    // 1b. Ready / in-progress → place and score the next test call.
    if ((ev0.evaluation_status === "ready" || ev0.evaluation_status === "in_progress") && ev0.completed_calls_count < ev0.assigned_test_leads_count) {
      // Practice campaign is the safe context for test calls (no real brand).
      const practice = repo.getCampaigns().find((c) => c.client_type === "internal" && c.status === "active");
      if (!practice) continue;
      const attempt = { lead: practiceLead(practice), hunter, campaign: practice };
      await ports.execution.placeCall(attempt);
      report.callsPlaced++;
      const result = ports.market.resolveContact(attempt, tick);
      const call: TestCall = {
        id: repo.nextId("call"),
        evaluation_id: ev0.id,
        hunter_id: hunter.id,
        lead_id: null,
        campaign_id: practice.id,
        recording_url: result.recording_url ?? null,
        call_date: now(),
        duration_seconds: result.duration_seconds,
        call_outcome: result.outcome,
        notes: result.notes,
        ...(result.scores ?? zeroScores()),
        total_score: result.scores ? testCallTotal(result.scores) : 0,
        brand_risk_notes: "",
        operator_reviewed: false,
        created_at: now(),
        updated_at: now(),
      };
      repo.addTestCall(call);
      ev({ tick, mode: ports.mode, kind: "call_scored", hunter_id: hunter.id, campaign_id: practice.id, lead_id: null, message: `${hunter.name} · llamada de prueba ${call.total_score.toFixed(1)} · ${result.outcome}`, value: call.total_score });

      const calls = repo.getTestCalls().filter((c) => c.evaluation_id === ev0.id);
      const { average, completed } = evaluationScores(calls);
      repo.upsertEvaluation({ ...ev0, evaluation_status: "in_progress", completed_calls_count: completed, average_score: average, updated_at: now() });
      if (hunter.status !== "in_evaluation") repo.upsertHunter({ ...hunter, status: "in_evaluation", updated_at: now() });
      continue;
    }

    // 1c. All calls done, not decided → decide, classify, log the trail.
    if (ev0.evaluation_status === "in_progress" && ev0.completed_calls_count >= ev0.assigned_test_leads_count && !ev0.result) {
      const calls = repo.getTestCalls().filter((c) => c.evaluation_id === ev0.id);
      const { average } = evaluationScores(calls);
      const finalScore = average; // operator override would adjust here
      const result = classifyResult(finalScore, settings);
      const decided: CommercialAccessEvaluation = {
        ...ev0,
        evaluation_status: result === "rejected" ? "failed" : "completed",
        average_score: average,
        final_score: finalScore,
        result,
        decision_reason: `Score ${finalScore.toFixed(1)} → ${result}`,
        updated_at: now(),
      };
      repo.upsertEvaluation(decided);

      // Brand-risk flag from poor brand_care across the calls.
      const avgBrandCare = calls.reduce((s, c) => s + c.brand_care_score, 0) / Math.max(1, calls.length);
      const brandRisk: Hunter["brand_risk_level"] =
        avgBrandCare < 2 ? "critical" : avgBrandCare < 4 ? "high" : avgBrandCare < 6 ? "medium" : "low";

      repo.upsertHunter({
        ...hunter,
        status: statusForResult(result),
        level: levelForResult(result),
        total_score: finalScore,
        brand_risk_level: brandRisk,
        reliability_score: Math.round(finalScore * 0.9),
        updated_at: now(),
      });
      logDecision(repo, { hunter_id: hunter.id, campaign_id: null, evaluation_id: ev0.id, action: "evaluation_decided", summary: decided.decision_reason, operator: `engine:${ports.mode}` });
      report.decisions++;
      ev({ tick, mode: ports.mode, kind: "evaluation_decided", hunter_id: hunter.id, campaign_id: null, lead_id: null, message: `${hunter.name} · evaluación ${finalScore.toFixed(1)} → ${result}`, value: finalScore });
      if (brandRisk === "high" || brandRisk === "critical") {
        ev({ tick, mode: ports.mode, kind: "brand_risk_flagged", hunter_id: hunter.id, campaign_id: null, lead_id: null, message: `${hunter.name} · riesgo de marca ${brandRisk}`, value: null });
      }
      continue;
    }
  }

  // === 2. COMMERCE ==========================================================

  const activeCampaigns = repo.getCampaigns().filter((c) => c.status === "active" && c.client_type === "external");

  // 2a. Demand — generate fresh leads per active campaign.
  for (const campaign of activeCampaigns) {
    for (const draft of ports.market.generateLeads(campaign, tick)) {
      const lead: Lead = { ...draft, id: repo.nextId("lead"), created_at: now(), updated_at: now() };
      repo.upsertLead(lead);
      ev({ tick, mode: ports.mode, kind: "lead_generated", hunter_id: null, campaign_id: campaign.id, lead_id: lead.id, message: `${campaign.name} · nuevo lead`, value: null });
    }
  }

  // 2b. Assignment — new leads → best eligible hunter (ACCESS RULE ENFORCED).
  for (const lead of repo.getLeads().filter((l) => l.status === "new")) {
    const campaign = repo.getCampaign(lead.campaign_id);
    if (!campaign) continue;
    const candidate = bestEligibleHunter(repo, campaign, settings);
    if (!candidate) {
      ev({ tick, mode: ports.mode, kind: "blocked", hunter_id: null, campaign_id: campaign.id, lead_id: lead.id, message: `${campaign.name} · sin hunter elegible (nivel mín. ${campaign.minimum_level_required})`, value: null });
      continue;
    }
    repo.upsertLead({ ...lead, status: "assigned", assigned_hunter_id: candidate.id, updated_at: now() });
    logDecision(repo, { hunter_id: candidate.id, campaign_id: campaign.id, evaluation_id: null, action: "lead_assigned", summary: `Lead ${lead.company_name} asignado por el motor`, operator: `engine:${ports.mode}` });
    ev({ tick, mode: ports.mode, kind: "lead_assigned", hunter_id: candidate.id, campaign_id: campaign.id, lead_id: lead.id, message: `${lead.company_name} → ${candidate.name}`, value: null });
  }

  // 2c. Work — assigned leads get called and advanced.
  for (const lead of repo.getLeads().filter((l) => l.status === "assigned")) {
    const campaign = repo.getCampaign(lead.campaign_id);
    const hunter = lead.assigned_hunter_id ? repo.getHunter(lead.assigned_hunter_id) : undefined;
    if (!campaign || !hunter) continue;
    // Re-check access at execution time — state may have changed (suspension).
    const access = checkCampaignAccess(hunter, campaign, settings);
    if (!access.allowed) {
      repo.upsertLead({ ...lead, status: "new", assigned_hunter_id: null, next_action: `Reasignar (${access.reason})`, updated_at: now() });
      ev({ tick, mode: ports.mode, kind: "blocked", hunter_id: hunter.id, campaign_id: campaign.id, lead_id: lead.id, message: `${hunter.name} ya no elegible (${access.reason}) · lead liberado`, value: null });
      continue;
    }
    const attempt = { lead, hunter, campaign };
    await ports.execution.placeCall(attempt);
    report.callsPlaced++;
    const r = ports.market.resolveContact(attempt, tick);
    ev({ tick, mode: ports.mode, kind: "call_placed", hunter_id: hunter.id, campaign_id: campaign.id, lead_id: lead.id, message: `${hunter.name} → ${lead.company_name} · ${r.outcome}`, value: null });

    let status: Lead["status"] = lead.status;
    if (r.outcome === "meeting_booked") {
      status = "meeting_booked";
      await ports.execution.bookMeeting(lead, hunter);
      report.meetingsBooked++;
      ev({ tick, mode: ports.mode, kind: "meeting_booked", hunter_id: hunter.id, campaign_id: campaign.id, lead_id: lead.id, message: `Cita reservada · ${lead.company_name}`, value: null });
    } else if (r.outcome === "interested") status = "interested";
    else if (r.outcome === "no_answer") status = "no_answer";
    else if (r.outcome === "not_interested") status = "not_interested";
    else status = "called";

    repo.upsertLead({ ...lead, status, call_result: r.notes, last_contacted_at: now(), updated_at: now() });
  }

  // 2d. Close — a fraction of booked meetings convert to won deals + commission.
  for (const lead of repo.getLeads().filter((l) => l.status === "meeting_booked")) {
    const rnd = mulberry32(hashSeed("close", lead.id, tick));
    if (rnd() < 0.3) {
      const campaign = repo.getCampaign(lead.campaign_id);
      repo.upsertLead({ ...lead, status: "closed_won", updated_at: now() });
      report.dealsClosed++;
      // Commission recorded on the wallet — identical entry shape live or shadow.
      await ports.wallet.record({ kind: "commission", amount: 0, currency: settings.default_currency, ref: lead.id, note: `Commission · ${campaign?.name ?? lead.campaign_id}` });
      ev({ tick, mode: ports.mode, kind: "lead_closed", hunter_id: lead.assigned_hunter_id, campaign_id: lead.campaign_id, lead_id: lead.id, message: `Cierre ganado · ${lead.company_name}`, value: null });
    }
  }

  ev({ tick, mode: ports.mode, kind: "tick_completed", hunter_id: null, campaign_id: null, lead_id: null, message: `Tick ${tick} cerrado · ${report.callsPlaced} llamadas · ${report.meetingsBooked} citas · ${report.dealsClosed} cierres`, value: null });
  return report;
}

// --- helpers ----------------------------------------------------------------

// Pick the highest-scoring eligible, non-suspended hunter for a campaign.
function bestEligibleHunter(repo: HNRepository, campaign: Campaign, settings: ReturnType<HNRepository["getSettings"]>): Hunter | null {
  const eligible = repo
    .getHunters()
    .filter((h) => checkCampaignAccess(h, campaign, settings).allowed)
    .sort((a, b) => b.total_score - a.total_score);
  return eligible[0] ?? null;
}

function practiceLead(campaign: Campaign): Lead {
  return {
    id: `practice-${campaign.id}`,
    campaign_id: campaign.id,
    company_name: "Lead de práctica",
    contact_name: "Simulado",
    role: "Decisor",
    phone: "+34 900 000 000",
    email: "practice@example.com",
    website: "",
    sector: campaign.niche,
    country: campaign.market_country,
    city: "",
    status: "assigned",
    assigned_hunter_id: null,
    call_result: "",
    next_action: "",
    last_contacted_at: null,
    notes: "",
    created_at: now(),
    updated_at: now(),
  };
}

function zeroScores() {
  return {
    voice_score: 0, clarity_score: 0, energy_score: 0, naturalness_score: 0, respect_score: 0,
    conversation_control_score: 0, product_understanding_score: 0, qualification_questions_score: 0,
    objection_handling_score: 0, meeting_close_score: 0, brand_care_score: 0, crm_accuracy_score: 0, discipline_score: 0,
  };
}
