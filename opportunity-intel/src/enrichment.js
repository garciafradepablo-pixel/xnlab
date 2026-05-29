// =============================================================================
// enrichment.js — Research & enrichment adapters (connector layer).
//
// This is the seam where the demo (mock data) becomes a production system
// (live data). Every external source the brief names — Google Maps, LinkedIn,
// press, directories, job boards, funding feeds, websites, social, SEO/web
// analysis — is represented here as an adapter with a stable interface.
//
// In the demo build the adapters return null / pass-through. To go live you
// implement the `fetch*` methods (server-side, with API keys) and the rest of
// the pipeline does not change. The contract is: an adapter takes a partial
// candidate and returns *evidence points* and/or *signal hints*.
//
// IMPORTANT (house ethics): adapters must only attach evidence they can cite.
// An adapter that cannot find a source returns nothing. The system never
// invents evidence — "No evidence = do not claim it."
// =============================================================================

/**
 * @typedef {Object} EvidencePoint
 * @property {string} filter  Which of the ten filters this supports.
 * @property {string} type    e.g. "press", "hiring", "review", "web", "funding"
 * @property {string} source  Human label for the source.
 * @property {string} [url]   Citation URL (required for anything but inference).
 * @property {string} note    What the evidence actually says.
 * @property {1|2|3} tier     Load-bearing weight (see models.EVIDENCE_TIERS).
 */

/**
 * @typedef {Object} EnrichmentResult
 * @property {EvidencePoint[]} evidence
 * @property {Object<string,{level:string,note:string}>} signalHints
 * @property {Object} fields  Contact / profile fields discovered.
 */

const empty = () => ({ evidence: [], signalHints: {}, fields: {} });

/**
 * Base adapter. Subclasses (or live implementations) override `enrich`.
 * `enabled` lets the search config switch sources on/off.
 */
export class SourceAdapter {
  constructor({ name, enabled = true } = {}) {
    this.name = name;
    this.enabled = enabled;
  }
  /** @returns {Promise<EnrichmentResult>} */
  async enrich(/* candidate */) {
    return empty();
  }
}

// ---- Placeholder connectors --------------------------------------------------
// Each documents exactly what a live implementation should return.

export class GoogleMapsAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "google_maps", ...opts });
  }
  // LIVE: Places API → name, address, phone, website, rating, review count,
  // review text (mine for booking/waiting/communication complaints → pain
  // signals), multiple-location detection (capacity signal).
  async enrich() {
    return empty();
  }
}

export class WebsiteAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "website", ...opts });
  }
  // LIVE: fetch the site → detect last-modified / copyright year, mobile
  // responsiveness, page weight, presence of a booking funnel, broken links,
  // Lighthouse/PSI score, schema markup. Feeds visibleTension, activePain,
  // actionableLever.
  async enrich() {
    return empty();
  }
}

export class LinkedInAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "linkedin", ...opts });
  }
  // LIVE: company page → headcount trend, recent hires (marketing/sales/admin
  // = pain), funding posts, named decision makers + profile URLs.
  async enrich() {
    return empty();
  }
}

export class InstagramAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "instagram", ...opts });
  }
  // LIVE: follower count, post cadence (abandoned-during-growth = pain),
  // production quality vs price point (perception tension), DM reachability.
  async enrich() {
    return empty();
  }
}

export class PressAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "press", ...opts });
  }
  // LIVE: news/PR search → openings, expansions, funding, launches in the last
  // 24 months. Strongest "why now" + transition evidence (high tier).
  async enrich() {
    return empty();
  }
}

export class JobsAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "jobs", ...opts });
  }
  // LIVE: job boards → active marketing/sales/ops roles = growth + active pain.
  async enrich() {
    return empty();
  }
}

export class FundingAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "funding", ...opts });
  }
  // LIVE: funding/registry feeds → rounds, new entities, capacity + transition.
  async enrich() {
    return empty();
  }
}

/** Default adapter set, all disabled-for-network in the demo. */
export function defaultAdapters() {
  return [
    new GoogleMapsAdapter(),
    new WebsiteAdapter(),
    new LinkedInAdapter(),
    new InstagramAdapter(),
    new PressAdapter(),
    new JobsAdapter(),
    new FundingAdapter(),
  ];
}

/**
 * Run all enabled adapters over a candidate and merge their results into the
 * candidate. Pure-ish: returns a new object, does not mutate the input.
 *
 * Merge rules:
 *   - Evidence points are concatenated (deduped by url+note).
 *   - Signal hints fill only *missing* signals (never overwrite a human call).
 *   - Contact fields fill only blanks.
 */
export async function enrichCandidate(candidate, adapters = defaultAdapters()) {
  const out = {
    ...candidate,
    evidence: [...(candidate.evidence || [])],
    signals: { ...(candidate.signals || {}) },
  };
  const seen = new Set(out.evidence.map((e) => `${e.url || ""}|${e.note}`));

  for (const adapter of adapters) {
    if (!adapter.enabled) continue;
    let res;
    try {
      res = await adapter.enrich(candidate);
    } catch {
      continue; // a failing source never blocks the pipeline
    }
    for (const ev of res.evidence || []) {
      const k = `${ev.url || ""}|${ev.note}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.evidence.push(ev);
    }
    for (const [key, hint] of Object.entries(res.signalHints || {})) {
      if (!out.signals[key]) out.signals[key] = hint;
    }
    for (const [key, val] of Object.entries(res.fields || {})) {
      if (out[key] == null || out[key] === "") out[key] = val;
    }
  }
  out._enriched = true;
  return out;
}
