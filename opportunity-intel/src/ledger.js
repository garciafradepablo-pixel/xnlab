// =============================================================================
// ledger.js — El activo principal de Connect: el registro append-only de
// ORDEN → OBEDIENCIA → RESULTADO. No es un informe ni un dashboard. Es la
// memoria inmutable de qué órdenes emitió el sistema, si el humano las obedeció,
// cuánto tardó y qué produjeron.
//
// El Ledger es un LOG DE EVENTOS, no una tabla mutable. Cada evento se añade y
// nunca se reescribe (doctrina: nunca sobrescribir el porqué de una decisión).
// La vista por orden (issued/obeyed/resolved) se DERIVA plegando los eventos.
//
// Puro y testeable — sin DOM, sin store, sin red. La persistencia (añadir
// eventos) vive en store.js; aquí solo se construyen y se pliegan.
// =============================================================================

// Tipos de evento del Ledger.
export const LEDGER_EVENTS = ["issued", "obeyed", "resolved", "regret"];

// Resultados rápidos que el humano marca al cerrar una orden, y su signo.
export const OUTCOMES = ["avance", "seguimiento", "propuesta", "perdido", "sin_respuesta"];
const POSITIVE = new Set(["avance", "propuesta"]); // la orden produjo avance real
const NEGATIVE = new Set(["perdido", "sin_respuesta"]); // la orden no avanzó

// Mapa resultado-rápido → status del tracking (para cerrar el lead por el camino
// normal del CRM; no toca scoring/decision/memory).
export const OUTCOME_STATUS = {
  avance: "interested",
  seguimiento: "follow_up",
  propuesta: "proposal_sent",
  perdido: "rejected",
  sin_respuesta: "no_answer",
};

const DUE_MS = 48 * 3600000; // una orden no obedecida en 48 h se considera ignorada

/** Id determinista de una orden: lead + instante de emisión. Une el Ledger con
 *  el `orderIssuedAt` del order loop sin tabla de correspondencia. */
export function orderIdFor(leadId, issuedAtISO) {
  const t = issuedAtISO ? new Date(issuedAtISO).getTime() : NaN;
  const stamp = Number.isNaN(t) ? "0" : t.toString(36);
  return `ord_${leadId}_${stamp}`;
}

/** Construye un evento del Ledger (inmutable). `at` en ms.
 *  El evento `issued` lleva la PREDICCIÓN (expected_outcome/value + confidence);
 *  el `resolved` lleva la REALIDAD (outcome + actual_value). Comparar ambos es
 *  lo que convierte el Ledger en evidencia (ver authority.js). */
export function makeEvent(type, orderId, {
  leadId = null, at = Date.now(), outcome = null, oci = null,
  expectedOutcome = null, expectedValue = null, confidence = null, actualValue = null,
} = {}) {
  if (!LEDGER_EVENTS.includes(type) || !orderId) return null;
  return {
    id: `lg_${at.toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    orderId,
    leadId,
    at: new Date(at).toISOString(),
    outcome: type === "resolved" ? outcome : null,
    oci: type === "issued" ? oci : null,
    // Predicción (issued): qué esperaba la orden y con cuánta confianza.
    expectedOutcome: type === "issued" ? expectedOutcome : null,
    expectedValue: type === "issued" ? expectedValue : null,
    confidence: type === "issued" ? confidence : null,
    // Realidad (resolved): el valor real producido (null hasta que se mida).
    actualValue: type === "resolved" ? actualValue : null,
  };
}

/**
 * Pliega el log de eventos en una vista por orden. Cada orden:
 *   { orderId, leadId, issuedAt, obeyedAt, resolvedAt, outcome,
 *     latencyMinutes, overrideRegret, oci, state }
 * state: "issued" | "obeyed" | "resolved".
 *
 * @param {Array} events  log append-only de eventos del Ledger.
 * @returns {Array} órdenes ordenadas por emisión (asc).
 */
export function foldOrders(events = []) {
  const byOrder = new Map();
  const get = (orderId) => {
    if (!byOrder.has(orderId)) {
      byOrder.set(orderId, {
        orderId, leadId: null, issuedAt: null, obeyedAt: null,
        resolvedAt: null, outcome: null, latencyMinutes: null,
        overrideRegret: false, oci: null, state: "issued",
        expectedOutcome: null, expectedValue: null, confidence: null,
        actualOutcome: null, actualValue: null,
      });
    }
    return byOrder.get(orderId);
  };

  // El primer evento de cada tipo gana (append-only: no se reescribe la historia).
  for (const e of events) {
    if (!e || !e.orderId) continue;
    const o = get(e.orderId);
    if (e.leadId && !o.leadId) o.leadId = e.leadId;
    if (e.type === "issued") {
      if (!o.issuedAt) {
        o.issuedAt = e.at; o.oci = e.oci;
        o.expectedOutcome = e.expectedOutcome; o.expectedValue = e.expectedValue;
        o.confidence = e.confidence;
      }
    } else if (e.type === "obeyed") {
      if (!o.obeyedAt) o.obeyedAt = e.at;
    } else if (e.type === "resolved") {
      if (!o.resolvedAt) {
        o.resolvedAt = e.at; o.outcome = e.outcome;
        o.actualOutcome = e.outcome; o.actualValue = e.actualValue;
      }
    } else if (e.type === "regret") {
      o.overrideRegret = true;
    }
  }

  const out = [];
  for (const o of byOrder.values()) {
    if (o.issuedAt && o.obeyedAt) {
      const lat = (new Date(o.obeyedAt).getTime() - new Date(o.issuedAt).getTime()) / 60000;
      o.latencyMinutes = Math.max(0, Math.round(lat));
    }
    o.state = o.resolvedAt ? "resolved" : o.obeyedAt ? "obeyed" : "issued";
    out.push(o);
  }
  out.sort((a, b) => String(a.issuedAt || "").localeCompare(String(b.issuedAt || "")));
  return out;
}

/**
 * Order Edge inicial: prueba de que obedecer produce avance. Simple a propósito
 * — empezamos a construir el activo, no a adornarlo.
 *
 * @param {Array}  orders  salida de foldOrders.
 * @param {number} [now]   epoch ms (para detectar órdenes ignoradas).
 * @returns {{obeyed, advanced, lost, ignored, resolvedObeyed, edgePct, line}}
 */
export function computeOrderEdge(orders = [], now = Date.now()) {
  let obeyed = 0, advanced = 0, lost = 0, ignored = 0, resolvedObeyed = 0;
  for (const o of orders) {
    if (o.obeyedAt) {
      obeyed++;
      if (o.resolvedAt) {
        resolvedObeyed++;
        if (POSITIVE.has(o.outcome)) advanced++;
        else if (NEGATIVE.has(o.outcome)) lost++;
      }
    } else if (o.issuedAt && now - new Date(o.issuedAt).getTime() > DUE_MS) {
      ignored++; // emitida, nunca obedecida, fuera de plazo
    }
  }

  const edgePct = resolvedObeyed > 0 ? Math.round((advanced / resolvedObeyed) * 100) : null;

  let line = null;
  if (edgePct != null) {
    line = `Las órdenes obedecidas avanzan el ${edgePct}% de las veces (${advanced}/${resolvedObeyed}).`;
  } else if (obeyed > 0) {
    const w = obeyed === 1 ? "orden obedecida" : "órdenes obedecidas";
    line = `${obeyed} ${w}, esperando resultado.`;
  }

  return { obeyed, advanced, lost, ignored, resolvedObeyed, edgePct, line };
}
