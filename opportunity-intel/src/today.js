// =============================================================================
// today.js — Vista "Hoy": claridad ejecutiva (Fase 5).
//
// Lógica PURA y testeable (sin DOM): elige las mejores llamadas del día, el
// siguiente paso concreto de cada una y el pulso del pipeline. La UI solo
// pinta lo que estas funciones deciden. Así el "abrir y saber a quién llamar"
// queda blindado por tests, no por inspección visual.
// =============================================================================

import { OFFER_LADDER } from "./models.js";

const ticketOf = (o) => OFFER_LADDER[o?.suggestedOfferKey]?.price || 0;
const statusOf = (o, tracking) => tracking[o?.id]?.status || "not_called";

// Estados que ya están "resueltos" y salen del foco de hoy.
const SETTLED = new Set(["rejected", "wrong_fit", "meeting_booked", "won"]);

/**
 * Las mejores llamadas del día: oportunidades reales (01/XN) que aún piden
 * acción. Ordena por Índice de Éxito (lo que de verdad cierra) y, a igualdad,
 * por confianza; un hilo abierto (interesado / seguimiento / no contesta) sube
 * porque hay algo concreto que rematar hoy. Las agendadas/descartadas salen.
 *
 * Opcional, para el reparto por persona (agenda de Dani):
 *   - owner: si se pasa, solo cuenta las llamadas asignadas a esa persona.
 *   - today: "YYYY-MM-DD"; las agendadas para MÁS ADELANTE salen del foco de hoy
 *     y las que tocan hoy/vencidas suben. Sin owner/today, comportamiento idéntico.
 *
 * @returns {Array} hasta `limit` oportunidades, lo más cerrable primero.
 */
export function pickTodayCalls(opps = [], tracking = {}, { limit = 3, owner = null, today = null } = {}) {
  const live = opps.filter((o) => {
    const c = o?.scores?.classification;
    if (c !== "01" && c !== "xn") return false;
    if (SETTLED.has(statusOf(o, tracking))) return false;
    if (owner && (tracking[o?.id]?.assignedTo || null) !== owner) return false;
    // Agendada para el futuro: aún no toca, se reserva para su día.
    if (today) {
      const due = tracking[o?.id]?.scheduledFor || null;
      if (due && due > today) return false;
    }
    return true;
  });
  const weight = (o) => {
    const st = statusOf(o, tracking);
    // Regla de venta: una conversación viva se cierra ANTES que una llamada
    // fría. Por eso un hilo abierto va por tramos por encima de lo no llamado;
    // dentro de cada tramo desempata el Índice de Éxito (lo que de verdad
    // cierra) y la confianza.
    const tier = st === "proposal_sent" ? 1200 // propuesta enviada: a un paso de firmar
      : st === "interested" || st === "follow_up" ? 1000
      : st === "no_answer" ? 500
      : st === "called" ? 200 : 0;
    // Una llamada agendada para hoy (o vencida) pide cerrarse ya: pequeño empujón
    // para que lidere su jornada por encima de las no agendadas de igual tramo.
    const due = tracking[o?.id]?.scheduledFor || null;
    const dueBoost = today && due && due <= today ? 300 : 0;
    const s = o.scores || {};
    return tier + dueBoost + (s.successIndex || 0) + (s.confidence || 0) / 100;
  };
  return [...live].sort((a, b) => weight(b) - weight(a)).slice(0, limit);
}

/**
 * El siguiente paso concreto de una oportunidad, según su estado y la
 * recomendación del motor. Devuelve {action, why} — qué hacer y por qué.
 */
export function nextStep(opp, track = {}) {
  const st = track.status || "not_called";
  if (st === "interested") return { action: "Cerrar reunión", why: "Mostró interés: propón día y hora ya, no lo enfríes." };
  if (st === "follow_up") return { action: "Segundo toque", why: "Quedó un hilo abierto: retoma con un ángulo nuevo." };
  if (st === "no_answer") return { action: "Reintentar en otra franja", why: "No contestó: prueba a otra hora o por otro canal." };
  if (st === "called") return { action: "Registrar el resultado", why: "Ya llamaste: anota cómo fue para fijar el siguiente paso." };
  // Sin llamar: el siguiente paso lo marca la recomendación del motor.
  const rec = opp?.scores?.recommendation;
  if (rec === "call_immediately") return { action: "Llamar de inmediato", why: "Momento y encaje altos: la primera de la lista." };
  if (rec === "prepare_audit") return { action: "Mini-auditoría y llamar", why: "Llega con una observación concreta sobre su web o marca." };
  if (rec === "enrich") return { action: "Enriquecer antes de llamar", why: "Faltan señales: confirma momento y decisor primero." };
  return { action: "Mantener como secundaria", why: "Por detrás de las calientes; revísala si abren hueco." };
}

/**
 * El pulso del pipeline: oportunidades reales, reparto 01/XN, llamadas hechas
 * vs pendientes, reuniones, y valor potencial de cada cartera.
 */
export function pipelinePulse(opps = [], tracking = {}) {
  const real = opps.filter((o) => ["01", "xn"].includes(o?.scores?.classification));
  const o1 = real.filter((o) => o.scores.classification === "01");
  const xn = real.filter((o) => o.scores.classification === "xn");
  const called = real.filter((o) => statusOf(o, tracking) !== "not_called").length;
  const meetings = real.filter((o) => statusOf(o, tracking) === "meeting_booked").length;
  const proposals = real.filter((o) => statusOf(o, tracking) === "proposal_sent");
  const wonLeads = real.filter((o) => statusOf(o, tracking) === "won");
  const sum = (arr) => arr.reduce((s, o) => s + ticketOf(o), 0);
  return {
    total: real.length,
    o1: o1.length, xn: xn.length,
    called, pending: real.length - called, meetings,
    proposals: proposals.length, proposalValue: sum(proposals),
    won: wonLeads.length, wonValue: sum(wonLeads), // € atribuible a Connect
    value01: sum(o1), valueXn: sum(xn), valueTotal: sum(real),
  };
}
