// =============================================================================
// researched.js — REAL, researched opportunities (Spain).
//
// This dataset is intentionally EMPTY until populated with genuinely verified,
// cited leads. It is the production counterpart to the synthetic `seed.js`.
//
// Why empty? The system's first rule is absolute: "No evidence = do not claim
// it." A real lead may only be added here once it carries at least THREE
// concrete evidence points, each with a real, working citation URL. Inventing
// plausible-looking entries would violate the exact discipline the tool exists
// to enforce — so this file ships empty rather than fabricated.
//
// ── How to populate ─────────────────────────────────────────────────────────
// Two honest paths, no fabrication:
//
//   1. Live connectors (automated). Run discovery + enrichment with real
//      sources and API keys; the WebsiteAdapter already works against any
//      reachable URL:
//          node bin/run.mjs --enrich
//      Wire discovery (Google Places / directories) ahead of it to build the
//      ~1,000 candidate pool, then export and curate the survivors into here.
//
//   2. Manual research (analyst). For each candidate, follow the protocol
//      below and only keep it if it clears the 3-evidence bar.
//
// ── Research protocol (per lead) ────────────────────────────────────────────
//   • Transition signal — find a dated press/opening/expansion/funding source.
//   • Why now — the date of that source is the timing hook.
//   • Economic capacity — multi-location / premium / funding amount, cited.
//   • Decision maker — named founder/CEO/owner + a real LinkedIn/contact.
//   • Tension / pain / lever — VERIFY before claiming. Fetch the site (stale
//     copyright? no booking CTA? not responsive?); read reviews. If you cannot
//     verify, set the signal to GREY and the evidence tier low — do not invent.
//   Be conservative: a real lead with three solid citations and several greys
//   SHOULD score below the synthetic all-green archetypes. That is correct.
//
// ── Entry shape (same schema as seed.js) ────────────────────────────────────
//   Use the helper below. Signal shorthand `S` is the 10-char string mapping to
//   models.FILTER_KEYS in order; codes G/Y/R/X = green/yellow/red/grey.
//
//   mkReal({
//     id, company, sector, subsector, city, region,
//     website, instagram, linkedin, googleMaps, phone, email,
//     dm: { name, role, linkedin },
//     S: "YGX GYR ...",            // be conservative; grey what you can't verify
//     evidence: [ ev("transitionSignal","press","El Diario",
//                    "Abrió segunda sede en …, mar 2025", 3,
//                    "https://real-source.example/article") , … ],   // ≥3, real URLs
//     tensions: ["growth_structure", …],
//     thesis, summary, whyNow, whyBeforeOthers, blindSpot, firstLever,
//     offer: "reposition", callOpening, objection, objectionResponse,
//     reasonsNotToCall: [...], invalidators: [...],
//     researchedAt: "2026-05-29", sources: ["https://…", "https://…"],
//   })
// =============================================================================

import { FILTER_KEYS } from "../models.js";

const CODE = { G: "green", Y: "yellow", R: "red", X: "grey" };

function expandSignals(s) {
  const out = {};
  const chars = String(s || "").replace(/\s/g, "").split("");
  FILTER_KEYS.forEach((key, i) => {
    out[key] = { level: CODE[chars[i]] || "grey" };
  });
  return out;
}

/** Evidence helper — a real citation URL is REQUIRED for researched leads. */
export const ev = (filter, type, source, note, tier, url) => {
  if (!url) {
    // Loud signal during development that an entry is missing its citation.
    console.warn(`[researched] evidence on "${filter}" has no citation URL — it must not ship.`);
  }
  return { filter, type, source, note, tier, url: url || null };
};

/** Normalise a researched row. `synthetic` is false; carries provenance. */
export function mkReal(row) {
  const { S, dm, offer, researchedAt, sources, ...rest } = row;
  return {
    country: "Spain",
    synthetic: false,
    researched: true,
    researchedAt: researchedAt || null,
    sources: sources || [],
    signals: expandSignals(S),
    decisionMaker: dm,
    suggestedOfferKey: offer,
    ...rest,
  };
}

// ── The researched pilot. Empty until verified leads exist. ─────────────────
export const RESEARCHED = [
  // (No verified leads yet — see "How to populate" above.)
];

export default RESEARCHED;
