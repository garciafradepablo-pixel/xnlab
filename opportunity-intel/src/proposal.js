// =============================================================================
// proposal.js — Propuesta de colaboración por lead (Fase: cerrar el círculo).
//
// El paso que faltaba entre "guion de llamada" y "cliente firmado": el documento
// que ENVÍAS tras una buena conversación para que el prospecto dé el sí al
// siguiente paso. Su cierre NO es la venta — es **agendar el diagnóstico** (la
// métrica norte). Coherente con la marca: NUNCA cita precio; la inversión se
// concreta en privado, en el diagnóstico.
//
// Honestidad de la casa: no inventa señales. Usa lo investigado (whyNow, tesis,
// servicio encajado); donde falta, lo marca como "a confirmar" en vez de
// fabricarlo. Módulo PURO y testeable (sin DOM).
// =============================================================================

import { TENSION_TYPES } from "./models.js";

const brandOf = (cls) => (cls === "xn" ? "XN LAB" : "01 Agency");
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Ventanas de duración e intensidad SIN número económico (lo permite la marca:
// duración e intensidad sí; precio no).
const SHAPE = {
  "01": { window: "2–4 semanas", intensity: "sprint de alta intensidad", move: "un primer movimiento acotado" },
  xn: { window: "8–12 semanas", intensity: "transformación continua con dirección", move: "una transformación de fondo" },
};

function moment(opp) {
  if (opp?.whyNow) return opp.whyNow;
  const tr = (opp?.evidence || []).find((e) => e.filter === "transitionSignal" && e.note);
  return tr ? tr.note : null;
}
function tensions(opp) {
  return (opp?.tensions || []).map((t) => TENSION_TYPES[t] || t.replace(/_/g, " "));
}

/**
 * Compone la propuesta de un lead.
 * @param {object} opp   oportunidad con `.scores`
 * @param {object} [opts] { service } servicio mejor encajado (matchServices)
 * @returns {{title, brand, sections:Array<{h,body}>, cta, gaps:string[]}}
 */
export function buildProposal(opp, opts = {}) {
  const s = opp?.scores || {};
  const cls = s.classification === "xn" ? "xn" : "01";
  const brand = brandOf(cls);
  const shape = SHAPE[cls];
  const svc = opts.service || null;
  const mom = moment(opp);
  const tns = tensions(opp);
  const company = opp?.company || "vuestra marca";

  const sections = [];

  // Contexto — lo que vemos (citado; honesto si falta).
  sections.push({
    h: "El momento",
    body: mom
      ? cap(mom)
      : `Estáis en un punto de inflexión que conviene confirmar juntos: por eso proponemos empezar por un diagnóstico, no por un presupuesto.`,
  });

  // Lectura — la tesis / palanca.
  const read = opp?.thesis || opp?.firstLever || opp?.blindSpot ||
    (tns.length ? `Lo que solemos ver en este momento: ${tns.join(", ").toLowerCase()}.` : null);
  if (read) sections.push({ h: "Lo que vemos", body: cap(read) });

  // Lo que proponemos — alcance, intensidad, duración. SIN precio.
  let propose = `${cap(shape.move)} para ${company}: ${shape.intensity}, en una ventana de ${shape.window}.`;
  if (svc) propose = `${svc.name} — ${svc.solves}. ${propose}`;
  sections.push({ h: "Lo que proponemos", body: propose });

  // Lo que produce — entregable / resultado.
  const produces = svc?.produces ||
    (cls === "xn"
      ? "Una marca y una operación alineadas: dirección estratégica, sistema de marca y ejecución sostenida que cambia cómo os percibe el mercado."
      : "Una palanca de captación funcionando: marca y web a la altura de vuestro momento, lista para convertir.");
  sections.push({ h: "Lo que produce", body: cap(produces) });

  // Por qué nosotros — autoridad, en la voz del estudio (sin fundador, sin humo).
  sections.push({
    h: "Por qué nosotros",
    body: cls === "xn"
      ? "Dirigimos el proyecto como un estudio: la IA es nuestro equipo de producción bajo dirección, no una fábrica de contenido. Lo que sale lleva criterio, no volumen."
      : "Trabajamos por encaje, no por volumen: pocas marcas, cada movimiento defendible. Llegamos con una lectura, no con una plantilla.",
  });

  // Cierre — el siguiente paso ES la métrica norte: agendar el diagnóstico.
  const cta = "El siguiente paso es una llamada de diagnóstico de 20 minutos: salís con una lectura clara de vuestro caso aunque no trabajemos juntos. La inversión la concretamos ahí, en privado, cuando ya hay caso.";

  // Huecos a cerrar antes de enviar (honestidad).
  const gaps = [];
  if (!mom) gaps.push("Confirmar y citar el momento (apertura / ronda / expansión) antes de enviar.");
  if (!tns.length) gaps.push("Verificar la tensión real (web / reseñas) para personalizar 'Lo que vemos'.");
  if (!opp?.decisionMaker?.name) gaps.push("Dirigir la propuesta al decisor concreto.");

  return { title: `Propuesta de colaboración — ${company} × ${brand}`, brand, sections, cta, gaps };
}

/** Renderiza la propuesta como texto plano (para copiar/enviar). */
export function proposalToText(opp, p) {
  const L = [p.title, ""];
  for (const sec of p.sections) {
    L.push(`${sec.h.toUpperCase()}`);
    L.push(`  ${sec.body}`);
    L.push("");
  }
  L.push("SIGUIENTE PASO");
  L.push(`  ${p.cta}`);
  if (p.gaps.length) {
    L.push("");
    L.push("[Interno — confirmar antes de enviar:]");
    for (const g of p.gaps) L.push(`  · ${g}`);
  }
  return L.join("\n");
}
