// =============================================================================
// scoring.test.mjs — Engine sanity checks. Run: `node test/scoring.test.mjs`
// (or `npm test`). No test framework — a tiny assert harness so it runs with
// zero install, matching the rest of the project.
// =============================================================================

import { scoreOpportunity, countFlags, levelValue, verificationProfile } from "../src/scoring.js";
import { runPipeline } from "../src/pipeline.js";
import SEED from "../src/seed.js";
import { FILTER_KEYS, DEFAULT_CONFIG } from "../src/models.js";

let passed = 0;
let failed = 0;
function ok(cond, msg) {
  if (cond) { passed++; }
  else { failed++; console.error("  ✗ FAIL:", msg); }
}
function approx(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, `${msg} (got ${a}, want ~${b})`); }

// Helper to build an opportunity from a 10-char signal string + evidence count.
const CODE = { G: "green", Y: "yellow", R: "red", X: "grey" };
function build(sig, evCount = 5) {
  const signals = {};
  sig.split("").forEach((c, i) => (signals[FILTER_KEYS[i]] = { level: CODE[c] }));
  const evidence = Array.from({ length: evCount }, (_, i) => ({
    filter: FILTER_KEYS[i % FILTER_KEYS.length], tier: 3, source: "t", note: `e${i}`,
  }));
  return { id: "t", signals, evidence };
}

console.log("scoring.test.mjs");

// 1. Conservative bias: grey reads low, blended value below the aggressive read.
ok(levelValue("grey", 1.0) === 0.2, "grey conservative value is 0.2");
ok(levelValue("grey", 0.0) === 0.5, "grey aggressive value is 0.5");
ok(levelValue("grey", 0.8) < 0.35, "grey blended (0.8) stays low");
ok(levelValue("green", 0.8) === 1.0, "green is 1.0 regardless of bias");

// 2. All-green, well-evidenced lead scores very high and is shortlist-eligible.
const strong = scoreOpportunity(build("GGGGGGGGGG", 6), DEFAULT_CONFIG);
ok(strong.confidence >= 90, "all-green confidence >= 90");
ok(strong.greenCount === 10, "all-green counts 10 greens");
ok(strong.shortlistEligible, "all-green is shortlist-eligible");
ok(strong.classification !== "discard", "all-green is not discarded");

// 3. Four reds = discard, confidence capped low.
const fourRed = scoreOpportunity(build("RRRRGGGGGG", 5), DEFAULT_CONFIG);
ok(fourRed.redCount >= 4, "four-red counts >=4 reds");
ok(fourRed.classification === "discard", "four reds => discard");
ok(fourRed.confidence <= 25, "four reds => confidence capped <=25");
ok(fourRed.discardReason === "4+ banderas rojas", "four reds => correct discard reason");

// 4. Three reds without very-high economic upside => discard + capped.
const threeRed = scoreOpportunity(build("RRRYYGGGGG", 5), DEFAULT_CONFIG);
ok(threeRed.redCount === 3, "three-red counts 3 reds");
ok(threeRed.confidence <= 44, "three reds => confidence capped <=44");

// 5. Fewer than 3 evidence points can never read as strong evidence.
const thinEvidence = scoreOpportunity(build("GGGGGGGGGG", 2), DEFAULT_CONFIG);
ok(thinEvidence.evidence <= 40, "<3 evidence points => evidence strength capped <=40");
ok(!thinEvidence.shortlistEligible, "<3 evidence points => not shortlist-eligible");

// 6. Meeting probability never exceeds conversation probability.
for (const sig of ["GGGGGGGGGG", "GYGYGYGYGY", "YYGGGYGGYY", "GGYGGGYGYG"]) {
  const s = scoreOpportunity(build(sig, 5), DEFAULT_CONFIG);
  ok(s.meeting <= s.conversation, `meeting <= conversation for ${sig}`);
}

// 7. Conservatism dial actually lowers a grey-heavy lead's confidence.
const greyish = build("GXXGXGXGXG", 5);
const conservative = scoreOpportunity(greyish, { ...DEFAULT_CONFIG, conservatism: 1.0 });
const aggressive = scoreOpportunity(greyish, { ...DEFAULT_CONFIG, conservatism: 0.0 });
ok(aggressive.confidence > conservative.confidence, "aggressive bias scores grey-heavy lead higher");

// 8. countFlags sums to 10.
const fc = countFlags(build("GYRXGYRXGY"));
ok(fc.green + fc.yellow + fc.red + fc.grey === 10, "flag counts sum to 10");

// 9. Pipeline end-to-end on the seed dataset.
const res = await runPipeline(SEED, DEFAULT_CONFIG);
ok(res.counts.discovered === SEED.length, "pipeline discovered == seed length");
ok(res.counts.final <= DEFAULT_CONFIG.finalCount, "final <= configured finalCount");
ok(res.counts.final <= res.counts.shortlisted, "final <= shortlisted");
ok(res.counts.shortlisted <= res.counts.filtered, "shortlisted <= filtered");
ok(res.final.every((o, i) => o.ranking === i + 1), "final list is contiguously ranked from 1");
ok(res.final[0].scores.confidence >= res.final[res.final.length - 1].scores.confidence, "final list is sorted by confidence (desc-ish)");

// 10. Every shortlisted opportunity carries >= 3 evidence points (brief rule).
ok(res.ranked.every((o) => o.scores.evidenceCount >= 3), "all shortlisted have >=3 evidence");

// 11. The intentional 'discard' demo rows are actually discarded.
const tajo = res.all.find((o) => o.id === "re-construcciones-tajo");
ok(tajo && tajo.scores.classification === "discard", "low-fit contractor is discarded");

// 12. verificationProfile — provenance accounting.
// A filter is "verified" only when green/yellow AND backed by a cited (url)
// evidence point. Grey signals, and green/yellow asserted without a citation,
// are gaps. Red is neither verified nor a gap.
const vEvidence = [
  { filter: "transitionSignal", tier: 3, url: "https://src/a" }, // cited → verifies green
  { filter: "economicCapacity", tier: 2, url: "https://src/a" }, // same source
  { filter: "whyNow", tier: 2 }, // NO url → does not verify even though green
];
const vSignals = {};
FILTER_KEYS.forEach((k) => (vSignals[k] = { level: "grey" }));
vSignals.transitionSignal = { level: "green" };
vSignals.economicCapacity = { level: "green" };
vSignals.whyNow = { level: "green" };
vSignals.strategicFit = { level: "red" };
const vp = verificationProfile({ signals: vSignals, evidence: vEvidence });
ok(vp.verifiedFilters.includes("transitionSignal"), "cited green filter is verified");
ok(vp.verifiedFilters.includes("economicCapacity"), "second cited green filter is verified");
ok(!vp.verifiedFilters.includes("whyNow"), "green filter WITHOUT a citation is not verified");
ok(vp.gapFilters.includes("whyNow"), "uncited green filter is a gap to confirm");
ok(!vp.gapFilters.includes("strategicFit"), "red filter is not counted as a gap");
ok(!vp.verifiedFilters.includes("strategicFit"), "red filter is not verified");
ok(vp.sourceCount === 1, "deduplicates citation sources by URL");
ok(vp.citedCount === 2 && vp.uncitedCount === 1, "counts cited vs uncited evidence");
ok(vp.verifiedShare === 20, "verifiedShare = 2/10 = 20%");

// 13. scoreOpportunity exposes the verification profile.
const vScored = scoreOpportunity({ signals: vSignals, evidence: vEvidence }, DEFAULT_CONFIG);
ok(vScored.verification && Array.isArray(vScored.verification.gapFilters), "scoreOpportunity attaches verification");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
