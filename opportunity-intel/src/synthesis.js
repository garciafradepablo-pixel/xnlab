// =============================================================================
// synthesis.js — Síntesis INTELIGENTE del caso: convierte todo lo que sabemos
// (nota, señales ya enriquecidas, decisor, conversión del nicho) en un veredicto
// claro + las palancas accionables. Es la capa que dice "qué significa esto y
// qué hago", por encima del dato. Módulo PURO y testeable (sin DOM).
// =============================================================================

import { FILTER_BY_KEY } from "./models.js";

const tempOf = (c) => (c >= 75 ? "hot" : c >= 58 ? "warm" : "cold");
const TEMP_LABEL = { hot: "CALIENTE", warm: "TEMPLADO", cold: "FRÍO" };

// Filtros que, en verde/amarillo, son PALANCAS de venta accionables.
const LEVER_FILTERS = ["transitionSignal", "actionableLever", "visibleTension", "activePainSignal", "reachableDecisionMaker"];

/**
 * @param {object} lead  con .scores, .signals, .decisionMaker
 * @param {object} [opts] { sectorRate } (de sectorlearning.sectorRate)
 * @returns {{conf,temp,tempLabel,headline,levers,nextAction,sectorRate}}
 */
export function synthesize(lead = {}, opts = {}) {
  const s = lead.scores || {};
  const conf = Math.round(s.confidence || 0);
  const temp = tempOf(conf);
  const signals = lead.signals || {};

  const levers = [];
  for (const k of LEVER_FILTERS) {
    const lv = signals[k]?.level;
    if (lv === "green" || lv === "yellow") {
      levers.push({ key: k, label: FILTER_BY_KEY[k]?.label || k, strong: lv === "green", note: signals[k]?.note || "" });
    }
  }
  if (lead.decisionMaker?.name && !levers.some((l) => l.key === "reachableDecisionMaker")) {
    levers.push({ key: "dm", label: `Decisor: ${lead.decisionMaker.name}`, strong: true, note: "" });
  }
  levers.sort((a, b) => Number(b.strong) - Number(a.strong));
  const top = levers.slice(0, 3);

  const sr = opts.sectorRate && opts.sectorRate.ranked ? opts.sectorRate.rate : null;
  const topTxt = top[0] ? top[0].label.toLowerCase() : null;

  let headline;
  if (temp === "hot") {
    headline = topTxt
      ? `Llamar ya: tienes ${topTxt}${top[1] ? " + " + top[1].label.toLowerCase() : ""}.`
      : "Llamar ya: alta probabilidad de conversación.";
  } else if (temp === "warm") {
    headline = topTxt ? `Prepara y llama: apóyate en ${topTxt}.` : "Encaje razonable; refuerza el ángulo antes de llamar.";
  } else {
    headline = top.length ? `Enriquece antes: solo asoma ${topTxt}; faltan señales.` : "Frío: faltan señales para justificar la llamada.";
  }
  if (sr != null) headline += ` Este nicho cierra ${sr}%.`;

  const nextAction = temp === "hot" ? "Llamar hoy" : temp === "warm" ? "Mini-auditoría y llamar" : "Enriquecer / verificar";

  return { conf, temp, tempLabel: TEMP_LABEL[temp], headline, levers: top, nextAction, sectorRate: sr };
}
