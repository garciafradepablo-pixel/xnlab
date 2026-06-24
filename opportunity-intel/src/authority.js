// =============================================================================
// authority.js — La prueba de autoridad. Convierte el Ledger (orden→obediencia
// →resultado) en EVIDENCIA: qué pasa cuando obedeces a Connect, y qué pasa
// cuando lo ignoras. No es analytics ni reporting. Es la respuesta honesta a
// "¿tenía razón la orden?".
//
// Regla de oro: NUNCA inventa. Sin muestra suficiente, lo dice. Sin datos, no
// afirma. Cada frase nace de filas reales del Ledger.
//
// Puro y testeable — sin DOM, sin store, sin red. Opera sobre la salida de
// foldOrders (ledger.js). No toca OCI, scoring, decision, memory ni followups.
// =============================================================================

const POSITIVE = new Set(["avance", "propuesta"]); // la orden produjo avance
const NEGATIVE = new Set(["perdido", "sin_respuesta"]); // la orden no avanzó
const DUE_MS = 48 * 3600000; // una orden no obedecida en 48 h se considera ignorada
const MIN_SAMPLE = 3; // mínimo de órdenes resueltas para afirmar un %

/** Tasa de obediencia: obedecidas / emitidas. */
export function computeObedienceRate(orders = []) {
  const issued = orders.filter((o) => o.issuedAt).length;
  const obeyed = orders.filter((o) => o.obeyedAt).length;
  return { issued, obeyed, rate: issued ? obeyed / issued : null };
}

/**
 * Outcome lift: ¿avanzan más las órdenes obedecidas que las ignoradas? Las
 * ignoradas no producen avance (no se actuó), así que su tasa es 0 por
 * definición. El lift es la tasa de avance de las obedecidas.
 */
export function computeOutcomeLift(orders = [], now = Date.now()) {
  const obeyedResolved = orders.filter((o) => o.obeyedAt && o.resolvedAt);
  const obeyedAdv = obeyedResolved.filter((o) => POSITIVE.has(o.outcome)).length;
  const obeyedAdvanceRate = obeyedResolved.length ? obeyedAdv / obeyedResolved.length : null;
  const ignored = orders.filter(
    (o) => !o.obeyedAt && o.issuedAt && now - new Date(o.issuedAt).getTime() > DUE_MS
  ).length;
  const enough = obeyedResolved.length >= MIN_SAMPLE;
  const liftPct = enough && obeyedAdvanceRate != null ? Math.round(obeyedAdvanceRate * 100) : null;
  return { obeyedResolved: obeyedResolved.length, obeyedAdvanceRate, ignored, liftPct, enough };
}

/** Order accuracy: de las órdenes obedecidas y resueltas, cuántas acertaron
 *  (predicción "avance" → resultado positivo real). */
export function computeOrderAccuracy(orders = []) {
  const resolved = orders.filter((o) => o.obeyedAt && o.resolvedAt);
  const correct = resolved.filter((o) => POSITIVE.has(o.outcome)).length;
  const wrong = resolved.filter((o) => NEGATIVE.has(o.outcome)).length;
  return {
    resolved: resolved.length,
    correct,
    wrong,
    accuracyPct: resolved.length ? Math.round((correct / resolved.length) * 100) : null,
  };
}

/**
 * Authority Score (la métrica suprema, v1 simple): órdenes obedecidas y
 * correctas / órdenes emitidas, en escala 0–100. Es la prueba de que ceder el
 * juicio a Connect produce avance medible.
 */
export function computeAuthorityScore(orders = []) {
  const issued = orders.filter((o) => o.issuedAt).length;
  const correct = orders.filter((o) => o.obeyedAt && o.resolvedAt && POSITIVE.has(o.outcome)).length;
  return { issued, correct, score: issued ? Math.round((correct / issued) * 100) : null };
}

/**
 * La frase de evidencia para el Reactor. UNA línea, honesta:
 *  - con muestra suficiente → afirma el lift real;
 *  - con datos pero sin muestra → expone el recuento crudo (sin afirmar);
 *  - sin órdenes → declara que no hay evidencia.
 * Nunca inventa.
 */
export function authorityLine(orders = [], now = Date.now()) {
  const ob = computeObedienceRate(orders);
  if (ob.issued === 0) return "Sin evidencia suficiente todavía.";

  const lift = computeOutcomeLift(orders, now);
  if (lift.enough && lift.liftPct != null) {
    // Decimos la TASA real (avanzadas/resueltas), no un delta. Si hay ignoradas,
    // se contrasta con un hecho honesto: las ignoradas no avanzaron ninguna.
    return lift.ignored > 0
      ? `Las órdenes obedecidas avanzan el ${lift.liftPct}% de las veces; las ignoradas, ninguna.`
      : `Las órdenes obedecidas avanzan el ${lift.liftPct}% de las veces.`;
  }

  // Aún sin muestra para afirmar: recuento honesto, sin porcentaje.
  const ordWord = ob.issued === 1 ? "orden emitida" : "órdenes emitidas";
  return `${ob.issued} ${ordWord} · ${ob.obeyed} obedecida${ob.obeyed === 1 ? "" : "s"}`;
}

/** ¿Hay alguna orden ignorada cuyo lead empeoró? (override-regret, ya visible). */
export function hasOverrideRegret(orders = []) {
  return orders.some((o) => o.overrideRegret);
}
