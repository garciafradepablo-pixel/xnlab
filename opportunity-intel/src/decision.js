// =============================================================================
// decision.js — Opportunity Decision Layer (OCI).
//
// Connect no es un scorer más: es la CAPA DE DECISIÓN entre señales crudas y la
// acción comercial. Este módulo NO toca el motor (scoring.js); lee lo que el
// motor ya produce (señales verde/amarillo/gris, evidencia citada, flags,
// verificación) y lo traduce a una decisión operativa y defendible:
//
//   - OCI (Opportunity Confidence Index) explicado, no caja negra.
//   - Cuatro dimensiones visibles: Fit · Pain · Timing · Access.
//   - Evidence Quality: confirmado (verde citado) / indicio (amarillo) / desconocido (gris).
//   - Kill Risk + Kill Reasons: por qué NO perseguir esto (protege tiempo).
//   - Decisión recomendada: ACT_NOW, PREPARE, ENRICH, WATCH, STRATEGIC_DOOR,
//     KILL, OVER_SERVED, NO_ACCESS, NO_TIMING, NEEDS_EVIDENCE.
//   - Strategic Value Tag: Cash Lead, Strategic Door, Brand Signal, …
//
// Honestidad estructural (innegociable):
//   1. El gris NUNCA cuenta como confirmado ni sube el OCI.
//   2. Una web bonita / muchos servicios (Fit alto) NO sube el OCI por sí sola:
//      sin dolor, sin momento o sin acceso, es "buena empresa, mal lead".
//   3. La falta de información baja la confianza, no la disfraza de ventaja.
//
// PURO y testeable: dado (opp, scored) deterministas, salida determinista.
// =============================================================================

import { levelValue } from "./scoring.js";
import { LEVELS, ECONOMIC_LABELS } from "./models.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n) => Math.round(n);

// Nivel de un filtro (gris por defecto: "no sabemos" = conservador).
function lvl(opp, key) {
  const s = opp && opp.signals && opp.signals[key];
  return s && LEVELS[s.level] ? s.level : "grey";
}
// Valor 0..100 de un filtro, con el mismo blend conservador del motor.
function v(opp, key, c) {
  return levelValue(lvl(opp, key), c) * 100;
}

// Las cuatro dimensiones de la decisión, como mezcla de los filtros del motor.
// (No inventan nada: reagrupan las mismas señales en el lenguaje de la decisión.)
const DIMENSIONS = {
  fit: [["strategicFit", 0.5], ["economicCapacity", 0.3], ["brutalFinalFilter", 0.2]],
  pain: [["activePainSignal", 0.45], ["visibleTension", 0.35], ["actionableLever", 0.2]],
  timing: [["whyNow", 0.55], ["transitionSignal", 0.45]],
  access: [["reachableDecisionMaker", 0.6], ["budgetPriority", 0.4]],
};

function dimension(opp, defn, c) {
  return round(defn.reduce((s, [k, w]) => s + v(opp, k, c) * w, 0));
}

/**
 * Evidence Quality: cuánto de la tesis está realmente probado.
 *   - confirmado = filtro verde/amarillo CON cita (url) — lo de verdad probado.
 *   - indicio    = amarillo sin cita.
 *   - desconocido= gris (no suma nada).
 * El score pondera: verde citado 1.0, verde sin cita 0.5, amarillo citado 0.6,
 * amarillo sin cita 0.3, gris 0, rojo 0 (probado-negativo, no es "calidad").
 */
export function evidenceQuality(opp, scored) {
  const verified = new Set((scored.verification && scored.verification.verifiedFilters) || []);
  const flags = scored.flags || { green: 0, yellow: 0, grey: 0, red: 0 };
  let pts = 0;
  let confirmed = 0;
  let indicative = 0;
  const FILTER_KEYS = [
    "transitionSignal", "economicCapacity", "visibleTension", "actionableLever",
    "activePainSignal", "whyNow", "reachableDecisionMaker", "budgetPriority",
    "strategicFit", "brutalFinalFilter",
  ];
  for (const k of FILTER_KEYS) {
    const level = lvl(opp, k);
    const cited = verified.has(k);
    if (level === "green") { pts += cited ? 1.0 : 0.5; if (cited) confirmed++; }
    else if (level === "yellow") { pts += cited ? 0.6 : 0.3; if (cited) confirmed++; else indicative++; }
  }
  const score = clamp(round((pts / FILTER_KEYS.length) * 100));
  const unknown = flags.grey;
  const label = score >= 60 ? "sólida" : score >= 30 ? "parcial" : "débil";
  return { score, confirmed, indicative, unknown, label, citedShare: (scored.verification && scored.verification.verifiedShare) || 0 };
}

// Catálogo de razones de descarte (código → etiqueta). Kill Mode no es pesimista:
// solo añade la razón cuando de verdad aplica.
export const KILL_REASONS = {
  over_served: "Demasiado servido — sin hueco visible",
  no_visible_pain: "Sin dolor visible",
  no_timing: "Sin momento (no hay 'por qué ahora')",
  no_access: "Sin acceso realista al decisor",
  weak_evidence: "Evidencia débil — casi todo sin confirmar",
  low_budget_signal: "Señal de presupuesto baja",
  poor_strategic_fit: "Mal encaje estratégico",
  too_many_reds: "Varias pruebas negativas (banderas rojas)",
  needs_more_evidence: "Faltan datos — demasiado gris para decidir",
};

function killReasonsFor({ fit, pain, timing, access }, eq, scored, opp) {
  const out = [];
  const add = (code) => out.push({ code, label: KILL_REASONS[code] });
  // Demasiado servido / ya óptima: buen encaje pero sin hueco visible. Estricto —
  // no exige también mal momento: si encaja bien y no hay dolor, ya está servida.
  if (fit >= 60 && pain < 38) add("over_served");
  if (pain < 32) add("no_visible_pain");
  if (timing < 30) add("no_timing");
  if (access < 30) add("no_access");
  if (eq.score < 25) add("weak_evidence");
  if (lvl(opp, "budgetPriority") === "red" || lvl(opp, "economicCapacity") === "red") add("low_budget_signal");
  if (lvl(opp, "strategicFit") === "red" || fit < 30) add("poor_strategic_fit");
  if ((scored.redCount || 0) >= 3) add("too_many_reds");
  if ((eq.unknown || 0) >= 6) add("needs_more_evidence");
  return out;
}

function killRisk({ pain, timing, access }, eq, scored, killReasons) {
  let r = (scored.redCount || 0) * 16;
  if (killReasons.some((k) => k.code === "over_served")) r += 32;
  if (access < 30) r += 22;
  if (eq.score < 25) r += 18;
  if ((eq.unknown || 0) >= 6) r += 14;
  if (pain < 30 && timing < 30) r += 16;
  return clamp(round(r));
}

// Decisiones operativas (código → etiqueta breve y por qué).
export const DECISIONS = {
  ACT_NOW: "Actuar ya",
  PREPARE: "Preparar y llamar",
  ENRICH: "Enriquecer antes",
  WATCH: "Vigilar",
  STRATEGIC_DOOR: "Puerta estratégica",
  KILL: "Descartar",
  OVER_SERVED: "Demasiado servido",
  NO_ACCESS: "Sin acceso",
  NO_TIMING: "Sin momento",
  NEEDS_EVIDENCE: "Faltan datos",
};

// Tags de valor estratégico (código → etiqueta).
export const STRATEGIC_TAGS = {
  cash: "Cash Lead",
  strategic_door: "Strategic Door",
  brand_signal: "Brand Signal",
  ecosystem_node: "Ecosystem Node",
  partnership: "Partnership Candidate",
  learning: "Learning Lead",
  noise: "Noise",
};

const PREMIUM_SECTORS = new Set(["realestate", "hospitality"]);

// -----------------------------------------------------------------------------
// Lentes estratégicas — qué MUNDO toca cada oportunidad. No es el motor de
// scoring (eso es lenses.js por sector); es una etiqueta de POSICIÓN estratégica
// para leer el ecosistema. Se deriva SOLO de datos reales del lead (nombre,
// subsector, sector, tesis); si nada lo respalda, NO se inventa etiqueta.
// -----------------------------------------------------------------------------
export const STRATEGIC_LENSES = {
  longevity: "Longevity",
  frontier_communities: "Frontier Communities",
  web3: "Web3",
  wellness: "Wellness",
  ai_automation: "AI Automation",
  hospitality: "Hospitality",
  creative_ip: "Creative / IP",
  capital_investors: "Capital / Investors",
};

// Orden = prioridad (lo más específico primero). Patrones sobre texto ya
// normalizado (minúsculas, sin acentos).
const LENS_PATTERNS = [
  ["longevity", /longevity|longevidad|biohack|anti.?aging|healthspan|epigenet/],
  ["frontier_communities", /pop.?up city|frontier|network state|intentional communit|zuzalu|comunidad(es)? frontera|nomad/],
  ["web3", /web3|crypto|blockchain|smart ?contract|\bnft\b|\bdao\b|on.?chain|tokeniz/],
  ["wellness", /wellness|bienestar|\bspa\b|retreat|retiro|holistic|mindful|yoga|biohacking/],
  ["ai_automation", /\bai\b|inteligencia artificial|automatiz|automation|agentic|\bllm\b|machine learning/],
  ["hospitality", /hospitality|hosteler|hotel|restaurant|boutique|resort|gastro/],
  ["creative_ip", /creativ|estudio creativ|productora|branding|intellectual propert|content studio|media house/],
  ["capital_investors", /\bvc\b|venture|investor|inversor|family office|\bfund\b|fondo de inversion|private equity/],
];

/**
 * Lente estratégica de una oportunidad, o null si los datos no la respaldan.
 * @param {object} opp
 * @returns {{code:string, label:string}|null}
 */
export function strategicLens(opp = {}) {
  const hay = [opp.company, opp.subsector, opp.sector, opp.thesis, opp.summary]
    .filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const [code, re] of LENS_PATTERNS) if (re.test(hay)) return { code, label: STRATEGIC_LENSES[code] };
  // Respaldo por sector real (dato existente): hostelería → Hospitality.
  if (opp.sector === "hospitality") return { code: "hospitality", label: STRATEGIC_LENSES.hospitality };
  return null;
}


function strategicTag({ fit, access }, oci, scored, decision, opp) {
  const econ = scored.economicPotential;
  const cashReady = (econ === "high" || econ === "very high") && access >= 40;
  if (decision === "KILL" || oci < 25) return { code: "noise", label: STRATEGIC_TAGS.noise };
  if (cashReady && (decision === "ACT_NOW" || decision === "PREPARE")) return { code: "cash", label: STRATEGIC_TAGS.cash };
  // Encaje alto pero aún no monetizable ahora (sin timing/acceso) → puerta.
  if (fit >= 60 && decision !== "ACT_NOW") return { code: "strategic_door", label: STRATEGIC_TAGS.strategic_door };
  if (PREMIUM_SECTORS.has(opp.sector) && lvl(opp, "strategicFit") === "green") return { code: "brand_signal", label: STRATEGIC_TAGS.brand_signal };
  if (oci < 45) return { code: "learning", label: STRATEGIC_TAGS.learning };
  return { code: "cash", label: STRATEGIC_TAGS.cash };
}

function deriveDecision({ fit, pain, timing, access }, eq, scored, oci, killReasons) {
  const has = (code) => killReasons.some((k) => k.code === code);
  // Descarte duro: pruebas negativas reales (no falta de datos).
  if (scored.classification === "discard" || has("too_many_reds") || has("poor_strategic_fit")) return "KILL";
  // Buena empresa, mal lead: encaje alto sin dolor ni momento.
  if (has("over_served")) return "OVER_SERVED";
  // Demasiado gris para decidir → primero conseguir evidencia.
  if (has("needs_more_evidence") || eq.score < 22) return "NEEDS_EVIDENCE";
  // Sin forma realista de entrar.
  if (access < 30) return "NO_ACCESS";
  // Buen encaje y dolor, pero sin "por qué ahora" → vigilar / puerta.
  if (timing < 30 && pain >= 35 && fit >= 45) {
    return fit >= 60 ? "STRATEGIC_DOOR" : "NO_TIMING";
  }
  // Oportunidad fuerte: opening real (dolor), acceso y evidencia mínima.
  if (oci >= 66 && pain >= 45 && access >= 40 && eq.score >= 40) return "ACT_NOW";
  if (oci >= 50) return "PREPARE";
  if (eq.score < 40) return "ENRICH";
  return "WATCH";
}

// Por qué de cada decisión (texto breve, operativo, sin humo).
function decisionWhy(decision, dims, eq) {
  switch (decision) {
    case "ACT_NOW": return "Opening real, acceso y evidencia suficiente: llama hoy.";
    case "PREPARE": return "Buena base; llega con una observación concreta antes de llamar.";
    case "ENRICH": return "Falta evidencia citada: confirma señales antes de gastar una llamada.";
    case "NEEDS_EVIDENCE": return "Demasiado gris para decidir: reúne datos primero.";
    case "NO_ACCESS": return "Sin decisor alcanzable: consigue una vía de entrada o aparca.";
    case "NO_TIMING": return "Encaja, pero no hay 'por qué ahora': vigila el gatillo.";
    case "STRATEGIC_DOOR": return "No es caja inmediata, pero abre red/ecosistema: cultívala.";
    case "OVER_SERVED": return "Buena empresa, mal lead: ya está bien servida, sin hueco.";
    case "KILL": return "No merece tu atención ahora: protege el tiempo.";
    default: return "Mantener en el radar; revísala si abre hueco.";
  }
}

/**
 * Decide sobre una oportunidad ya puntuada. No muta nada.
 * @param {object} opp     oportunidad (con .signals, .sector, .evidence)
 * @param {object} scored  salida de scoreOpportunity(opp)
 * @param {object} [opts]  { conservatism }
 * @returns {{oci:number, dimensions:{fit,pain,timing,access}, evidenceQuality:object,
 *   killRisk:number, killReasons:Array, decision:string, decisionLabel:string,
 *   decisionWhy:string, strategicTag:object, recommendedAction:object}}
 */
export function decide(opp = {}, scored = {}, opts = {}) {
  const c = typeof opts.conservatism === "number" ? opts.conservatism : 0.8;
  const dims = {
    fit: dimension(opp, DIMENSIONS.fit, c),
    pain: dimension(opp, DIMENSIONS.pain, c),
    timing: dimension(opp, DIMENSIONS.timing, c),
    access: dimension(opp, DIMENSIONS.access, c),
  };
  const eq = evidenceQuality(opp, scored);
  const killReasons = killReasonsFor(dims, eq, scored, opp);
  const kRisk = killRisk(dims, eq, scored, killReasons);

  // OCI: base ponderada → gateada por evidencia (sin pruebas no hay confianza)
  // → penalizada por kill risk → con topes de honestidad (over-served / sin acceso).
  const base = dims.fit * 0.28 + dims.pain * 0.30 + dims.timing * 0.22 + dims.access * 0.20;
  const confidenceFactor = 0.55 + 0.45 * (eq.score / 100);
  let oci = base * confidenceFactor - kRisk * 0.25;
  if (killReasons.some((k) => k.code === "over_served")) oci = Math.min(oci, 28);
  // Gate estricto por dolor: sin hueco visible no hay oportunidad, por bueno que
  // sea el encaje. Una empresa que ya trabaja de forma óptima NO es objetivo.
  if (dims.pain < 35) oci = Math.min(oci, 30);
  if (dims.access < 30) oci = Math.min(oci, 42);
  oci = clamp(round(oci));

  const decision = deriveDecision(dims, eq, scored, oci, killReasons);
  const tag = strategicTag(dims, oci, scored, decision, opp);

  return {
    oci,
    dimensions: dims,
    evidenceQuality: eq,
    killRisk: kRisk,
    killReasons,
    decision,
    decisionLabel: DECISIONS[decision],
    decisionWhy: decisionWhy(decision, dims, eq),
    strategicTag: tag,
    recommendedAction: { code: decision, label: DECISIONS[decision], why: decisionWhy(decision, dims, eq) },
    econLabel: ECONOMIC_LABELS[scored.economicPotential] || scored.economicPotential || null,
  };
}
