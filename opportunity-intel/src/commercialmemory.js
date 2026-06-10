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

// =============================================================================
// Memoria accionable — no solo datos, sino aprendizajes con regla de honestidad:
// por debajo de MIN_SAMPLE registros, se dice "datos insuficientes" en vez de
// sacar una conclusión de la nada.
// =============================================================================

export const MIN_SAMPLE = 3;

// Estados del CRM que cuentan como "el lead avanzó".
const ADVANCED = new Set(["interested", "meeting_booked", "proposal_sent", "won"]);
const statusOf = (leadId, tracking) => (tracking[leadId] && tracking[leadId].status) || "not_called";

/** Objeciones agrupadas por resultado de llamada. [{ result, objections:[{label,count}] }] */
export function objectionsByResult(calls = []) {
  const byResult = {};
  for (const c of calls) {
    const res = c.result || "connected";
    byResult[res] = byResult[res] || {};
    (c.analysis?.objections || []).forEach((o) => bump(byResult[res], o));
  }
  return Object.entries(byResult)
    .map(([result, counter]) => ({ result, objections: topN(counter, 5) }))
    .filter((r) => r.objections.length);
}

/** Objeciones agrupadas por estado actual del lead en el CRM. */
export function objectionsByStatus(calls = [], tracking = {}) {
  const byStatus = {};
  for (const c of calls) {
    const st = statusOf(c.leadId, tracking);
    byStatus[st] = byStatus[st] || {};
    (c.analysis?.objections || []).forEach((o) => bump(byStatus[st], o));
  }
  return Object.entries(byStatus)
    .map(([status, counter]) => ({ status, objections: topN(counter, 5) }))
    .filter((r) => r.objections.length);
}

/**
 * Ratio de avance por tipo de objeción: de las llamadas donde apareció cada
 * objeción, qué fracción de leads acabó avanzando. `enough` marca si hay datos
 * suficientes para fiarse de la tasa.
 * @returns {Array<{label,total,advanced,rate,enough}>}
 */
export function objectionAdvanceRate(calls = [], tracking = {}) {
  const agg = {};
  for (const c of calls) {
    const advanced = ADVANCED.has(statusOf(c.leadId, tracking));
    for (const o of c.analysis?.objections || []) {
      agg[o] = agg[o] || { total: 0, advanced: 0 };
      agg[o].total++;
      if (advanced) agg[o].advanced++;
    }
  }
  return Object.entries(agg)
    .map(([label, v]) => ({
      label, total: v.total, advanced: v.advanced,
      rate: v.total ? Math.round((v.advanced / v.total) * 100) : 0,
      enough: v.total >= MIN_SAMPLE,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Patrones en llamadas ganadas vs perdidas: frases de compra de las ganadas y
 * frases de pérdida de las perdidas. Honesto con el tamaño de muestra.
 */
export function winLossPatterns(calls = [], tracking = {}) {
  const isWon = (c) => c.result === "closed_won" || statusOf(c.leadId, tracking) === "won";
  const isLost = (c) => c.result === "closed_lost" || c.result === "not_interested"
    || statusOf(c.leadId, tracking) === "rejected" || statusOf(c.leadId, tracking) === "wrong_fit";
  const won = calls.filter(isWon);
  const lost = calls.filter(isLost);
  const winPhrases = {}; const lossPhrases = {};
  for (const c of won) (c.analysis?.buySignals || []).forEach((p) => bump(winPhrases, trim(p)));
  for (const c of lost) (c.analysis?.lossSignals || []).forEach((p) => bump(lossPhrases, trim(p)));
  return {
    wonSample: won.length, lostSample: lost.length,
    winPhrases: topN(winPhrases, 6), lossPhrases: topN(lossPhrases, 6),
    enough: won.length >= MIN_SAMPLE || lost.length >= MIN_SAMPLE,
  };
}

/**
 * Recomendación práctica para la próxima llamada, derivada de los datos reales.
 * Sin muestra suficiente, devuelve { enough:false } y un texto honesto.
 */
export function nextCallRecommendation({ calls = [], tracking = {} } = {}) {
  if (calls.length < MIN_SAMPLE) {
    return { enough: false, text: `Datos insuficientes: registra al menos ${MIN_SAMPLE} llamadas con análisis para empezar a ver patrones.` };
  }
  const rates = objectionAdvanceRate(calls, tracking).filter((o) => o.enough);
  // La objeción que más frena: con datos suficientes, la de menor tasa de avance
  // (desempata la más frecuente).
  const blocker = rates.slice().sort((a, b) => a.rate - b.rate || b.total - a.total)[0];
  if (blocker && blocker.rate < 50) {
    return {
      enough: true,
      focus: blocker.label,
      text: `La objeción "${blocker.label}" aparece en ${blocker.total} llamadas y solo avanza el ${blocker.rate}%. Prepara una respuesta sólida antes de la próxima llamada.`,
    };
  }
  // Si no hay un freno claro, apunta al sector que mejor responde.
  const mem = buildMemory(calls);
  const best = mem.sectors.find((s) => s.total >= MIN_SAMPLE && s.rate >= 50);
  if (best) {
    return { enough: true, text: `El sector "${best.sector}" responde mejor (${best.rate}% en ${best.total} llamadas). Prioriza captación ahí.` };
  }
  return { enough: true, text: "Sin un patrón dominante todavía: mantén el ritmo y registra cada llamada para afinar la lectura." };
}

/** Compone toda la memoria accionable en un solo objeto para la UI. */
export function actionableMemory({ calls = [], tracking = {} } = {}) {
  return {
    sampleSize: calls.length,
    enough: calls.length >= MIN_SAMPLE,
    objectionAdvance: objectionAdvanceRate(calls, tracking),
    objectionsByResult: objectionsByResult(calls),
    objectionsByStatus: objectionsByStatus(calls, tracking),
    winLoss: winLossPatterns(calls, tracking),
    recommendation: nextCallRecommendation({ calls, tracking }),
  };
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
