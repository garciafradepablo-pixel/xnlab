// =============================================================================
// commercialmemory.js — Memoria Comercial: agrega el historial de TODAS las
// llamadas en patrones accionables.
//
// Es la diferencia entre "guardar llamadas" y "aprender del mercado": coge la
// caja negra de cada lead (store.getCalls) y destila qué objeciones se repiten,
// qué dolores aparecen, qué frases abren o cierran puertas, qué sectores
// responden mejor, qué servicios se piden y por qué se gana o se pierde.
//
// PURO y testeable (sin DOM, sin red). Opera sobre los registros de llamada que
// ya llevan su `analysis` (de calls.analyzeTranscript o del LLM) y una foto del
// sector del lead (`leadSector`). No necesita el dataset de leads para funcionar.
// =============================================================================

import { CALL_RESULTS } from "./models.js";

function topN(counter, n = 8) {
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

function bump(counter, key) {
  if (!key) return;
  counter[key] = (counter[key] || 0) + 1;
}

// Resultados que cuentan como "ganado" / "perdido" a efectos de tasa por sector.
const WON = new Set(["closed_won", "meeting", "proposal", "interested"]);
const LOST = new Set(["closed_lost", "not_interested"]);

/**
 * Construye la Memoria Comercial a partir de los registros de llamada.
 * @param {import('./calls.js').CallRecord[]} calls
 * @returns {{
 *   sampleSize:number, callsWithTranscript:number,
 *   objections:Array, pains:Array, buyPhrases:Array, lossPhrases:Array,
 *   services:Array, sectors:Array, prices:string[],
 *   winReasons:Array, lossReasons:Array, avgCloseProbability:number|null
 * }}
 */
export function buildMemory(calls = []) {
  const list = Array.isArray(calls) ? calls : [];
  const objections = {};
  const pains = {};
  const services = {};
  const buyPhrases = {};
  const lossPhrases = {};
  const prices = new Set();
  const winReasons = {};
  const lossReasons = {};
  // sector → { sector, total, won, lost }
  const sectorAgg = {};
  let closeSum = 0;
  let closeCount = 0;
  let withTranscript = 0;

  for (const c of list) {
    const a = c.analysis || {};
    if (c.transcript && c.transcript.trim()) withTranscript++;

    (a.objections || []).forEach((o) => bump(objections, o));
    (a.pains || []).forEach((p) => bump(pains, p));
    (a.services || []).forEach((s) => bump(services, s));
    (a.buySignals || []).forEach((b) => bump(buyPhrases, trim(b)));
    (a.lossSignals || []).forEach((l) => bump(lossPhrases, trim(l)));
    if (a.budget) prices.add(String(a.budget));

    if (typeof a.closeProbability === "number") {
      closeSum += a.closeProbability;
      closeCount++;
    }

    // Razón de ganar / perder: el resultado de la llamada cruzado con su
    // objeción / dolor dominante (la causa observable, no inventada).
    const result = c.result;
    if (WON.has(result)) {
      const reason = (a.pains && a.pains[0]) ? `Enganchó por: ${a.pains[0]}` : `${CALL_RESULTS[result] || result}`;
      bump(winReasons, reason);
    } else if (LOST.has(result)) {
      const reason = (a.objections && a.objections[0]) ? a.objections[0] : `${CALL_RESULTS[result] || result}`;
      bump(lossReasons, reason);
    }

    // Respuesta por sector.
    const sec = c.leadSector || "sin sector";
    sectorAgg[sec] = sectorAgg[sec] || { sector: sec, total: 0, won: 0, lost: 0 };
    sectorAgg[sec].total++;
    if (WON.has(result)) sectorAgg[sec].won++;
    if (LOST.has(result)) sectorAgg[sec].lost++;
  }

  const sectors = Object.values(sectorAgg)
    .map((s) => ({ ...s, rate: s.total ? Math.round((s.won / s.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total);

  return {
    sampleSize: list.length,
    callsWithTranscript: withTranscript,
    objections: topN(objections),
    pains: topN(pains),
    buyPhrases: topN(buyPhrases),
    lossPhrases: topN(lossPhrases),
    services: topN(services),
    sectors,
    prices: [...prices],
    winReasons: topN(winReasons, 6),
    lossReasons: topN(lossReasons, 6),
    avgCloseProbability: closeCount ? Math.round(closeSum / closeCount) : null,
  };
}

function trim(s) {
  return String(s || "").trim().slice(0, 120);
}

/**
 * Resumen de tablero a partir de leads + tracking + calls. Las cifras que la
 * vista de dashboard necesita, calculadas en un sitio puro y testeable.
 *
 * @param {object} args
 * @param {Array}  args.leads     lista de oportunidades (con .id, .sector)
 * @param {object} args.tracking  mapa id → { status }
 * @param {Array}  args.calls     registros de llamada
 */
export function buildDashboard({ leads = [], tracking = {}, calls = [] } = {}) {
  const byStatus = {};
  for (const l of leads) {
    const st = tracking[l.id]?.status || "not_called";
    byStatus[st] = (byStatus[st] || 0) + 1;
  }
  const count = (st) => byStatus[st] || 0;

  const callsMade = calls.length;
  const meetings = count("meeting_booked");
  const proposals = count("proposal_sent");
  const won = count("won");
  const lost = count("rejected") + count("wrong_fit");

  // Leads calientes: interesados o con reunión, primeros.
  const hotStatuses = new Set(["interested", "meeting_booked", "proposal_sent"]);
  const hot = leads
    .filter((l) => hotStatuses.has(tracking[l.id]?.status))
    .map((l) => ({ id: l.id, company: l.company, status: tracking[l.id].status, sector: l.sector }));

  // Conversión por fase (embudo lineal sobre el vocabulario existente).
  const contacted = leads.length - count("not_called");
  const funnel = [
    { stage: "Contactados", n: contacted },
    { stage: "Interesados", n: count("interested") + meetings + proposals + won },
    { stage: "Reuniones", n: meetings + proposals + won },
    { stage: "Propuestas", n: proposals + won },
    { stage: "Cerrados", n: won },
  ];

  return {
    totalLeads: leads.length,
    byStatus,
    callsMade,
    meetings,
    proposals,
    won,
    lost,
    hot,
    funnel,
    memory: buildMemory(calls),
  };
}
