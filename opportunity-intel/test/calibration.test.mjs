// =============================================================================
// calibration.test.mjs — Tests for the learning-loop calibration engine and the
// portable state export/import. Run: `node test/calibration.test.mjs`.
// =============================================================================

import { deriveCalibration, CALIBRATION } from "../src/calibration.js";
import { scoreOpportunity } from "../src/scoring.js";
import { FILTER_KEYS, DEFAULT_CONFIG } from "../src/models.js";
import * as store from "../src/store.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("calibration.test.mjs");

// Build an outcome with a signal snapshot: `greenKeys` are green, rest grey.
function outcome(id, result, greenKeys = []) {
  const signals = {};
  FILTER_KEYS.forEach((k) => (signals[k] = { level: greenKeys.includes(k) ? "green" : "grey" }));
  return { id, outcome: result, signals, createdAt: `${id}-${result}`, hypothesisCorrect: result === "meeting_booked" };
}

// 1. Below MIN_SAMPLE → inactive, all multipliers 1.0.
const few = deriveCalibration([outcome("a", "interested", ["whyNow"])]);
ok(!few.active, "inactive below MIN_SAMPLE");
ok(Object.values(few.weightMultipliers).every((m) => m === 1), "inactive => all multipliers 1.0");

// 2. With enough decisive calls, a filter whose green predicts success is bumped;
//    one whose green predicts failure is trimmed.
// Construct: "whyNow" green on all 4 successes; "strategicFit" green on all 4 failures.
const log = [
  outcome("s1", "meeting_booked", ["whyNow"]),
  outcome("s2", "interested", ["whyNow"]),
  outcome("s3", "meeting_booked", ["whyNow"]),
  outcome("s4", "interested", ["whyNow"]),
  outcome("f1", "rejected", ["strategicFit"]),
  outcome("f2", "wrong_fit", ["strategicFit"]),
  outcome("f3", "rejected", ["strategicFit"]),
  outcome("f4", "wrong_fit", ["strategicFit"]),
];
const cal = deriveCalibration(log);
ok(cal.active, "active once enough evaluable calls");
ok(cal.evaluated === 8, "counts all 8 evaluable outcomes");
ok(cal.baseRate === 0.5, "base success rate is 50%");
ok(cal.weightMultipliers.whyNow > 1, "filter that predicts success is bumped");
ok(cal.weightMultipliers.strategicFit < 1, "filter that predicts failure is trimmed");

// 3. Nudges are hard-capped at ±MAX_NUDGE.
for (const m of Object.values(cal.weightMultipliers)) {
  ok(m >= 1 - CALIBRATION.MAX_NUDGE - 1e-9 && m <= 1 + CALIBRATION.MAX_NUDGE + 1e-9, "multiplier within ±MAX_NUDGE");
}

// 4. Neutral outcomes (no_answer/called/follow-up) are ignored.
const neutral = deriveCalibration([
  ...Array.from({ length: 8 }, (_, i) => outcome(`n${i}`, "no_answer", ["whyNow"])),
]);
ok(!neutral.active, "all-neutral log stays inactive (no verdicts to learn from)");

// 5. Calibration actually changes the confidence score via weightMultipliers.
const lead = { id: "x", signals: {}, evidence: [] };
FILTER_KEYS.forEach((k) => (lead.signals[k] = { level: "grey" }));
lead.signals.whyNow = { level: "green" }; // only whyNow is green
const baseScore = scoreOpportunity(lead, DEFAULT_CONFIG).confidence;
const calScore = scoreOpportunity(lead, { ...DEFAULT_CONFIG, weightMultipliers: cal.weightMultipliers }).confidence;
ok(calScore > baseScore, "bumping whyNow's weight raises a whyNow-green lead's confidence");

// 6. Renormalisation keeps an all-1.0 multiplier identical to no multiplier.
const flat = Object.fromEntries(FILTER_KEYS.map((k) => [k, 1]));
const a = scoreOpportunity(lead, DEFAULT_CONFIG).confidence;
const b = scoreOpportunity(lead, { ...DEFAULT_CONFIG, weightMultipliers: flat }).confidence;
ok(a === b, "all-1.0 multipliers leave the score unchanged (renormalisation is neutral)");

// 7. Store export/import round-trips and merges (uses in-memory fallback).
store.resetAll();
store.addOutcome(outcome("lead-1", "meeting_booked", ["whyNow"]));
store.setStatus("lead-1", "meeting_booked");
const dump = store.exportState();
ok(dump.includes("opportunity-intel/state"), "export carries the format tag");
store.resetAll();
ok(store.getLearning().length === 0, "reset clears the log");
const res = store.importState(dump);
ok(res.ok && res.addedOutcomes === 1, "import restores the outcome");
ok(store.getLearning().length === 1, "log has the imported outcome");
// Re-importing the same file is idempotent (dedup).
const res2 = store.importState(dump);
ok(res2.addedOutcomes === 0, "re-importing the same file adds nothing (dedup)");

// 8. Import rejects junk.
const bad = store.importState('{"not":"ours"}');
ok(!bad.ok, "import rejects a file without the format tag");

store.resetAll();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
