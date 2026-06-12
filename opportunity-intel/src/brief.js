// =============================================================================
// brief.js — Opportunity Brief: el entregable de la capa de decisión.
//
// Convierte una oportunidad decidida (opp + scored + decide()) en un dossier
// breve y defendible: tesis, por qué ahora, dolor observado, evidencia citada,
// QUÉ NO SABEMOS, kill reasons, riesgos, canal, ángulo de entrada, primer
// mensaje y próxima acción.
//
// Honestidad: NO inventa. Los placeholders del lead ("Por confirmar", "Por
// definir"…) se tratan como vacío y se marcan como desconocidos, nunca como
// hechos. Lo que no está probado se nombra como hueco a confirmar.
//
// PURO y testeable. briefToText() lo serializa para copiar/exportar.
// =============================================================================

import { FILTER_BY_KEY } from "./models.js";

const PLACEHOLDER = /(por confirmar|por definir|por anticipar|por preparar|pendiente|sin verificar|completar tesis)/i;

// Limpia un campo de narrativa: vacío o placeholder → null (desconocido honesto).
function clean(s) {
  const t = String(s || "").trim();
  if (!t || PLACEHOLDER.test(t)) return null;
  return t;
}

function recommendedChannel(opp) {
  const dm = opp.decisionMaker || {};
  if (dm.linkedin || opp.linkedin) return "LinkedIn — decisor con perfil";
  if (opp.email) return "Email directo";
  if (opp.phone) return "Teléfono";
  if (opp.instagram) return "Instagram DM";
  return "Sin canal directo — primero conseguir vía de entrada";
}

// Primer mensaje honesto: si hay decisor + ángulo, lo redacta; si falta lo
// esencial, dice qué confirmar antes de escribir (no inventa un gancho falso).
function buildFirstMessage(opp, decision) {
  const dm = opp.decisionMaker || {};
  const angle = clean(opp.firstLever) || clean(opp.thesis);
  if (decision.decision === "KILL" || decision.decision === "OVER_SERVED") {
    return "No escribir todavía: no hay hueco que justifique el contacto.";
  }
  if (!angle) {
    return "Antes de escribir: confirmar una observación concreta (web/marca/momento). Sin ángulo real, no hay primer mensaje.";
  }
  const hi = dm.name ? `Hola ${String(dm.name).split(" ")[0]},` : "Hola,";
  return `${hi} al ver ${opp.company || "vuestro proyecto"} me quedé con una idea concreta: ${angle.charAt(0).toLowerCase()}${angle.slice(1)}. ¿Te viene bien que te la cuente en 10 minutos?`;
}

/**
 * Construye el Opportunity Brief.
 * @param {object} opp       oportunidad
 * @param {object} scored    salida de scoreOpportunity(opp)
 * @param {object} decision  salida de decide(opp, scored)
 * @returns {object} brief estructurado
 */
export function buildBrief(opp = {}, scored = {}, decision = {}) {
  const unknowns = ((scored.verification && scored.verification.gapFilters) || [])
    .map((k) => (FILTER_BY_KEY[k] && FILTER_BY_KEY[k].label) || k);
  const evidence = (opp.evidence || []).map((e) => ({
    note: e.note || "",
    source: e.source || e.type || "",
    url: e.url || null,
    confirmed: !!e.url,
  }));
  return {
    name: opp.company || "Sin nombre",
    sector: opp.sector || null,
    city: opp.city || null,
    oci: decision.oci,
    decision: decision.decision,
    decisionLabel: decision.decisionLabel,
    decisionWhy: decision.decisionWhy,
    dimensions: decision.dimensions,
    evidenceQuality: decision.evidenceQuality,
    strategicTag: decision.strategicTag,
    economic: decision.econLabel,
    thesis: clean(opp.thesis),
    whyNow: clean(opp.whyNow),
    pain: clean(opp.firstLever) || clean(opp.summary),
    evidence,
    unknowns,
    killReasons: decision.killReasons || [],
    risks: (opp.reasonsNotToCall || []).filter(Boolean),
    channel: recommendedChannel(opp),
    openingAngle: clean(opp.firstLever) || clean(opp.thesis),
    firstMessage: buildFirstMessage(opp, decision),
    nextAction: decision.recommendedAction,
  };
}

const UNK = "— (por confirmar)";

/** Serializa el brief a texto plano (copiar / futura exportación). */
export function briefToText(b) {
  const L = [];
  L.push(`OPPORTUNITY BRIEF — ${b.name}`);
  L.push(`${[b.sector, b.city].filter(Boolean).join(" · ") || "sector/ubicación por confirmar"}`);
  L.push("");
  L.push(`OCI ${b.oci}/100 · Decisión: ${b.decisionLabel} — ${b.decisionWhy}`);
  L.push(`Valor estratégico: ${b.strategicTag ? b.strategicTag.label : "—"}${b.economic ? ` · economía ${b.economic}` : ""}`);
  L.push(`Fit ${b.dimensions.fit} · Pain ${b.dimensions.pain} · Timing ${b.dimensions.timing} · Access ${b.dimensions.access}`);
  L.push(`Evidencia: ${b.evidenceQuality.label} (${b.evidenceQuality.confirmed} confirmadas · ${b.evidenceQuality.indicative} indicios · ${b.evidenceQuality.unknown} desconocidas)`);
  L.push("");
  L.push(`Tesis: ${b.thesis || UNK}`);
  L.push(`Por qué ahora: ${b.whyNow || UNK}`);
  L.push(`Dolor / brecha: ${b.pain || UNK}`);
  if (b.unknowns.length) L.push(`Qué NO sabemos: ${b.unknowns.join(", ")}`);
  if (b.killReasons.length) L.push(`Kill reasons: ${b.killReasons.map((k) => k.label).join("; ")}`);
  if (b.risks.length) L.push(`Riesgos: ${b.risks.join("; ")}`);
  L.push("");
  L.push(`Canal: ${b.channel}`);
  L.push(`Ángulo: ${b.openingAngle || UNK}`);
  L.push(`Primer mensaje: ${b.firstMessage}`);
  L.push(`Próxima acción: ${b.nextAction ? b.nextAction.label : "—"}`);
  return L.join("\n");
}
