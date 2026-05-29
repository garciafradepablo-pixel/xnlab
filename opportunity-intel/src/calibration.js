// =============================================================================
// calibration.js — Turns the call-outcome log into BOUNDED scoring adjustments.
//
// This is where the learning loop stops being a report and starts changing the
// engine — carefully. The philosophy holds: conservative, defensible, never a
// wild swing from a handful of calls.
//
// What it learns: for each of the ten filters, does a GREEN signal on that
// filter actually correlate with a good call outcome? If green-on-filter-X
// converts above the base rate, X earns a small weight bump; if it converts
// below, X is trimmed. Everything is gated by sample size and hard-capped, so a
// noisy first week cannot distort the model.
//
// What it deliberately does NOT do: invent signals, flip classifications, or
// move weights more than ±CAP. Calibration is a nudge, not a rewrite.
// =============================================================================

import { FILTER_KEYS } from "./models.js";

// A call "succeeded" if it reached interest or a meeting; "failed" if rejected
// or judged a wrong fit. Everything else (no answer, called, follow-up) is
// neutral — it carries no signal about whether the lead was well-chosen.
const SUCCESS = new Set(["interested", "meeting_booked"]);
const FAILURE = new Set(["rejected", "wrong_fit"]);

// Guardrails.
export const CALIBRATION = {
  MIN_SAMPLE: 6, // outcomes with a usable (success/failure) result before ANY nudge
  MIN_FILTER_GREENS: 3, // green observations on a filter before it may be nudged
  MAX_NUDGE: 0.15, // a filter's weight may move at most ±15%
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Derive a calibration from the outcome log.
 *
 * @param {Array} log  Call outcomes (store.getLearning()).
 * @param {object} [opts]  Override guardrails (mainly for tests).
 * @returns {{
 *   active: boolean,
 *   sampleSize: number,        // total outcomes
 *   evaluated: number,         // outcomes with a success/failure verdict
 *   baseRate: number|null,     // overall success rate among evaluated
 *   weightMultipliers: Object<string,number>,  // per-filter, default 1.0
 *   filterLift: Object<string,{greens:number,greenSuccess:number,lift:number}>,
 *   notes: string[]
 * }}
 */
export function deriveCalibration(log = [], opts = {}) {
  const cfg = { ...CALIBRATION, ...opts };
  const mult = Object.fromEntries(FILTER_KEYS.map((k) => [k, 1]));

  // Keep only outcomes that carry a verdict AND the signal snapshot we need to
  // learn from. (app.js stamps each outcome with the lead's signals at call
  // time so calibration is reproducible even if the dataset later changes.)
  const evaluable = log.filter(
    (o) => (SUCCESS.has(o.outcome) || FAILURE.has(o.outcome)) && o.signals
  );
  const evaluated = evaluable.length;

  if (evaluated < cfg.MIN_SAMPLE) {
    return {
      active: false,
      sampleSize: log.length,
      evaluated,
      baseRate: evaluated ? successRate(evaluable) : null,
      weightMultipliers: mult,
      filterLift: {},
      notes: [
        `Calibration inactive — ${evaluated}/${cfg.MIN_SAMPLE} evaluable outcomes (need ${cfg.MIN_SAMPLE}).`,
      ],
    };
  }

  const baseRate = successRate(evaluable);
  const filterLift = {};
  const notes = [];

  for (const key of FILTER_KEYS) {
    // Among leads whose filter `key` was green, what was the success rate?
    const greens = evaluable.filter((o) => o.signals[key]?.level === "green");
    const greenSuccess = greens.filter((o) => SUCCESS.has(o.outcome)).length;
    filterLift[key] = { greens: greens.length, greenSuccess, lift: 0 };

    if (greens.length < cfg.MIN_FILTER_GREENS) continue; // not enough to judge

    const greenRate = greenSuccess / greens.length;
    const lift = greenRate - baseRate; // -1..+1
    filterLift[key].lift = Math.round(lift * 100) / 100;

    // Scale the lift by how much data backs it (more greens → closer to full
    // effect), then cap. A filter that perfectly predicts success on a small
    // sample still cannot exceed MAX_NUDGE.
    const dataWeight = clamp(greens.length / (evaluated || 1), 0, 1);
    const nudge = clamp(lift * dataWeight, -cfg.MAX_NUDGE, cfg.MAX_NUDGE);
    mult[key] = clamp(1 + nudge, 1 - cfg.MAX_NUDGE, 1 + cfg.MAX_NUDGE);
  }

  // Human-readable summary of the strongest movers.
  const movers = FILTER_KEYS
    .map((k) => ({ k, m: mult[k] }))
    .filter((x) => Math.abs(x.m - 1) >= 0.03)
    .sort((a, b) => Math.abs(b.m - 1) - Math.abs(a.m - 1));
  for (const { k, m } of movers.slice(0, 3)) {
    notes.push(
      `${k}: weight ${m > 1 ? "+" : ""}${Math.round((m - 1) * 100)}% (green → ${
        m > 1 ? "above" : "below"
      }-average outcomes).`
    );
  }
  if (!movers.length)
    notes.push("Calibration active but no filter moved enough to nudge yet.");

  return {
    active: true,
    sampleSize: log.length,
    evaluated,
    baseRate: Math.round(baseRate * 100) / 100,
    weightMultipliers: mult,
    filterLift,
    notes,
  };
}

function successRate(list) {
  const s = list.filter((o) => SUCCESS.has(o.outcome)).length;
  return list.length ? s / list.length : 0;
}

// Estados de "cierre real" (reunión = la conversión que de verdad importa).
const CLOSED = new Set(["meeting_booked"]);

/**
 * Calibración del ÍNDICE DE ÉXITO desde resultados reales.
 *
 * Compara lo que el motor predijo (successIndex en el momento de la llamada)
 * con lo que de verdad pasó (reunión sí/no). Si el motor es optimista
 * (predice alto pero cierra poco), devuelve un factor < 1 que lo corrige; si es
 * pesimista, > 1. Así el Índice de Éxito deja de ser teórico y empieza a
 * predecir el éxito REAL de quien llama.
 *
 * Conservador: necesita MIN_SAMPLE llamadas decisivas; el factor está acotado a
 * ±35% para que no dé bandazos con pocos datos.
 *
 * @param {Array} log  outcomes; cada uno con { outcome, successIndexAtCall? }
 * @returns {{ active, calls, observedRate, predictedRate, factor, note }}
 */
export function deriveSuccessCalibration(log = [], opts = {}) {
  const cfg = { MIN_SAMPLE: 6, MAX_ADJ: 0.35, ...opts };
  // Solo llamadas con veredicto de éxito/fallo y con la predicción registrada.
  const evaluable = log.filter(
    (o) => (SUCCESS.has(o.outcome) || FAILURE.has(o.outcome)) &&
           typeof o.successIndexAtCall === "number"
  );
  const calls = evaluable.length;
  if (calls < cfg.MIN_SAMPLE) {
    return { active: false, calls, observedRate: null, predictedRate: null, factor: 1,
      note: `Aún sin datos suficientes para calibrar el éxito (${calls}/${cfg.MIN_SAMPLE} llamadas decisivas).` };
  }
  const observedRate = evaluable.filter((o) => CLOSED.has(o.outcome)).length / calls;
  const predictedRate = evaluable.reduce((s, o) => s + o.successIndexAtCall, 0) / calls / 100;
  // factor = realidad / predicción, acotado.
  let factor = predictedRate > 0.02 ? observedRate / predictedRate : 1;
  factor = Math.max(1 - cfg.MAX_ADJ, Math.min(1 + cfg.MAX_ADJ, factor));
  const dir = factor < 0.97 ? "a la baja (el motor era optimista)" :
              factor > 1.03 ? "al alza (el motor era prudente)" : "casi sin cambios";
  return {
    active: true, calls,
    observedRate: Math.round(observedRate * 100),
    predictedRate: Math.round(predictedRate * 100),
    factor: Math.round(factor * 100) / 100,
    note: `Calibrado con ${calls} llamadas: cierre real ${Math.round(observedRate*100)}% vs previsto ${Math.round(predictedRate*100)}% → ajuste ${dir}.`,
  };
}
