// =============================================================================
// nextaction.js — La próxima mejor acción de un lead (lógica pura).
//
// Una sola recomendación clara por lead, derivada de su estado en el CRM, su
// última llamada (resultado + objeción), sus seguimientos agendados, su historial
// y la recomendación del motor. No inventa: si no hay regla clara, dice "revisar
// manualmente". Determinista y testeable — la UI solo pinta lo que decide aquí.
// =============================================================================

import { latestCallContext } from "./calls.js";

// Acciones posibles (clave → etiqueta humana). Conjunto cerrado.
export const NEXT_ACTIONS = {
  call: "Llamar",
  proposal: "Enviar propuesta",
  follow_up: "Hacer seguimiento",
  wait: "Esperar",
  close_lost: "Cerrar como perdido",
  gather_info: "Pedir más información",
  review: "Revisar manualmente",
};

const ADVANCED = new Set(["interested", "meeting_booked", "proposal_sent", "won"]);

/**
 * @param {object} lead   oportunidad (usa .scores.recommendation)
 * @param {Array}  calls  llamadas de ESTE lead
 * @param {Array}  tasks  tareas de ESTE lead
 * @param {object} [ctx]  { status, today } — estado del CRM y "YYYY-MM-DD"
 * @returns {{action:string, label:string, why:string}}
 */
export function getNextBestAction(lead = {}, calls = [], tasks = [], ctx = {}) {
  const status = ctx.status || "not_called";
  const today = ctx.today || null;
  const a = (action, why) => ({ action, label: NEXT_ACTIONS[action], why });

  // 1) Resueltos: sin acción comercial (salvo reactivación futura).
  if (status === "won") return a("wait", "Cerrado ganado: en cliente, sin acción comercial pendiente.");
  if (status === "rejected" || status === "wrong_fit") return a("wait", "Cerrado/descartado: sin acción salvo reactivación futura.");

  // 2) Hay un seguimiento agendado que ya toca → hazlo.
  const dueTask = tasks.find((t) => t && t.type === "follow_up" && t.status !== "done" && t.dueDate && (!today || t.dueDate <= today));
  if (dueTask) return a("follow_up", `Seguimiento agendado (${dueTask.dueDate}): ${dueTask.note || "retoma el hilo"}.`);

  // 3) Propuesta enviada → perseguir el cierre.
  if (status === "proposal_sent") return a("follow_up", "Propuesta enviada: haz seguimiento para cerrar.");

  // 4) Interés / reunión.
  if (status === "interested") return a("proposal", "Mostró interés: prepara y envía la propuesta sin enfriarlo.");
  if (status === "meeting_booked") return a("wait", "Reunión agendada: prepárala; la próxima acción es la reunión.");

  const last = latestCallContext(calls);

  // 5) Muchos toques sin avance → valorar cerrarlo y liberar foco.
  if (calls.length >= 3 && !ADVANCED.has(status)) {
    return a("close_lost", `${calls.length} toques sin avance: valora cerrarlo como perdido y liberar foco.`);
  }

  // 6) Hilos abiertos según el último estado.
  if (status === "follow_up") return a("follow_up", "Hilo abierto: retoma con un ángulo nuevo.");
  if (status === "no_answer") return a("call", "No contestó: reintenta en otra franja u otro canal.");
  if (status === "called") {
    if (last?.objection && /info|consult|pensar|mandame|m[aá]ndame/i.test(last.objection)) {
      return a("gather_info", `Quedó la objeción "${last.objection}": envía la info concreta y fija fecha.`);
    }
    return a("follow_up", "Ya llamaste: agenda el siguiente toque para no perder el hilo.");
  }

  // 7) Sin contactar: el motor marca si hay que enriquecer antes.
  if (status === "not_called") {
    if (lead?.scores?.recommendation === "enrich") return a("gather_info", "Faltan señales: enriquece (web/decisor) antes de llamar.");
    return a("call", "Sin contactar: es el momento de la primera llamada.");
  }

  return a("review", "Sin regla clara: revísalo manualmente.");
}
