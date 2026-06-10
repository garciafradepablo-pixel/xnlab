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

// =============================================================================
// resolveNextActionIntent — traduce una acción recomendada en una INTENCIÓN
// operativa que la UI ejecuta. Pura: no toca DOM, store ni confirm; solo decide
// QUÉ debería pasar. La UI mapea cada `kind` a su gesto (abrir, mover, crear…).
//
// kinds: open_lead | move_status | create_task | open_task |
//        confirm_status_change | noop | manual_review
//
// Regla de seguridad: una acción que mueve estado NUNCA propone un retroceso
// (no-degradar). Si el lead ya está igual o más avanzado, devuelve noop con motivo.
// =============================================================================

// Progresión del embudo para detectar retrocesos. rejected/wrong_fit quedan
// fuera (terminales negativos); won es el techo.
const PROGRESSION = ["not_called", "called", "no_answer", "follow_up", "interested", "meeting_booked", "proposal_sent", "won"];
const rankOf = (status) => {
  const i = PROGRESSION.indexOf(status);
  return i === -1 ? 0 : i;
};

/**
 * @param {string} action  clave de NEXT_ACTIONS (de getNextBestAction)
 * @param {object} lead    oportunidad (.id, .company, .scores)
 * @param {Array}  calls   llamadas de ESTE lead
 * @param {Array}  tasks   tareas de ESTE lead
 * @param {object} [ctx]   { status, today, by, assignee }
 * @returns {{kind:string,label:string,reason:string,statusTarget?:string,taskDraft?:object,existingTaskId?:string,requiresConfirm?:boolean}}
 */
export function resolveNextActionIntent(action, lead = {}, calls = [], tasks = [], ctx = {}) {
  const status = ctx.status || "not_called";
  const label = NEXT_ACTIONS[action] || "Revisar";
  const out = (kind, reason, extra = {}) => ({ kind, label, reason, ...extra });

  switch (action) {
    case "call":
      // No hay modal de llamada propio: abrir el lead da el contexto (guion,
      // señales, decisor). TODO: si algún día hay modal de llamada, abrirlo aquí.
      return out("open_lead", "Abre el lead para llamar con el contexto delante.");

    case "proposal": {
      // Mover a "Propuesta enviada", pero solo hacia adelante (no-degradar).
      if (rankOf(status) >= rankOf("proposal_sent")) {
        return out("noop", "El lead ya está en propuesta o más avanzado: no se retrocede.");
      }
      return out("confirm_status_change", "¿Marcar la propuesta como enviada?", {
        statusTarget: "proposal_sent", requiresConfirm: true,
      });
    }

    case "follow_up": {
      // Si ya hay un seguimiento pendiente, abrir ese (no duplicar).
      const existing = tasks.find((t) => t && t.type === "follow_up" && t.status !== "done" && t.leadId === lead.id);
      if (existing) {
        return out("open_task", "Ya hay un seguimiento pendiente: ábrelo.", { existingTaskId: existing.id });
      }
      // Si no, un borrador de tarea con id determinista (evita duplicar al repetir).
      const last = latestCallContext(calls);
      return out("create_task", "Crea un seguimiento para no perder el hilo.", {
        taskDraft: {
          id: `fu_manual_${lead.id}`,
          type: "follow_up",
          leadId: lead.id,
          callId: null,
          dueDate: ctx.today || null,
          title: `Seguimiento · ${lead.company || "lead"}`,
          note: (last && last.nextStep) || "Seguimiento manual.",
          priority: "media",
          status: "todo",
          assignee: ctx.assignee || ctx.by || null,
          by: ctx.by || null,
        },
      });
    }

    case "wait":
      // Sin movimiento automático: solo el motivo. (La UI puede ofrecer recordar.)
      return out("noop", "Nada que mover ahora: espera al momento adecuado.");

    case "close_lost": {
      if (status === "won") return out("noop", "El lead está ganado: no se cierra como perdido.");
      return out("confirm_status_change", "¿Cerrar este lead como perdido (Rechazado)?", {
        statusTarget: "rejected", requiresConfirm: true,
      });
    }

    case "gather_info":
      // Abrir el lead para añadir/ pedir la información que falta.
      return out("open_lead", "Abre el lead para reunir o pedir la información que falta.");

    case "review":
    default:
      return out("manual_review", "Revísalo a mano: última llamada, objeción, score y tareas.");
  }
}
