// =============================================================================
// autopilot.js — Lógica del PILOTO AUTOMÁTICO de captación.
//
// El piloto no para de meter empresas cualificadas (vía el agente) hasta tener
// `target` en 01 Y `target` en XN. Aquí vive solo la decisión PURA: cuántas
// cualificadas hay por marca y si ya está el objetivo. El bucle real (tiempos,
// red, rate-limit) lo orquesta la UI. Testeable sin DOM.
//
// "Cualificada" = nota (confianza) ≥ BAR. Honesto: la nota tope hoy la limita el
// dato en gris; el piloto acumula lo mejor alcanzable y el enriquecimiento
// (en construcción) es lo que sube el techo.
// =============================================================================

export const AUTO_BAR = 70; // listón de excelencia (igual que el agente)

/**
 * @param {Array} scored  oportunidades con .scores {confidence, classification}
 * @param {object} [opts] { target, bar }
 * @returns {{q01,qxn,target,bar,done,pct01,pctxn}}
 */
export function autoProgress(scored = [], { target = 100, bar = AUTO_BAR } = {}) {
  let q01 = 0, qxn = 0;
  for (const o of scored) {
    const s = (o && o.scores) || {};
    if ((s.confidence || 0) < bar) continue;
    if (s.classification === "01") q01++;
    else if (s.classification === "xn") qxn++;
  }
  const pct = (n) => Math.min(100, Math.round((n / (target || 1)) * 100));
  return { q01, qxn, target, bar, done: q01 >= target && qxn >= target, pct01: pct(q01), pctxn: pct(qxn) };
}
