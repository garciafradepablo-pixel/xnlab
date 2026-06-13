// =============================================================================
// orders.js — El estado vivo de una orden. Connect deja de ser recomendador y
// empieza a ser motor de órdenes: cuando Reactor emite la prioridad #1, el
// sistema recuerda "yo emití esta orden y todavía no se ha ejecutado".
//
// Una orden no es una entidad persistida nueva. Es un estado DERIVADO de un
// único ancla temporal — `orderIssuedAt` en el tracking del lead — comparada
// contra `updatedAt` (¿se tocó después?), el reloj (¿venció el plazo?) y el
// seguimiento del lead (¿está el toque vencido?).
//
// Puro y testeable — sin DOM, sin store, sin red. La emisión (escribir el
// ancla) vive en store.js; aquí solo se LEE y se interpreta.
// =============================================================================

import { nextFollowup } from "./followups.js";

const H = 3600000;
const DUE_MS = 48 * H; // una orden vive 48 h antes de considerarse ignorada

/**
 * Estado vivo de la orden emitida sobre un lead, derivado de su tracking.
 *
 * Estados:
 *   none       — no hay orden emitida (sin `orderIssuedAt`).
 *   pending    — emitida, dentro del plazo, sin ejecución registrada.
 *   executed   — el tracking cambió DESPUÉS de emitir (el fundador actuó).
 *   ignored    — venció el plazo (48 h) sin ejecución.
 *   escalated  — ignored y además el seguimiento del lead ya venció (doble
 *                señal de urgencia). Si el estado del lead no tiene cadencia de
 *                seguimiento (p. ej. `not_called`), nextFollowup devuelve null y
 *                la orden se queda en `ignored` — nunca se inventa una escalada.
 *
 * @param {object} record  TrackingRecord del lead { status, updatedAt, orderIssuedAt }.
 * @param {number} [now]   epoch ms (inyectable para test).
 * @returns {{ status: string, issuedAt: string|null, dueAt: string|null }}
 */
export function deriveOrderStatus(record = {}, now = Date.now()) {
  const issued = record && record.orderIssuedAt ? new Date(record.orderIssuedAt).getTime() : NaN;
  if (Number.isNaN(issued)) {
    return { status: "none", issuedAt: null, dueAt: null };
  }

  const dueAt = issued + DUE_MS;
  const out = { issuedAt: new Date(issued).toISOString(), dueAt: new Date(dueAt).toISOString() };

  // Ejecutada: el tracking se tocó después de emitir la orden (cambio de status).
  const updated = record.updatedAt ? new Date(record.updatedAt).getTime() : NaN;
  if (!Number.isNaN(updated) && updated > issued) {
    return { status: "executed", ...out };
  }

  // Aún en plazo y sin ejecutar → la orden sigue viva.
  if (now <= dueAt) {
    return { status: "pending", ...out };
  }

  // Fuera de plazo sin ejecutar → ignorada, o escalada si el seguimiento del
  // lead también venció (doble señal). Sin cadencia → se queda en ignored.
  const fu = nextFollowup(record, now);
  if (fu && fu.isDue) {
    return { status: "escalated", ...out };
  }
  return { status: "ignored", ...out };
}
