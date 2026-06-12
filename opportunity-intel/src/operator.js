// =============================================================================
// operator.js — Operator v1: la capa contextual que interpreta y ejecuta.
//
// NO es un chatbot ni un LLM (eso vendría después, vía Edge Function segura).
// Es lógica local, determinista y honesta que responde a unas pocas intenciones
// sobre UNA oportunidad ya decidida (decide() + buildBrief()):
//
//   explain  — por qué está donde está.
//   defend   — el caso A FAVOR (solo con señales reales; si es débil, lo dice).
//   kill     — el caso EN CONTRA (kill reasons; si no hay, lo dice).
//   angle    — ángulo de entrada + primer mensaje.
//   next     — la próxima acción y su porqué.
//   brief    — el brief en texto.
//
// Tono: breve, operativo, sin humo, sin alucinaciones. Nunca afirma verde donde
// hay gris: se apoya en la decisión (que ya es honesta) y nombra lo desconocido.
//
// PURO y testeable. La UI solo pinta {title, lines[]}.
// =============================================================================

import { briefToText } from "./brief.js";

export const OPERATOR_INTENTS = ["explain", "defend", "kill", "angle", "next", "brief"];

export const OPERATOR_LABELS = {
  explain: "¿Por qué importa?",
  defend: "Defiéndelo",
  kill: "Mátalo",
  angle: "Ángulo de entrada",
  next: "Próxima acción",
  brief: "Brief",
};

const dimsLine = (d) => `Fit ${d.fit} · Pain ${d.pain} · Timing ${d.timing} · Access ${d.access}`;

function explain({ decision }) {
  const d = decision.dimensions;
  const eq = decision.evidenceQuality;
  const lines = [
    `OCI ${decision.oci}/100 — ${decision.decisionLabel}.`,
    dimsLine(d),
    `Evidencia ${eq.label}: ${eq.confirmed} confirmadas, ${eq.indicative} indicios, ${eq.unknown} desconocidas.`,
    decision.decisionWhy,
  ];
  return { title: "Por qué importa", lines };
}

function defend({ decision }) {
  const d = decision.dimensions;
  const strengths = [];
  if (d.pain >= 50) strengths.push("hay dolor/brecha visible");
  if (d.timing >= 50) strengths.push("hay un 'por qué ahora'");
  if (d.access >= 50) strengths.push("el decisor es alcanzable");
  if (d.fit >= 50) strengths.push("encaja con nuestras capacidades");
  if (decision.evidenceQuality.confirmed >= 2) strengths.push("la tesis está respaldada con evidencia citada");
  const lines = strengths.length
    ? [`El caso a favor (OCI ${decision.oci}):`, ...strengths.map((s) => `· ${s}`)]
    : ["Poco que defender con honestidad: las señales fuertes no están confirmadas.", "Antes de invertir tiempo, conseguir evidencia real."];
  if (decision.strategicTag) lines.push(`Valor: ${decision.strategicTag.label}.`);
  return { title: "Defensa", lines };
}

function kill({ decision }) {
  const krs = decision.killReasons || [];
  const lines = krs.length
    ? ["Razones para NO perseguirlo ahora:", ...krs.map((k) => `· ${k.label}`)]
    : ["No hay una razón fuerte para descartarlo.", `Riesgo de descarte: ${decision.killRisk}/100 (bajo).`];
  return { title: "Kill Mode", lines };
}

function angle({ brief }) {
  const lines = [
    `Canal: ${brief.channel}.`,
    `Ángulo: ${brief.openingAngle || "— por confirmar (sin observación real, no hay ángulo)"}.`,
    `Primer mensaje: ${brief.firstMessage}`,
  ];
  return { title: "Ángulo de entrada", lines };
}

function next({ decision }) {
  const a = decision.recommendedAction;
  return { title: "Próxima acción", lines: [a ? `${a.label}.` : "—", a ? a.why : ""].filter(Boolean) };
}

function brief({ brief: b }) {
  return { title: "Opportunity Brief", lines: briefToText(b).split("\n") };
}

const HANDLERS = { explain, defend, kill, angle, next, brief };

/**
 * Responde una intención del Operator sobre una oportunidad.
 * @param {string} intent  uno de OPERATOR_INTENTS
 * @param {{opp, scored, decision, brief}} ctx
 * @returns {{title:string, lines:string[]}}
 */
export function operatorAnswer(intent, ctx = {}) {
  const h = HANDLERS[intent];
  if (!h) return { title: "Operator", lines: ["No sé responder a eso todavía."] };
  return h(ctx);
}

/**
 * "¿Qué hago hoy?" — de una lista de oportunidades ya decididas, las que piden
 * acción ya, ordenadas por OCI. Cada item: { opp, decision }.
 */
export function operatorToday(decided = []) {
  return decided
    .filter((x) => x && x.decision && (x.decision.decision === "ACT_NOW" || x.decision.decision === "PREPARE"))
    .sort((a, b) => b.decision.oci - a.decision.oci);
}

/** Filtra una lista decidida por código de decisión (p.ej. "STRATEGIC_DOOR"). */
export function operatorFilter(decided = [], decisionCode) {
  return decided.filter((x) => x && x.decision && x.decision.decision === decisionCode);
}
