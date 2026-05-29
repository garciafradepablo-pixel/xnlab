// =============================================================================
// enrichment.test.mjs — Tests for the website analysis parsers and the adapter
// factories. Run: `node test/enrichment.test.mjs`.
// =============================================================================

import {
  analyzeWebsiteHtml,
  findingsToResult,
  defaultAdapters,
  liveAdapters,
  enrichCandidate,
} from "../src/enrichment.js";

let passed = 0,
  failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("enrichment.test.mjs");

// Stale, template, no-viewport, no-booking site → 3 evidence + hints.
const stale = analyzeWebsiteHtml(
  "powered by Wix © 2018 Todos los derechos reservados"
);
ok(stale.copyrightYear === 2018, "detects copyright year 2018");
ok(stale.stale === true, "flags an old copyright year as stale");
ok(stale.generator === "Wix", "detects Wix as generator");
ok(stale.hasViewport === false, "detects missing viewport");
ok(stale.hasBooking === false, "detects missing booking CTA");
const staleRes = findingsToResult(stale, "https://x.es");
ok(staleRes.evidence.length === 3, "stale site yields 3 evidence points");
ok(staleRes.signalHints.actionableLever?.level === "green", "missing booking => green lever hint");

// Modern, responsive, booking-ready site → no negative evidence.
const modern = analyzeWebsiteHtml(
  `<meta name="viewport" content="width=device-width"> pedir cita online © ${new Date().getFullYear()}`
);
ok(modern.stale === false, "current-year copyright is not stale");
ok(modern.hasViewport === true, "detects viewport meta");
ok(modern.hasBooking === true, "detects booking CTA (pedir cita)");
ok(findingsToResult(modern, "u").evidence.length === 0, "modern site yields no negative evidence");

// Title extraction.
ok(analyzeWebsiteHtml("<title> Hello </title>").title === "Hello", "extracts and trims <title>");

// Adapter factories.
ok(defaultAdapters().every((a) => !a.enabled), "demo adapters are all disabled (offline)");
const live = liveAdapters();
ok(live.find((a) => a.name === "website").enabled === true, "live website adapter is enabled");
ok(live.filter((a) => a.enabled).length === 1, "only website is enabled by default in live set");
ok(liveAdapters({ press: true }).find((a) => a.name === "press").enabled === true, "overrides toggle adapters on");

// enrichCandidate with disabled adapters touches nothing.
const enriched = await enrichCandidate(
  { website: "https://x.es", evidence: [{ filter: "x", note: "n", tier: 1 }], signals: {} },
  defaultAdapters()
);
ok(enriched.evidence.length === 1, "disabled adapters add no evidence");
ok(enriched._enriched === true, "enrichCandidate marks the record enriched");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
