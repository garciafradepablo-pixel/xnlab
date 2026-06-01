// =============================================================================
// playbook.js — Guion + mini-dossier por lead (Fase 10).
//
// De "a quién llamar" a "QUÉ decir y qué mandar". Dado un lead ya puntuado,
// compone un guion de llamada (apertura, observación, oferta, cierre), una
// objeción con respuesta y un mini-dossier — en la voz de 01 / XN LAB.
//
// Honestidad absoluta (regla de la casa): NO inventa. Prefiere la copia ya
// investigada del lead (callOpening, firstLever, objection…); donde falta una
// señal, lo dice como "hueco a confirmar" en vez de fabricarla. Y NUNCA cita
// precio: el cierre agenda una llamada de diagnóstico; el número se habla en
// privado después (regla de opacidad comercial de la marca).
//
// Módulo PURO y testeable (sin DOM). La UI solo pinta lo que decide.
// =============================================================================

import { TENSION_TYPES } from "./models.js";

const SECTOR_VOICE = {
  health: "clínicas", hospitality: "hostelería premium",
  realestate: "inmobiliario de lujo", growth: "marcas en crecimiento",
};

// 01 es la agencia paraguas; toda llamada se hace en su nombre.
const brandOf = (_cls) => "01";
const firstName = (opp) => {
  const n = opp?.decisionMaker?.name || "";
  return n ? n.trim().split(/\s+/)[0] : "Hola";
};
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const sectorWord = (opp) => SECTOR_VOICE[opp?.sector] || "vuestro sector";

// El momento conocido, citado si lo hay; null si no se sabe (no se inventa).
function knownMoment(opp) {
  if (opp?.whyNow) return opp.whyNow;
  const tr = (opp?.evidence || []).find((e) => e.filter === "transitionSignal" && e.note);
  return tr ? tr.note : null;
}

// Las tensiones conocidas, en etiqueta legible; [] si no hay.
function knownTensions(opp) {
  return (opp?.tensions || []).map((t) => TENSION_TYPES[t] || t.replace(/_/g, " "));
}

/**
 * Compone el guion + dossier de un lead.
 * @param {object} opp  oportunidad con `.scores` ya calculado
 * @param {object} [opts]  { topService } servicio mejor encajado (de matchServices)
 * @returns {{script, objection, dossier, gaps}}
 */
export function buildPlaybook(opp, opts = {}) {
  const s = opp?.scores || {};
  const cls = s.classification;
  const brand = brandOf(cls);
  const name = firstName(opp);
  const moment = knownMoment(opp);
  const tensions = knownTensions(opp);
  const top = opts.topService || null;

  // ── Apertura ──────────────────────────────────────────────────────────────
  let opener;
  if (opp?.callOpening) {
    opener = opp.callOpening; // copia ya investigada, intacta
  } else if (moment) {
    opener = `${name}, soy [tu nombre] de ${brand}. Os sigo de cerca — ${moment}`;
  } else {
    opener = `${name}, soy [tu nombre] de ${brand}. Trabajamos con ${sectorWord(opp)} y quería hablar cinco minutos con ${opp?.company || "vosotros"}.`;
  }

  // ── Observación / palanca ──────────────────────────────────────────────────
  let observation;
  if (opp?.firstLever) observation = cap(opp.firstLever);
  else if (opp?.blindSpot) observation = cap(opp.blindSpot);
  else if (opp?.thesis) observation = cap(opp.thesis);
  else if (tensions.length) observation = `Lo que solemos ver en este momento es ${tensions[0].toLowerCase()} — y suele costar margen en silencio.`;
  else observation = "Antes de proponeros nada, me gustaría confirmar un par de cosas de vuestra web y de vuestro momento.";

  // ── Oferta (SIN precio: alcance e intensidad, nunca el número) ─────────────
  let offer = cls === "xn"
    ? "El primer movimiento sería una transformación de fondo: dirección estratégica y ejecución continua durante varias semanas, no un parche."
    : "El primer movimiento sería acotado: revisamos marca y web, y dejamos una palanca de captación funcionando en pocas semanas.";
  if (top) offer = `${top.name}: ${top.solves}. ${offer}`;

  // ── Cierre (agenda diagnóstico; el precio se habla en privado después) ─────
  const close = "¿Te encaja una llamada de diagnóstico de veinte minutos esta semana? Sin compromiso: salís con una lectura clara aunque no trabajemos juntos.";

  // ── Objeción + respuesta ───────────────────────────────────────────────────
  const objection = opp?.objection
    ? { line: opp.objection, response: opp.objectionResponse || "Lo entiendo — por eso propongo solo el diagnóstico: vemos si hay caso antes de hablar de nada." }
    : { line: "Ahora no es el momento / no tenemos presupuesto.", response: "Lo entiendo. La llamada de diagnóstico es justo para eso: ver si hay caso antes de hablar de inversión. Si no lo hay, te lo digo claro." };

  // ── Mini-dossier ───────────────────────────────────────────────────────────
  const dossier = [
    { k: "Empresa", v: [opp?.company, opp?.subsector || SECTOR_VOICE[opp?.sector], opp?.city].filter(Boolean).join(" · ") },
    moment ? { k: "Momento", v: moment } : { k: "Momento", v: "Por confirmar antes de llamar", weak: true },
    tensions.length ? { k: "Tensión", v: tensions.join(" · ") } : { k: "Tensión", v: "Por verificar in situ (web / reseñas)", weak: true },
    { k: "Encaje", v: (cls === "xn" ? "Transformación de fondo" : "Captación y ejecución ágil") + (top ? ` · ${top.name}` : "") },
    opp?.decisionMaker?.name
      ? { k: "Decisor", v: `${opp.decisionMaker.name}${opp.decisionMaker.role ? ` (${opp.decisionMaker.role})` : ""}` }
      : { k: "Decisor", v: "Por identificar", weak: true },
    { k: "Recorrido", v: `Índice de éxito ${s.successIndex ?? "—"} · confianza ${s.confidence ?? "—"}` },
  ];

  // ── Huecos a cerrar (honestidad: qué confirmar antes de afirmar nada) ──────
  const gaps = [];
  if (!moment) gaps.push("Confirmar el momento (apertura / ronda / expansión) con una fuente.");
  if (!tensions.length) gaps.push("Verificar la tensión real (web, reseñas) antes de afirmarla en la llamada.");
  if (!opp?.decisionMaker?.name) gaps.push("Identificar al decisor y su canal de contacto.");

  return { script: { opener, observation, offer, close }, objection, dossier, gaps };
}

/** Renderiza el guion como texto plano (para copiar/enviar). */
export function playbookToText(opp, pb) {
  const L = [];
  L.push(`GUION — ${opp?.company || ""}`.trim());
  L.push("");
  L.push("Apertura:");
  L.push(`  ${pb.script.opener}`);
  L.push("");
  L.push("Observación:");
  L.push(`  ${pb.script.observation}`);
  L.push("");
  L.push("Oferta:");
  L.push(`  ${pb.script.offer}`);
  L.push("");
  L.push("Cierre:");
  L.push(`  ${pb.script.close}`);
  L.push("");
  L.push(`Si objeta «${pb.objection.line}»:`);
  L.push(`  ${pb.objection.response}`);
  L.push("");
  L.push("DOSSIER:");
  for (const d of pb.dossier) L.push(`  · ${d.k}: ${d.v}${d.weak ? "  [por confirmar]" : ""}`);
  if (pb.gaps.length) {
    L.push("");
    L.push("Antes de llamar, confirmar:");
    for (const g of pb.gaps) L.push(`  · ${g}`);
  }
  return L.join("\n");
}
