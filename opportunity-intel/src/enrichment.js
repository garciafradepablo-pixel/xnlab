// =============================================================================
// enrichment.js — Research & enrichment adapters (connector layer).
//
// This is the seam where the demo (mock data) becomes a production system
// (live data). Every external source the brief names — Google Maps, LinkedIn,
// press, directories, job boards, funding feeds, websites, social, SEO/web
// analysis — is represented here as an adapter with a stable interface.
//
// The WebsiteAdapter is a *real* implementation: given a reachable URL it
// fetches the page and turns observable facts into cited evidence. The other
// adapters are documented stubs you implement (server-side, with API keys) to
// go fully live; the rest of the pipeline does not change.
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

// ---- Website adapter: a REAL implementation ---------------------------------

export class WebsiteAdapter extends SourceAdapter {
  constructor(opts = {}) {
    super({ name: "website", ...opts });
    // Copyright years older than this (relative to now) read as staleness.
    this.staleAfterYears = opts.staleAfterYears ?? 2;
    this.timeoutMs = opts.timeoutMs ?? 8000;
  }

  // Fetches the candidate's site and turns observable facts into cited
  // evidence. The analysis is pure (analyzeWebsiteHtml) so it is testable
  // without a network; this method only handles fetch + plumbing.
  async enrich(candidate) {
    const url = candidate?.website;
    if (!url || typeof fetch === "undefined") return empty();
    let html;
    try {
      const ctrl =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), this.timeoutMs) : null;
      const res = await fetch(url, { signal: ctrl?.signal, redirect: "follow" });
      if (timer) clearTimeout(timer);
      if (!res.ok) return empty();
      html = await res.text();
    } catch {
      return empty();
    }
    const findings = analyzeWebsiteHtml(html, {
      staleAfterYears: this.staleAfterYears,
    });
    return findingsToResult(findings, url);
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

// ---- Pure website analysis (no network — unit-testable) ---------------------

const CURRENT_YEAR = new Date().getFullYear();

// Booking / conversion intent keywords (EN + ES). Absence on a service
// business is a lever signal.
const BOOKING_KEYWORDS = [
  "reservar", "reserva", "pedir cita", "cita previa", "agendar", "agenda",
  "book now", "book a", "booking", "schedule", "appointment", "request a quote",
  "solicita", "presupuesto",
];

// Word-boundary matcher so "reserva" does NOT match the ubiquitous footer
// phrase "todos los derechos reservados". Naive substring matching here would
// produce false positives (thinking a site has a booking CTA when it only has a
// copyright notice), which would silently hide a real conversion lever.
const BOOKING_RE = new RegExp(
  "\\b(" +
    BOOKING_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") +
    ")\\b",
  "i"
);

// Template / DIY builders. Not damning alone, but a perception signal for a
// premium business.
const GENERATOR_HINTS = [
  ["wix", "Wix"],
  ["squarespace", "Squarespace"],
  ["wordpress", "WordPress"],
  ["godaddy", "GoDaddy builder"],
  ["weebly", "Weebly"],
  ["jimdo", "Jimdo"],
];

/**
 * Analyse raw HTML for tension/lever/pain signals. Pure and synchronous.
 *
 * @param {string} html
 * @param {{staleAfterYears?:number}} [opts]
 * @returns {{ copyrightYear:number|null, stale:boolean, hasViewport:boolean,
 *   hasBooking:boolean, generator:string|null, title:string|null }}
 */
export function analyzeWebsiteHtml(html, opts = {}) {
  const staleAfterYears = opts.staleAfterYears ?? 2;
  const text = String(html || "");
  const lower = text.toLowerCase();

  // Copyright year: the latest 4-digit year near a © / "copyright".
  let copyrightYear = null;
  const copyRe = /(?:©|&copy;|copyright)\D{0,40}(\d{4})|(\d{4})\D{0,12}(?:©|&copy;|todos los derechos|all rights)/gi;
  let m;
  while ((m = copyRe.exec(text))) {
    const y = parseInt(m[1] || m[2], 10);
    if (y >= 2000 && y <= CURRENT_YEAR && (copyrightYear === null || y > copyrightYear))
      copyrightYear = y;
  }
  const stale =
    copyrightYear !== null && CURRENT_YEAR - copyrightYear >= staleAfterYears;

  const hasViewport = /<meta[^>]+name=["']?viewport["']?/i.test(text);
  const hasBooking = BOOKING_RE.test(lower);

  let generator = null;
  for (const [needle, label] of GENERATOR_HINTS) {
    if (lower.includes(needle)) {
      generator = label;
      break;
    }
  }

  const titleMatch = text.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  return { copyrightYear, stale, hasViewport, hasBooking, generator, title };
}

/** Convert website findings into evidence points + signal hints. */
export function findingsToResult(findings, url) {
  const out = empty();
  if (findings.stale) {
    out.evidence.push({
      filter: "visibleTension",
      type: "web",
      source: "Website audit",
      url,
      note: `Site copyright stops at ${findings.copyrightYear} — likely not updated in ${CURRENT_YEAR - findings.copyrightYear}+ years.`,
      tier: 2,
    });
  }
  if (!findings.hasViewport) {
    out.evidence.push({
      filter: "activePainSignal",
      type: "web",
      source: "Website audit",
      url,
      note: "No mobile viewport meta tag — the site is likely not mobile-responsive.",
      tier: 2,
    });
    out.signalHints.activePainSignal = { level: "yellow" };
  }
  if (!findings.hasBooking) {
    out.evidence.push({
      filter: "actionableLever",
      type: "web",
      source: "Website audit",
      url,
      note: "No booking / quote / appointment call-to-action detected — clear conversion lever.",
      tier: 2,
    });
    out.signalHints.actionableLever = { level: "green" };
  }
  if (findings.generator) {
    out.evidence.push({
      filter: "visibleTension",
      type: "web",
      source: "Website audit",
      url,
      note: `Built on ${findings.generator} — template-grade presentation.`,
      tier: 1,
    });
  }
  return out;
}

// ---- Adapter factories ------------------------------------------------------

/**
 * Demo adapter set. DISABLED by default so the demo never touches the network
 * (the seeded URLs are placeholders). Use liveAdapters() in production.
 */
export function defaultAdapters() {
  return [
    new GoogleMapsAdapter({ enabled: false }),
    new WebsiteAdapter({ enabled: false }),
    new LinkedInAdapter({ enabled: false }),
    new InstagramAdapter({ enabled: false }),
    new PressAdapter({ enabled: false }),
    new JobsAdapter({ enabled: false }),
    new FundingAdapter({ enabled: false }),
  ];
}

/**
 * Live adapter set — the WebsiteAdapter is enabled (it only needs a reachable
 * URL); the API-backed adapters stay disabled until you implement them.
 * Pass `{ website:true, ... }` overrides to toggle individual sources.
 */
export function liveAdapters(overrides = {}) {
  const on = (name, def) => overrides[name] ?? def;
  return [
    new GoogleMapsAdapter({ enabled: on("googleMaps", false) }),
    new WebsiteAdapter({ enabled: on("website", true) }),
    new LinkedInAdapter({ enabled: on("linkedin", false) }),
    new InstagramAdapter({ enabled: on("instagram", false) }),
    new PressAdapter({ enabled: on("press", false) }),
    new JobsAdapter({ enabled: on("jobs", false) }),
    new FundingAdapter({ enabled: on("funding", false) }),
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
