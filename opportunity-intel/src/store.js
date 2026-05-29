// =============================================================================
// store.js — Persistence + the learning loop.
//
// Everything operational (call status, notes, post-call outcomes) is kept in
// localStorage keyed by opportunity id, so it survives reloads without a
// backend. The learning loop records call outcomes the scoring engine can
// later use to calibrate weights (see applyLearning()).
//
// In a live system, swap the localStorage functions for API calls — the shape
// of the records does not change.
// =============================================================================

const NS = "oi:"; // namespace
const TRACK_KEY = `${NS}tracking`;
const LEARN_KEY = `${NS}learning`;
const CONFIG_KEY = `${NS}config`;

// Graceful no-op storage when localStorage is unavailable (e.g. Node tests).
const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : {
        getItem: (k) => (mem.has(k) ? mem.get(k) : null),
        setItem: (k, v) => mem.set(k, v),
        removeItem: (k) => mem.delete(k),
      };

function read(key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — fail silent, demo is non-critical */
  }
}

// ---- Per-opportunity operational tracking -----------------------------------

/** @returns {Object<string, TrackingRecord>} */
export function getTracking() {
  return read(TRACK_KEY, {});
}

/**
 * @typedef {Object} TrackingRecord
 * @property {string} status   One of models.CALL_STATUSES
 * @property {string} notes    Free-text notes after calls
 * @property {string} updatedAt ISO timestamp
 */

export function getRecord(id) {
  const all = getTracking();
  return all[id] || { status: "not_called", notes: "", updatedAt: null };
}

export function setStatus(id, status) {
  const all = getTracking();
  all[id] = { ...getRecord(id), status, updatedAt: new Date().toISOString() };
  write(TRACK_KEY, all);
  return all[id];
}

export function setNotes(id, notes) {
  const all = getTracking();
  all[id] = { ...getRecord(id), notes, updatedAt: new Date().toISOString() };
  write(TRACK_KEY, all);
  return all[id];
}

// ---- The learning loop ------------------------------------------------------

/**
 * @typedef {Object} CallOutcome
 * @property {string} id              Opportunity id
 * @property {string} outcome         e.g. "meeting_booked", "rejected"
 * @property {string} objection       The objection actually raised
 * @property {string} whatWorked
 * @property {string} whatFailed
 * @property {boolean} hypothesisCorrect  Was our main hypothesis right?
 * @property {string} nextAction
 * @property {string} createdAt
 */

/** @returns {CallOutcome[]} */
export function getLearning() {
  return read(LEARN_KEY, []);
}

export function addOutcome(outcome) {
  const log = getLearning();
  log.push({ ...outcome, createdAt: new Date().toISOString() });
  write(LEARN_KEY, log);
  return log;
}

/**
 * Derive simple calibration hints from the outcome log. This is intentionally
 * conservative: it reports observed conversion by classification and by
 * dominant tension, and suggests directional weight nudges — it does NOT
 * silently mutate the engine. A human applies the nudge.
 *
 * @param {CallOutcome[]} [log]
 * @returns {{ sampleSize:number, hypothesisAccuracy:number|null,
 *   meetingRateByClass:Object, topObjections:Array, notes:string[] }}
 */
export function applyLearning(log = getLearning()) {
  const sampleSize = log.length;
  if (!sampleSize) {
    return {
      sampleSize: 0,
      hypothesisAccuracy: null,
      meetingRateByClass: {},
      topObjections: [],
      notes: ["No call outcomes recorded yet — learning loop is empty."],
    };
  }

  const correct = log.filter((o) => o.hypothesisCorrect).length;
  const hypothesisAccuracy = Math.round((correct / sampleSize) * 100);

  const byClass = {};
  for (const o of log) {
    const cls = o.classification || "unknown";
    byClass[cls] = byClass[cls] || { total: 0, meetings: 0 };
    byClass[cls].total++;
    if (o.outcome === "meeting_booked") byClass[cls].meetings++;
  }
  const meetingRateByClass = Object.fromEntries(
    Object.entries(byClass).map(([k, v]) => [
      k,
      { ...v, rate: Math.round((v.meetings / v.total) * 100) },
    ])
  );

  const objCounts = {};
  for (const o of log) {
    if (!o.objection) continue;
    objCounts[o.objection] = (objCounts[o.objection] || 0) + 1;
  }
  const topObjections = Object.entries(objCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([objection, count]) => ({ objection, count }));

  const notes = [];
  if (hypothesisAccuracy < 50)
    notes.push(
      "Hypothesis accuracy below 50% — tighten evidence requirements before shortlisting."
    );
  if (hypothesisAccuracy >= 75)
    notes.push("Hypothesis accuracy high — current filters are well calibrated.");

  return {
    sampleSize,
    hypothesisAccuracy,
    meetingRateByClass,
    topObjections,
    notes,
  };
}

// ---- Config persistence -----------------------------------------------------

export function getSavedConfig(fallback) {
  return read(CONFIG_KEY, fallback);
}
export function saveConfig(config) {
  write(CONFIG_KEY, config);
}

/** Hard reset (used by the UI "reset demo" control). */
export function resetAll() {
  [TRACK_KEY, LEARN_KEY, CONFIG_KEY].forEach((k) => storage.removeItem(k));
}
