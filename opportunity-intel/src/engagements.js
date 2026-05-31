// =============================================================================
// engagements.js — La fase "Entregar". Connect no termina al firmar un lead:
// un trato ganado (o un proyecto interno de la propia empresa — el software que
// construimos nosotros) se convierte en un Engagement con tareas y bitácora.
//
// Una sola entidad cubre las tres cosas que necesitamos seguir:
//   - kind:"client"   → trabajo para un cliente, nace de un lead firmado.
//   - kind:"internal" → software/desarrollo propio (el mismo Connect, el site…).
//   - tasks[]         → gestión de tareas (estado, responsable).
//   - log[]           → bitácora: sesiones de trabajo, decisiones, notas.
//
// Lógica PURA y sin framework: ninguna función toca el store ni la red. Reciben
// un engagement y devuelven uno nuevo (o un valor), de modo que el store hace
// upsert y el sync compartido (export/importState) lo replica entre Pablo y Javi
// sin código extra. Testeable directamente bajo Node.
// =============================================================================

import { TASK_STATES, ENGAGEMENT_STATUSES } from "./models.js";

let _seq = 0;
function uid(prefix) {
  _seq = (_seq + 1) % 1e6;
  const rnd = (typeof Math !== "undefined" ? Math.random() : 0).toString(36).slice(2, 7);
  return `${prefix}_${Date.now().toString(36)}${_seq.toString(36)}${rnd}`;
}

const now = () => new Date().toISOString();

/** Marca de tiempo de modificación — el sync usa lo más reciente por entidad. */
function touch(eng) {
  return { ...eng, updatedAt: now() };
}

/**
 * Crea un engagement. Por defecto es interno (software propio); pásale
 * `kind:"client"` + `leadId` para atarlo a un lead firmado.
 */
export function createEngagement({ title, kind = "internal", leadId = null, sector = null, by = "", tasks = [] } = {}) {
  const t = now();
  return {
    id: uid("eng"),
    title: String(title || "").trim() || "Proyecto sin título",
    kind: kind === "client" ? "client" : "internal",
    leadId: leadId || null,
    sector: sector || null,
    status: "active",
    tasks: (tasks || []).map((x) => makeTask(typeof x === "string" ? { title: x } : x)),
    log: [],
    createdAt: t,
    updatedAt: t,
    createdBy: by || "",
  };
}

/**
 * Convierte un lead FIRMADO en un engagement de cliente. El título toma el
 * nombre de la empresa y, si se pasa, la etiqueta del servicio contratado.
 * Siembra una única tarea honesta de arranque (kickoff/discovery), el resto lo
 * añade el equipo a medida que se define el alcance — no inventamos un plan.
 */
export function engagementFromLead(lead, { by = "", serviceLabel = "" } = {}) {
  if (!lead || !lead.id) throw new Error("engagementFromLead: lead inválido");
  const suffix = serviceLabel ? ` — ${serviceLabel}` : "";
  return createEngagement({
    title: `${lead.company}${suffix}`,
    kind: "client",
    leadId: lead.id,
    sector: lead.sector || null,
    by,
    tasks: ["Kickoff y discovery"],
  });
}

function makeTask({ title, assignee = "", state = "todo" } = {}) {
  return {
    id: uid("task"),
    title: String(title || "").trim() || "Tarea",
    state: TASK_STATES.includes(state) ? state : "todo",
    assignee: assignee || "",
    createdAt: now(),
    doneAt: state === "done" ? now() : null,
  };
}

/** Añade una tarea. Devuelve un engagement nuevo. */
export function addTask(eng, title, assignee = "") {
  const task = makeTask({ title, assignee });
  return touch({ ...eng, tasks: [...eng.tasks, task] });
}

/** Cambia el estado de una tarea. `done` sella `doneAt`; salir de `done` lo limpia. */
export function setTaskState(eng, taskId, nextState) {
  if (!TASK_STATES.includes(nextState)) return eng;
  const tasks = eng.tasks.map((t) =>
    t.id === taskId
      ? { ...t, state: nextState, doneAt: nextState === "done" ? (t.doneAt || now()) : null }
      : t
  );
  return touch({ ...eng, tasks });
}

/** Elimina una tarea. */
export function removeTask(eng, taskId) {
  return touch({ ...eng, tasks: eng.tasks.filter((t) => t.id !== taskId) });
}

/** Añade una entrada a la bitácora (sesión de trabajo / decisión / nota). */
export function addLog(eng, note, by = "") {
  const text = String(note || "").trim();
  if (!text) return eng;
  const entry = { id: uid("log"), at: now(), by: by || "", note: text };
  // Más reciente primero: la bitácora se lee de arriba abajo.
  return touch({ ...eng, log: [entry, ...eng.log] });
}

/** Cambia el estado del engagement (active | paused | done). */
export function setStatus(eng, status) {
  if (!ENGAGEMENT_STATUSES.includes(status)) return eng;
  return touch({ ...eng, status });
}

/** Avance por tareas: {done, total, pct}. Sin tareas → 0%. */
export function progress(eng) {
  const total = eng.tasks.length;
  const done = eng.tasks.filter((t) => t.state === "done").length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** Tareas abiertas (todo/doing/blocked). Útil para los KPIs del Estudio. */
export function openTasks(eng) {
  return eng.tasks.filter((t) => t.state !== "done");
}

/** ¿Todo entregable cerrado? (todas las tareas hechas y hay al menos una). */
export function isComplete(eng) {
  return eng.tasks.length > 0 && eng.tasks.every((t) => t.state === "done");
}
