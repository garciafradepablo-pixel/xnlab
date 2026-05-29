// =============================================================================
// pipeline.js — Orchestrates the funnel: discover → enrich → filter → score →
// shortlist → final Top N, and reports counts at each stage.
//
// The pipeline is deterministic and synchronous-friendly. Enrichment is async
// (adapters), everything else is pure. The demo feeds it the seeded dataset;
// a live system feeds it discovery output and real adapters — same funnel.
// =============================================================================

import { scoreOpportunity } from "./scoring.js";
import { enrichCandidate, defaultAdapters } from "./enrichment.js";
import { DEFAULT_CONFIG } from "./models.js";

/**
 * Attach a `scores` object to each candidate. Pure.
 */
export function scoreAll(candidates, config) {
  return candidates.map((c) => ({ ...c, scores: scoreOpportunity(c, config) }));
}

/**
 * Rank scored candidates. Sort is multi-key and deliberately conservative:
 *   1. shortlist-eligible first
 *   2. higher confidence
 *   3. higher evidence strength (ties broken by proof, not optimism)
 *   4. higher closing potential
 *   5. fewer red flags
 */
export function rank(scored) {
  return [...scored].sort((a, b) => {
    const A = a.scores;
    const B = b.scores;
    if (A.shortlistEligible !== B.shortlistEligible)
      return A.shortlistEligible ? -1 : 1;
    if (B.confidence !== A.confidence) return B.confidence - A.confidence;
    if (B.evidence !== A.evidence) return B.evidence - A.evidence;
    if (B.closing !== A.closing) return B.closing - A.closing;
    return A.redCount - B.redCount;
  });
}

/**
 * Full pipeline run. Returns the ranked list, the final Top N, and a per-stage
 * count summary for the pipeline view.
 *
 * @param {object[]} candidates Raw candidates (the seed, or discovery output).
 * @param {object}   config     Search configuration.
 * @param {object[]} adapters   Enrichment adapters (default = demo no-ops).
 */
export async function runPipeline(
  candidates,
  config = DEFAULT_CONFIG,
  adapters = defaultAdapters()
) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // 1. Discover — already in hand (seed / discovery output).
  const discovered = candidates;

  // 2. Enrich — adapters attach evidence/signals/fields.
  const enriched = [];
  for (const c of discovered) {
    enriched.push(await enrichCandidate(c, adapters));
  }

  // 3 + 4. Filter & score — scoring computes the discard decision.
  const scored = scoreAll(enriched, cfg);

  // A candidate is "filtered" (survives) if it is not an outright discard.
  const filtered = scored.filter((c) => c.scores.classification !== "discard");

  // 5. Shortlist — eligible (≥3 evidence, <4 reds, not discard) and above the
  //    minimum confidence threshold.
  const shortlisted = filtered.filter(
    (c) => c.scores.shortlistEligible && c.scores.confidence >= cfg.minScore
  );

  // 6. Final — rank the shortlist, take the top N.
  const ranked = rank(shortlisted);
  const final = ranked.slice(0, cfg.finalCount).map((c, i) => ({
    ...c,
    ranking: i + 1,
  }));

  return {
    config: cfg,
    ranked, // full ranked shortlist (may exceed finalCount)
    final, // the Top N with ranking attached
    counts: {
      discovered: discovered.length,
      enriched: enriched.length,
      filtered: filtered.length,
      scored: scored.length,
      shortlisted: shortlisted.length,
      final: final.length,
    },
    // Everything scored, ranked, for the "all candidates" table view.
    all: rank(scored).map((c, i) => ({ ...c, ranking: i + 1 })),
  };
}
