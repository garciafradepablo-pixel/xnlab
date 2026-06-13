// =============================================================================
// verdict.js — El Veredicto del Reactor: una decisión en lenguaje, no un informe.
//
// NO es un motor nuevo. No puntúa, no decide, no inventa. RECOMPONE lo que ya
// produjeron el decision engine, la memoria comercial, los seguimientos y la
// próxima-mejor-acción en una sola dirección dirigida al fundador:
//
//   qué hacer · con quién · por qué · qué pasa si no lo hace.
//
// Cada frase nace de un dato real. Si el dato no existe, la frase no se dice
// (honestidad: nunca rellena con texto fijo). Puro y testeable — sin DOM, sin
// store, sin red.
// =============================================================================

import { getNextBestAction } from "./nextaction.js";
import { nextFollowup, dueLabel } from "./followups.js";
import { buildMemory } from "./commercialmemory.js";
import { deriveOrderStatus } from "./orders.js";

// Máximo 1 línea: la dimensión más fuerte convertida en señal legible.
function topDimensionLine(dims) {
  const { fit = 0, pain = 0, timing = 0, access = 0 } = dims;
  const max = Math.max(fit, pain, timing, access);
  if (max < 50) return null;
  if (access === max) return "Contacto directo identificado";
  if (timing === max) return "Ventana de compra activa";
  if (pain === max) return "Dolor activo sin resolver";
  return "Perfil de cliente ideal";
}

// Máximo 1 línea: el riesgo más urgente o null si todo limpio.
function compactRisk(fu, since, now, decision) {
  if (fu && fu.isDue) return `Seguimiento vencido ${dueLabel(fu.dueAt, now)}`;
  if (since != null && since >= 14) return `${since}d sin contacto`;
  if (since != null && since >= 7) return `${since}d sin movimiento`;
  const timing = decision.dimensions?.timing;
  if (timing != null && timing < 30) return "Ventana cerrándose";
  return null;
}

const DAY = 86400000;

function daysSince(iso, now) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((now - t) / DAY);
}

// Confianza legible derivada del OCI del motor (no se inventa: es su índice).
function confidenceWord(oci) {
  if (oci >= 70) return "alta";
  if (oci >= 50) return "razonable";
  return "todavía frágil";
}

/**
 * Compone el veredicto sobre la mejor oportunidad accionable.
 *
 * @param {object}  args
 * @param {Array}   args.actNow    [{opp, decision}] ya ordenadas por OCI (desc).
 * @param {object}  args.tracking  mapa id → { status, updatedAt }.
 * @param {Array}   args.calls     TODAS las llamadas (con .leadId, .leadSector, .analysis).
 * @param {Array}   args.tasks     TODAS las tareas (con .leadId, .type, .status).
 * @param {number}  [args.now]     epoch ms (inyectable para test).
 * @param {string}  [args.today]   "YYYY-MM-DD" (para getNextBestAction).
 * @returns {{has:boolean, company?, city?, leadId?, oci?, sector?,
 *   lastContact?, objection?, windowOpen?, nextAction?, risk?, confidence?, lines?}}
 */
export function buildVerdict({ actNow = [], tracking = {}, calls = [], tasks = [], now = Date.now(), today = null } = {}) {
  const top = actNow[0];
  if (!top || !top.opp) return { has: false };

  const opp = top.opp;
  const decision = top.decision || {};
  const tr = tracking[opp.id] || {};
  const status = tr.status || "not_called";

  // Contexto de ESTE lead (no del agregado).
  const leadCalls = calls.filter((c) => c && c.leadId === opp.id);
  const leadTasks = tasks.filter((t) => t && t.leadId === opp.id);

  // — Último contacto: hecho del CRM, no estimación.
  const since = daysSince(tr.updatedAt, now);
  let lastContact;
  if (status === "not_called" || since == null) {
    lastContact = "Aún no la has llamado: sería el primer contacto.";
  } else if (since === 0) {
    lastContact = "El último contacto fue hoy.";
  } else {
    lastContact = `Han pasado ${since} día${since === 1 ? "" : "s"} desde el último contacto.`;
  }

  // — Objeción dominante del PERFIL (mismo sector). Solo si hay llamadas que la
  //   respalden; si no, la frase no se dice.
  const sectorCalls = calls.filter((c) => c && (c.leadSector || "") === (opp.sector || ""));
  const sectorMem = buildMemory(sectorCalls);
  const objection = (sectorMem.objections[0] && sectorMem.objections[0].label) || null;

  // — Ventana: la dimensión de timing del propio motor.
  const timing = decision.dimensions ? decision.dimensions.timing : null;
  const windowOpen = timing == null || timing >= 30;

  // — Siguiente acción: la próxima-mejor-acción del lead (lógica existente).
  const next = getNextBestAction(opp, leadCalls, leadTasks, { status, today });

  // — Riesgo de NO actuar: derivado del estado real (seguimiento vencido >
  //   enfriamiento > timing > urgencia de act_now). Una consecuencia, no un KPI.
  const fu = nextFollowup(tr, now);
  let risk;
  if (fu && fu.isDue) {
    risk = `El siguiente toque venció ${dueLabel(fu.dueAt, now)}: si no lo das hoy, el hilo se enfría.`;
  } else if (since != null && since >= 7) {
    risk = `Lleva ${since} días sin movimiento: cada día que pasa pierde temperatura.`;
  } else if (!windowOpen) {
    risk = "El momento que la hace urgente no durará: si esperas, dejará de ser oportuna.";
  } else {
    risk = "Es el mejor momento para entrar. Mañana puede haberlo hecho otro.";
  }

  const oci = decision.oci || 0;
  const confidence = confidenceWord(oci);

  // El veredicto, frase a frase. Cada línea es un dato real convertido en orden.
  const lines = [
    `Tu mejor oportunidad es ${opp.company}.`,
    lastContact,
    objection ? `La objeción que más frena en este perfil es «${objection}».` : null,
    windowOpen ? "La ventana sigue abierta." : "La ventana se está cerrando.",
    `${next.why} La probabilidad de avance es ${confidence}.`,
    "Empieza por aquí.",
  ].filter(Boolean);

  return {
    has: true,
    company: opp.company,
    city: opp.city || "",
    leadId: opp.id,
    sector: opp.sector || "",
    oci,
    lastContact,
    objection,
    windowOpen,
    nextAction: { label: next.label, why: next.why },
    risk,
    confidence,
    lines,
  };
}

/**
 * Lista de hasta 3 prioridades compactas para el Reactor V3 (Mission Control).
 * Cada entrada: rank, company, OCI, motive (1 línea), riskLine (1 línea), ctaType.
 * Nunca inventa: si no hay dimensión fuerte, motive === null; si no hay riesgo, riskLine === null.
 *
 * @param {object} args
 * @param {Array}  args.actNow    [{opp, decision}] ya ordenadas por OCI (desc).
 * @param {object} args.tracking  mapa id → { status, updatedAt }.
 * @param {number} [args.now]     epoch ms (inyectable para test).
 * @returns {Array<{rank, leadId, company, city, sector, oci, motive, riskLine, ctaType, status}>}
 */
export function buildPriorityList({ actNow = [], tracking = {}, now = Date.now() } = {}) {
  return actNow.slice(0, 3).map((item, i) => {
    const opp = item.opp;
    const decision = item.decision || {};
    const tr = tracking[opp.id] || {};
    const since = daysSince(tr.updatedAt, now);
    const oci = decision.oci || 0;
    const status = tr.status || "not_called";
    const fu = nextFollowup(tr, now);
    const motive = topDimensionLine(decision.dimensions || {});
    const riskLine = compactRisk(fu, since, now, decision);
    const ctaType = (status === "not_called" || (fu && fu.isDue)) ? "call" : "case";
    // Estado vivo de la orden, derivado del ancla `orderIssuedAt` del tracking.
    // Lectura pura: la EMISIÓN (escribir el ancla) la hace reactorView, no aquí.
    const orderStatus = deriveOrderStatus(tr, now).status;

    return {
      rank: i + 1,
      leadId: opp.id,
      company: opp.company,
      city: opp.city || "",
      sector: opp.sector || "",
      oci,
      motive,
      riskLine,
      ctaType,
      status,
      orderStatus,
    };
  });
}
