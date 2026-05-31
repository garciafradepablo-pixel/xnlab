// ---------------------------------------------------------------------------
// Hunter Network (HN) — Operational Core v1 · domain model
//
// This file is pure TypeScript: no React, no Next, no DB driver. It is the
// contract the whole module is built on, and the seam along which HN can be
// extracted into a standalone product later. Every UI screen and every server
// action reads these types; the persistence layer (see repo.ts) is swappable
// behind an interface so the in-memory store of v1 can become Postgres/Supabase
// without the UI changing.
//
// Naming follows the brief verbatim (snake_case fields) so a future SQL schema
// or external API can map 1:1. Enums are string unions — cheap to serialise,
// exhaustively checkable, and stable as DB enum values.
// ---------------------------------------------------------------------------

// --- Shared primitives ------------------------------------------------------

export type ID = string;
export type ISODate = string; // ISO-8601 timestamp

// --- Hunter -----------------------------------------------------------------

// The candidate's position in the funnel. Ordered roughly by progression, but
// terminal/punitive states (not_qualified, suspended, banned) sit at the end.
// `aspirant` → … → a level-bearing status (trainee … partner). Note: several
// statuses double as levels once qualified — that is intentional in the brief.
export type HunterStatus =
  | "aspirant"
  | "pending_access_payment"
  | "pending_audio"
  | "pending_operator_review"
  | "ready_for_evaluation"
  | "in_evaluation"
  | "under_review"
  | "not_qualified"
  | "trainee"
  | "junior"
  | "active"
  | "hunter"
  | "partner"
  | "suspended"
  | "banned";

// Performance tier. `none` until the evaluation assigns one. Drives campaign
// eligibility (see logic.ts → meetsCampaignLevel).
export type HunterLevel = "none" | "trainee" | "junior" | "active" | "hunter" | "partner";

// How much of a liability this person is to the brands they would represent.
// The single most important guard in the system — brand protection beats volume.
export type BrandRiskLevel = "low" | "medium" | "high" | "critical";

export type HunterSource =
  | "direct"
  | "referral"
  | "network_window"
  | "social"
  | "ads"
  | "import"
  | "other";

export interface Hunter {
  id: ID;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  city: string;
  language: string; // spoken languages, free text e.g. "ES, EN"
  experience_summary: string;
  availability: string;
  timezone: string;
  audio_url: string | null;
  source: HunterSource;
  status: HunterStatus;
  level: HunterLevel;
  total_score: number; // 0–100, the rolling/headline score
  brand_risk_level: BrandRiskLevel;
  reliability_score: number; // 0–100, show-up / discipline composite
  notes: string;
  created_at: ISODate;
  updated_at: ISODate;
}

// --- Commercial Access Evaluation -------------------------------------------

// Paying the access fee unlocks the evaluation. It never buys campaign access.
// `not_required` / `waived` exist so internal or referred candidates can skip
// the fee without faking a payment.
export type PaymentStatus = "not_required" | "pending" | "paid" | "failed" | "refunded" | "waived";

export type EvaluationStatus =
  | "pending"
  | "ready"
  | "in_progress"
  | "completed"
  | "under_review"
  | "failed"
  | "cancelled";

// The classification verdict. `partner_review` is a flag, never an automatic
// outcome — partner status is manual only (critical business rule #5).
export type EvaluationResult = "rejected" | "trainee" | "junior" | "active" | "hunter" | "partner_review";

export interface CommercialAccessEvaluation {
  id: ID;
  hunter_id: ID;
  payment_status: PaymentStatus;
  access_fee_amount: number; // internal config value; never published
  evaluation_status: EvaluationStatus;
  assigned_test_leads_count: number; // up to the configured max (default 5)
  completed_calls_count: number;
  average_score: number; // mean of completed test-call total_scores, 0–100
  final_score: number; // average + operator adjustments, 0–100
  result: EvaluationResult | null; // null until completed/decided
  operator_feedback: string;
  decision_reason: string;
  created_at: ISODate;
  updated_at: ISODate;
}

// --- Test Call --------------------------------------------------------------

// Thirteen scored dimensions, each 0–10. total_score is normalised to 100
// (see logic.ts → testCallTotal). This is the unit of evidence behind every
// classification decision — every call is scoreable and reviewable.
export type CallOutcome =
  | "no_answer"
  | "bad_contact"
  | "conversation_started"
  | "interested"
  | "meeting_booked"
  | "not_interested"
  | "do_not_contact"
  | "callback_requested"
  | "disqualified"
  | "operator_review_required";

// The 13 scoring dimensions, isolated so logic.ts can iterate them and the UI
// can render one input per key without repeating the list.
export interface TestCallScores {
  voice_score: number;
  clarity_score: number;
  energy_score: number;
  naturalness_score: number;
  respect_score: number;
  conversation_control_score: number;
  product_understanding_score: number;
  qualification_questions_score: number;
  objection_handling_score: number;
  meeting_close_score: number;
  brand_care_score: number;
  crm_accuracy_score: number;
  discipline_score: number;
}

export interface TestCall extends TestCallScores {
  id: ID;
  evaluation_id: ID;
  hunter_id: ID;
  lead_id: ID | null;
  campaign_id: ID | null;
  recording_url: string | null;
  call_date: ISODate;
  duration_seconds: number;
  call_outcome: CallOutcome;
  notes: string;
  total_score: number; // normalised 0–100
  brand_risk_notes: string;
  operator_reviewed: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

// --- Campaign ---------------------------------------------------------------

export type ClientType = "internal" | "external";
export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type CampaignRiskLevel = "low" | "medium" | "high" | "premium";

export interface Campaign {
  id: ID;
  name: string;
  client_name: string;
  client_type: ClientType;
  service_to_sell: string;
  offer_summary: string;
  niche: string;
  market_country: string;
  market_language: string;
  script: string;
  objective: string;
  commission_model: string; // descriptor, never a published price (rule 5b)
  minimum_level_required: HunterLevel; // the access gate for this campaign
  campaign_risk_level: CampaignRiskLevel;
  status: CampaignStatus;
  created_at: ISODate;
  updated_at: ISODate;
}

// --- Lead -------------------------------------------------------------------

export type LeadStatus =
  | "new"
  | "assigned"
  | "called"
  | "no_answer"
  | "interested"
  | "meeting_booked"
  | "not_interested"
  | "do_not_contact"
  | "closed_won"
  | "closed_lost"
  | "invalid";

export interface Lead {
  id: ID;
  campaign_id: ID;
  company_name: string;
  contact_name: string;
  role: string;
  phone: string;
  email: string;
  website: string;
  sector: string;
  country: string;
  city: string;
  status: LeadStatus;
  assigned_hunter_id: ID | null;
  call_result: string;
  next_action: string;
  last_contacted_at: ISODate | null;
  notes: string;
  created_at: ISODate;
  updated_at: ISODate;
}

// --- Operator decision log --------------------------------------------------

// Every evaluation must leave an internal decision trail (business rule #8).
// One append-only entry per consequential operator action, across any entity.
export type DecisionAction =
  | "status_change"
  | "level_change"
  | "evaluation_created"
  | "evaluation_decided"
  | "call_reviewed"
  | "brand_risk_flagged"
  | "lead_assigned"
  | "note_added"
  | "suspended"
  | "banned";

export interface DecisionLogEntry {
  id: ID;
  hunter_id: ID | null;
  campaign_id: ID | null;
  evaluation_id: ID | null;
  action: DecisionAction;
  summary: string; // human-readable one-liner
  operator: string; // who acted (free text in v1)
  created_at: ISODate;
}

// --- Settings ---------------------------------------------------------------

// Internal config object. Not a published surface — access fees live here and
// never on any public page (rule 5b). Thresholds drive logic.ts classification.
export interface HNSettings {
  default_access_fee_amount: number;
  default_currency: string;
  default_test_calls: number; // default leads/slots per evaluation
  score_thresholds: {
    // minimum final_score required to reach each level
    trainee: number;
    junior: number;
    active: number;
    hunter: number;
  };
  level_definitions: Record<Exclude<HunterLevel, "none">, string>;
  brand_risk_definitions: Record<BrandRiskLevel, string>;
  // Which campaign risk levels each hunter level may represent.
  campaign_access_rules: Record<Exclude<HunterLevel, "none">, CampaignRiskLevel[]>;
  consent_note: string; // legal/consent placeholder
}

// --- Aggregate / view models ------------------------------------------------

// Ranking is a derived view, not a stored entity — computed from calls + hunter
// in logic.ts. Kept here so UI and logic agree on the shape.
export interface RankingRow {
  hunter_id: ID;
  name: string;
  country: string;
  level: HunterLevel;
  total_score: number;
  average_call_score: number;
  total_calls: number;
  reviewed_calls: number;
  meetings_booked: number;
  meeting_conversion_rate: number; // 0–1
  show_up_rate: number; // 0–1
  campaigns_completed: number;
  brand_risk_level: BrandRiskLevel;
  reliability_score: number;
  premium_eligible: boolean;
}

// The Overview command-center snapshot. Every figure here is derived in
// logic.ts → buildOverview so the dashboard stays a pure projection of state.
export interface OverviewStats {
  total_hunters: number;
  pending_candidates: number;
  pending_access_evaluations: number;
  active_evaluations: number;
  approved_hunters: number;
  rejected_candidates: number;
  average_score: number;
  active_campaigns: number;
  assigned_leads: number;
  meetings_booked: number;
  brand_risk_alerts: number;
}
