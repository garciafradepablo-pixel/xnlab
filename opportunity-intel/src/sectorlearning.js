// =============================================================================
// sectorlearning.js — Qué NICHOS cierran mejor, desde resultados reales.
//
// Cierra el círculo del captador: tú captas un sector (incluso uno nuevo), y a
// medida que marcas llamadas, Connect mide cuánto convierte ESE nicho. Así
// sabes en cuál insistir — y el día de mañana, afinar su lente.
//
// Honesto: un nicho solo se "juzga" con muestra suficiente; por debajo, dice
// "calibrando". Módulo PURO y testeable (sin DOM). Trabaja sobre el mismo log de
// resultados (store.getLearning()), que ahora estampa el sector de cada llamada.
// =============================================================================

const SUCCESS = new Set(["interested", "meeting_booked", "won"]);
const FAILURE = new Set(["rejected", "wrong_fit"]);

/**
 * Rendimiento por sector.
 * @param {Array} log  resultados; cada uno con { sector?, outcome }
 * @param {object} [opts] { minSample } llamadas decisivas para juzgar un nicho
 * @returns {Array<{sector,decisive,wins,rate,ranked}>}  ordenado: juzgables y
 *   con mejor conversión primero. `ranked=false` → aún calibrando.
 */
export function sectorPerformance(log = [], { minSample = 3 } = {}) {
  const by = new Map();
  for (const o of log) {
    if (!o || !o.sector) continue;
    const decisive = SUCCESS.has(o.outcome) || FAILURE.has(o.outcome);
    if (!decisive) continue;
    const e = by.get(o.sector) || { sector: o.sector, decisive: 0, wins: 0 };
    e.decisive++;
    if (SUCCESS.has(o.outcome)) e.wins++;
    by.set(o.sector, e);
  }
  const rows = [...by.values()].map((e) => ({
    ...e,
    rate: e.decisive ? Math.round((e.wins / e.decisive) * 100) : 0,
    ranked: e.decisive >= minSample,
  }));
  rows.sort((a, b) => (Number(b.ranked) - Number(a.ranked)) || (b.rate - a.rate) || (b.decisive - a.decisive));
  return rows;
}

/** Conversión de UN sector (o null si no hay datos decisivos). */
export function sectorRate(log = [], sector, { minSample = 3 } = {}) {
  const row = sectorPerformance(log, { minSample }).find((r) => r.sector === sector);
  return row || null;
}
