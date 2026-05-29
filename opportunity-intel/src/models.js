// =============================================================================
// models.js — Data schema, enumerations and constants.
//
// This module is the single source of truth for the *shape* of the system:
// the ten qualification filters, the signal colour model, the evidence tiers,
// sectors, statuses and the human-readable explanations of what moves each
// score up or down.
//
// Nothing here computes a score. Computation lives in scoring.js. Keeping the
// model declarative means the scoring engine, the seed data, the UI and the
// exporters all agree on the same vocabulary.
// =============================================================================

// -----------------------------------------------------------------------------
// Signal colours
// -----------------------------------------------------------------------------
// Every filter resolves to one of four colours. The colour is a *judgement*
// about the evidence, not the evidence itself.
//
//   green  — strong, concrete evidence in favour
//   yellow — partial / circumstantial evidence
//   red    — negative evidence, or a clear missing requirement
//   grey   — insufficient data to judge (treated conservatively, never neutral)
//
// Two numeric readings exist per colour. The engine blends them 80/20 so the
// system stays conservative (80% of the weight) while still rewarding genuine
// pattern detection (20%). Grey is deliberately low under the conservative
// reading: "we don't know" defaults toward "probably not".
export const LEVELS = {
  green: { label: "Green", conservative: 1.0, aggressive: 1.0, rank: 3 },
  yellow: { label: "Yellow", conservative: 0.45, aggressive: 0.65, rank: 2 },
  grey: { label: "Grey", conservative: 0.2, aggressive: 0.5, rank: 1 },
  red: { label: "Red", conservative: 0.0, aggressive: 0.05, rank: 0 },
};

export const LEVEL_KEYS = ["green", "yellow", "grey", "red"];

// The conservative/aggressive split, as a ratio. 0.8 = 80% conservative.
export const CONSERVATIVE_BIAS = 0.8;

// -----------------------------------------------------------------------------
// Evidence tiers
// -----------------------------------------------------------------------------
// Evidence is weighted by how much it actually proves. The brief's hierarchy:
//   1 evidence  = intuition
//   2 evidences = possibility
//   3 evidences = hypothesis
//   5 evidences = strong opportunity
// We encode each *piece* of evidence with a tier (how load-bearing it is) so
// that one strong press article counts for more than three vague hunches.
export const EVIDENCE_TIERS = {
  1: "Weak / circumstantial",
  2: "Solid / corroborating",
  3: "Strong / load-bearing",
};

// Maps a *count* of evidence points to the brief's confidence vocabulary.
export function evidenceVerdict(count) {
  if (count >= 5) return "strong opportunity";
  if (count >= 3) return "hypothesis";
  if (count >= 2) return "possibility";
  if (count >= 1) return "intuition";
  return "no evidence";
}

// Minimum concrete evidence points required before an opportunity may enter
// the shortlist. The brief is explicit: every selected opportunity must carry
// at least three.
export const MIN_EVIDENCE_FOR_SHORTLIST = 3;

// -----------------------------------------------------------------------------
// The ten qualification filters
// -----------------------------------------------------------------------------
// Order matters: it is the order an analyst should reason in, and the order
// the UI renders. Weights sum to 1.0 and express how much each filter moves
// the Opportunity Confidence Score. "increases" / "decreases" are shown in the
// UI so no score is ever presented without an explanation.
export const FILTERS = [
  {
    key: "transitionSignal",
    label: "Transition signal",
    weight: 0.14,
    question: "Is the company entering a new stage?",
    increases:
      "New office/clinic/restaurant, new city, new investment, new business line, recent rebrand, recent hiring, expansion announcement.",
    decreases:
      "Static company, no movement in 24 months, no announcements, no growth footprint.",
  },
  {
    key: "economicCapacity",
    label: "Economic capacity",
    weight: 0.13,
    question: "Can they pay €1,500–€5,000 without suffering?",
    increases:
      "Premium services, high-ticket offer, multiple locations, visible team, strong facilities, investment/revenue indicators.",
    decreases:
      "Low-margin, survival-mode, single tiny location, discount positioning.",
  },
  {
    key: "visibleTension",
    label: "Visible tension",
    weight: 0.13,
    question: "Mismatch between where they're going and what they communicate?",
    increases:
      "Growth but outdated site, premium product but weak brand, many locations but amateur digital, strong reviews but weak positioning.",
    decreases:
      "Brand already matches ambition; nothing visibly broken or misaligned.",
  },
  {
    key: "actionableLever",
    label: "Actionable lever",
    weight: 0.1,
    question: "Can 01/XN name one clear first move?",
    increases:
      "Obvious repositioning, landing page, web architecture, lead funnel, SEO repair, brand system, intake automation, commercial narrative.",
    decreases:
      "No clear first move; problem is diffuse or outside our service surface.",
  },
  {
    key: "activePainSignal",
    label: "Active pain signal",
    weight: 0.11,
    question: "Is the problem active *now*?",
    increases:
      "Reviews about booking/waiting/clarity, recent marketing/sales hire, weak launch campaign, expansion without infrastructure, broken site, abandoned channels during growth.",
    decreases:
      "No symptoms surfacing; pain is hypothetical or dormant.",
  },
  {
    key: "whyNow",
    label: "Why now",
    weight: 0.1,
    question: "Why call this week specifically?",
    increases:
      "Launch, opening, recent expansion, recent campaign, hiring, new HQ, recent article, new product/service, public growth moment.",
    decreases:
      "No timing trigger; the call could happen any time = it happens never.",
  },
  {
    key: "reachableDecisionMaker",
    label: "Reachable decision maker",
    weight: 0.09,
    question: "Can we reach someone who can say yes?",
    increases:
      "Named founder/CEO/owner/gerente, direct email, LinkedIn profile, direct phone, active Instagram DM.",
    decreases:
      "Only a generic contact form or info@ address; no named human.",
  },
  {
    key: "budgetPriority",
    label: "Budget priority",
    weight: 0.08,
    question: "Important enough to move budget soon?",
    increases:
      "Revenue / patient / client acquisition / trust / premium perception / hiring / expansion directly affected.",
    decreases:
      "Improvement is merely aesthetic; nothing painful enough to fund.",
  },
  {
    key: "strategicFit",
    label: "Strategic fit",
    weight: 0.07,
    question: "The kind of company 01/XN should work with?",
    increases:
      "Premium or growing sector, attractive case study, clean brand universe, serious and ethical business, scalable.",
    decreases:
      "Would damage positioning, ethically off, no case-study upside — even if they can pay.",
  },
  {
    key: "brutalFinalFilter",
    label: "Brutal final filter",
    weight: 0.05,
    question: "If we could only call 3 companies tomorrow — still in?",
    increases: "Survives the cut against everything else on the list.",
    decreases: "Would be dropped the moment a stronger lead appears.",
  },
];

export const FILTER_KEYS = FILTERS.map((f) => f.key);
export const FILTER_BY_KEY = Object.fromEntries(FILTERS.map((f) => [f.key, f]));

// -----------------------------------------------------------------------------
// Score explainers — shown in the UI so a score is never naked.
// -----------------------------------------------------------------------------
export const SCORE_EXPLAINERS = {
  confidence: {
    label: "Opportunity Confidence",
    up: "More green filters, especially high-weight ones (transition, economic capacity, tension).",
    down: "Red or grey filters; any red flag caps the ceiling. Grey is treated as 'probably not'.",
  },
  evidence: {
    label: "Evidence Strength",
    up: "More concrete, load-bearing (tier-3) evidence spread across multiple filters.",
    down: "Few evidence points, weak sources, or evidence clustered on one filter only.",
  },
  conversation: {
    label: "Conversation Probability",
    up: "A reachable named decision maker + active pain + a real timing trigger.",
    down: "Only a generic form, no live pain, no reason this week. Damped by overall confidence.",
  },
  meeting: {
    label: "Meeting Probability",
    up: "Visible tension + budget priority + a clear first lever to anchor the meeting.",
    down: "Always ≤ conversation. Falls when tension is weak or budget priority is low.",
  },
  closing: {
    label: "Closing Potential",
    up: "Economic capacity + budget priority + strategic fit + tension all aligned.",
    down: "Thin capacity, aesthetic-only pain, or weak fit. Red flags pull it down hard.",
  },
};

// -----------------------------------------------------------------------------
// Sectors (initial target pool) and statuses
// -----------------------------------------------------------------------------
export const SECTORS = [
  { key: "health", label: "Health & Clinics" },
  { key: "realestate", label: "Real Estate & Construction" },
  { key: "growth", label: "Growth / Funded / Expanding" },
  { key: "hospitality", label: "Premium Hospitality" },
];
export const SECTOR_BY_KEY = Object.fromEntries(SECTORS.map((s) => [s.key, s]));

export const CLASSIFICATIONS = {
  "01": "01 Agency",
  xn: "XN LAB",
  discard: "Not worth calling",
};

export const ECONOMIC_POTENTIAL = ["low", "medium", "high", "very high"];

export const RECOMMENDATIONS = {
  call_immediately: "Call immediately",
  prepare_audit: "Prepare custom mini-audit first",
  secondary: "Keep as secondary",
  discard: "Discard",
};

export const CALL_STATUSES = [
  "not_called",
  "called",
  "no_answer",
  "interested",
  "meeting_booked",
  "rejected",
  "follow_up",
  "wrong_fit",
];

export const STATUS_LABELS = {
  not_called: "Not called",
  called: "Called",
  no_answer: "No answer",
  interested: "Interested",
  meeting_booked: "Meeting booked",
  rejected: "Rejected",
  follow_up: "Follow-up needed",
  wrong_fit: "Wrong fit",
};

// Canonical tension types the brief enumerates.
export const TENSION_TYPES = {
  growth_structure: "Growth vs structure",
  quality_perception: "Product/service quality vs perception",
  expansion_systems: "Expansion vs systems",
  price_communication: "Premium price vs communication",
  visibility_conversion: "Visibility vs conversion",
  ambition_maturity: "Founder ambition vs brand maturity",
};

// Suggested offer ladder. NOTE: this is an INTERNAL sales tool — prices are
// intentional here. (The public XNLAB brand site forbids published pricing;
// that rule governs public surfaces, not this internal instrument.)
export const OFFER_LADDER = {
  audit: { label: "01 Brand/Web Audit", price: 1500, owner: "01" },
  reposition: { label: "01 Repositioning + Landing Page", price: 3000, owner: "01" },
  web_funnel: { label: "01 Web + Funnel + Automation", price: 5000, owner: "01" },
  xn_transformation: { label: "XN LAB Strategic Transformation", price: 8000, owner: "xn" },
};

// Pipeline stages, in order.
export const PIPELINE_STAGES = [
  { key: "discovered", label: "Discovered" },
  { key: "enriched", label: "Enriched" },
  { key: "filtered", label: "Filtered" },
  { key: "scored", label: "Scored" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "final", label: "Final Top 20" },
];

// Default search configuration.
export const DEFAULT_CONFIG = {
  country: "Spain",
  sectors: SECTORS.map((s) => s.key),
  candidateVolume: 1000,
  finalCount: 20,
  conservatism: 0.8, // 0 = aggressive, 1 = maximally conservative
  minScore: 45,
  xnThreshold: 68, // confidence at/above which a very-high-economic lead becomes XN LAB
};
