// ---------------------------------------------------------------------------
// Hunter Network (HN) — Operational Core v1 · default settings
//
// The internal config object. This is NOT a public surface: the access fee
// lives here and must never appear on any public page (house rule 5b). The
// thresholds here drive classification in logic.ts; changing one number here
// changes how every future evaluation is graded.
// ---------------------------------------------------------------------------

import type { HNSettings } from "./types";

export const DEFAULT_SETTINGS: HNSettings = {
  default_access_fee_amount: 0, // internal value only; communicated privately
  default_currency: "EUR",
  default_test_calls: 5,
  // Floors from the brief: <60 not_qualified · 60 trainee · 75 junior ·
  // 85 active · 95 hunter. Partner is manual only and has no threshold.
  score_thresholds: {
    trainee: 60,
    junior: 75,
    active: 85,
    hunter: 95,
  },
  level_definitions: {
    trainee: "Evaluated, not yet representing brands. Practice campaigns only.",
    junior: "Cleared for low-risk campaigns under supervision.",
    active: "Standard real campaigns. The working core of the network.",
    hunter: "High-value campaigns. Proven brand care and conversion.",
    partner: "Premium campaigns or team leadership. Manual appointment only.",
  },
  brand_risk_definitions: {
    low: "Represents the brand cleanly. No concerns.",
    medium: "Minor concerns — watch, coach, re-review.",
    high: "Notable risk to brand. Restrict to low-stakes campaigns.",
    critical: "Cannot represent any brand. Suspend or remove.",
  },
  // Which campaign risk bands each level may represent. Mirrors the brief's
  // minimum-level access rules, expressed as the inverse (level → allowed
  // bands) so the access check can read it directly.
  campaign_access_rules: {
    trainee: ["low"], // practice only
    junior: ["low"],
    active: ["low", "medium"],
    hunter: ["low", "medium", "high"],
    partner: ["low", "medium", "high", "premium"],
  },
  consent_note:
    "Placeholder — recording consent, data handling and evaluation terms are confirmed with each candidate before the Commercial Access Evaluation begins. Not legal copy.",
};
