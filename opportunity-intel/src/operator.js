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

// =============================================================================
// Operator GLOBAL — buckets del feed + comandos de la Command Bar.
//
// Convierte la capa de decisión en la superficie de trabajo: agrupa las
// oportunidades en cuatro cubos accionables y traduce comandos en lenguaje
// natural ("qué hago hoy", "mata ruido", "strategic doors") en un FOCO del feed
// o una respuesta corta. Sin LLM: reglas locales, deterministas, testeables.
// =============================================================================

// Los cubos de cabecera. Cada uno = un conjunto de decisiones. Disjuntos por
// diseño (lo que se ataca nunca se mezcla con lo que se mata).
export const BUCKETS = [
  { key: "actNow", label: "Act Now", decisions: ["ACT_NOW"] },
  { key: "needsEvidence", label: "Needs Evidence", decisions: ["NEEDS_EVIDENCE", "ENRICH"] },
  { key: "strategicDoors", label: "Strategic Doors", decisions: ["STRATEGIC_DOOR"] },
  { key: "killedNoise", label: "Killed Noise", decisions: ["KILL", "OVER_SERVED"] },
];

/**
 * Agrupa oportunidades decididas en los cubos de cabecera.
 * @param {Array<{opp,decision}>} decided
 * @returns {{actNow:Array, needsEvidence:Array, strategicDoors:Array, killedNoise:Array, all:Array}}
 */
export function bucketize(decided = []) {
  const out = { actNow: [], needsEvidence: [], strategicDoors: [], killedNoise: [], all: decided.slice() };
  for (const x of decided) {
    const code = x && x.decision && x.decision.decision;
    for (const b of BUCKETS) if (b.decisions.includes(code)) out[b.key].push(x);
  }
  return out;
}

const cnorm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const COMMAND_SUGGESTIONS = ["qué hago hoy", "dame los mejores", "mata ruido", "strategic doors", "needs evidence", "leads para XN", "leads para 01"];

/**
 * Interpreta un comando de la Command Bar. PURO: no toca estado.
 * @param {string} text
 * @returns {{kind:"decision"|"top"|"classification"|"clear"|"unknown", label:string, decisions?:string[], sort?:string, value?:string, suggestions?:string[]}}
 */
export function parseCommand(text) {
  const n = cnorm(text);
  if (!n) return { kind: "clear", label: "Todo" };
  const has = (...w) => w.some((x) => n.includes(x));
  if (has("hoy", "today", "que hago", "atacar", "ataco")) return { kind: "decision", decisions: ["ACT_NOW", "PREPARE"], sort: "oci", label: "Hoy" };
  if (has("mejor", "best", "top ", "los mejores")) return { kind: "top", label: "Mejores" };
  if (has("mata", "matar", "kill", "ruido", "noise", "descarta", "basura")) return { kind: "decision", decisions: ["KILL", "OVER_SERVED"], label: "Ruido" };
  if (has("strateg", "estrateg", "puerta", "door")) return { kind: "decision", decisions: ["STRATEGIC_DOOR"], label: "Strategic Doors" };
  if (has("evidenc", "enrich", "enriquec", "faltan datos", "needs evidence")) return { kind: "decision", decisions: ["NEEDS_EVIDENCE", "ENRICH"], label: "Needs Evidence" };
  if (has("xn")) return { kind: "classification", value: "xn", label: "Leads XN" };
  if (has(" 01", "01", "cero uno")) return { kind: "classification", value: "01", label: "Leads 01" };
  if (has("limpia", "reset", "todas", "todo", "clear", "quita")) return { kind: "clear", label: "Todo" };
  return { kind: "unknown", label: String(text || "").trim(), suggestions: COMMAND_SUGGESTIONS };
}

/**
 * Aplica un comando ya parseado sobre la lista decidida. PURO.
 * @param {Array<{opp,decision}>} decided
 * @param {object|null} cmd  salida de parseCommand
 * @returns {Array<{opp,decision}>}
 */
export function applyCommand(decided = [], cmd) {
  if (!cmd || cmd.kind === "clear" || cmd.kind === "unknown") return decided;
  if (cmd.kind === "top") return decided.slice().sort((a, b) => b.decision.oci - a.decision.oci);
  if (cmd.kind === "decision") {
    const set = new Set(cmd.decisions);
    let r = decided.filter((x) => set.has(x.decision.decision));
    if (cmd.sort === "oci") r = r.sort((a, b) => b.decision.oci - a.decision.oci);
    return r;
  }
  if (cmd.kind === "classification") {
    return decided.filter((x) => x.opp && x.opp.scores && x.opp.scores.classification === cmd.value);
  }
  // Foco "Recién importados": filtra por el conjunto exacto de ids que se acaban
  // de pegar. No mira clasificación ni OCI — son leads que el usuario quiere ver
  // YA, aunque sean 'unqualified'. El scoring no cambia: solo lo que se muestra.
  if (cmd.kind === "recent") {
    const set = new Set(cmd.ids || []);
    return decided.filter((x) => x.opp && set.has(x.opp.id));
  }
  return decided;
}

/**
 * Respuesta ejecutiva de UNA línea para un comando, a partir de datos REALES del
 * feed. No inventa: si no hay datos, lo dice. Comando desconocido → sugerencias.
 * @param {object|null} cmd     salida de parseCommand (o el foco activo)
 * @param {Array<{opp,decision}>} focused  resultado de applyCommand(decided, cmd)
 * @returns {string} línea corta (o "" si no hay comando)
 */
export function commandAnswer(cmd, focused = []) {
  if (!cmd || cmd.kind === "clear") return "";
  if (cmd.kind === "unknown") return `No entendí «${cmd.label}». Prueba: ${(cmd.suggestions || []).join(" · ")}.`;
  const n = focused.length;
  const ops = `${n} oportunidad${n === 1 ? "" : "es"}`; // plural irregular en español
  const best = focused[0];

  if (cmd.kind === "recent") {
    return n
      ? `${ops} recién importada${n === 1 ? "" : "s"} — revísalas y enriquece su web antes de decidir.`
      : "No hay importaciones recientes que mostrar.";
  }

  if (cmd.kind === "top") {
    if (!n) return "No hay oportunidades con los datos actuales.";
    return `Top por OCI: ${best.opp.company} (OCI ${best.decision.oci}). ${ops} ordenadas.`;
  }
  if (cmd.kind === "classification") {
    const tag = String(cmd.value || "").toUpperCase();
    return n ? `${n} lead${n === 1 ? "" : "s"} para ${tag}.` : `No hay leads para ${tag} con los datos actuales.`;
  }
  // kind === "decision": el mensaje depende del conjunto de decisiones.
  const set = new Set(cmd.decisions || []);
  if (set.has("ACT_NOW")) {
    if (!n) return "No hay nada que atacar ahora con los datos actuales.";
    return `Ataca ${ops} ahora. Mejor prioridad: ${best.opp.company} · OCI ${best.decision.oci} · razón: ${best.decision.decisionWhy}`;
  }
  if (set.has("KILL")) {
    return n ? `Hay ${ops} que conviene matar o ignorar por baja señal.` : "No hay ruido que matar ahora: nada cae en descarte.";
  }
  if (set.has("NEEDS_EVIDENCE")) {
    return n ? `${ops} necesitan evidencia antes de actuar.` : "Ninguna pendiente de evidencia ahora mismo.";
  }
  if (set.has("STRATEGIC_DOOR")) {
    return n ? `${n} puerta${n === 1 ? "" : "s"} estratégica${n === 1 ? "" : "s"} detectada${n === 1 ? "" : "s"}. No todas son cash inmediato.` : "Ninguna puerta estratégica con los datos actuales.";
  }
  return n ? `${ops} en «${cmd.label}».` : `Nada en «${cmd.label}» con los datos actuales.`;
}

