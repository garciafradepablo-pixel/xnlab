// =============================================================================
// tasks.js — Tareas del equipo: quién hace qué (lógica pura).
//
// No es un gestor de proyectos. Es lo mínimo para que cada vendedor sepa qué le
// toca y el equipo vea, de un vistazo honesto, en qué anda cada uno. Una tarea
// lleva siempre autor (`by`) y responsable (`assignee`): así la mesa refleja el
// reparto real, no una lista anónima.
//
// Tres estados, sin ceremonia: por hacer → haciendo → hecho. Cada uno embiste
// lo suyo y lo marca; el marcador de productividad ya premia el resultado.
//
// Las tareas viajan en el documento compartido (store) como una colección más:
// se fusionan por id, gana el `updatedAt` más reciente. Sin tabla nueva.
// =============================================================================

export const STATUSES = ["todo", "doing", "done"];

export const STATUS_LABELS = {
  todo: "Por hacer",
  doing: "Haciendo",
  done: "Hecho",
};

const norm = (s) => String(s || "").trim().toLowerCase();

/** Estado siguiente en el ciclo (done vuelve a todo: un clic recorre todo). */
export function nextStatus(status) {
  const i = STATUSES.indexOf(status);
  return STATUSES[(i + 1) % STATUSES.length] || "todo";
}

/** ¿La tarea sigue abierta (cuenta como carga viva)? */
export function isOpen(task) {
  return !!task && task.status !== "done";
}

/**
 * Crea una tarea nueva, normalizada. Devuelve null si no hay título.
 * @param {{title:string, assignee?:string, by?:string}} input
 */
export function makeTask({ title, assignee, by } = {}) {
  const t = String(title || "").trim().slice(0, 280);
  if (!t) return null;
  const now = new Date().toISOString();
  return {
    id: `t_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: t,
    assignee: String(assignee || "").trim() || null,
    status: "todo",
    by: by || null,
    createdAt: now,
    updatedAt: now,
  };
}

/** Orden estable: abiertas primero, luego por fecha de actualización (recientes arriba). */
export function sortTasks(tasks = []) {
  return [...tasks].sort((a, b) => {
    const ao = isOpen(a) ? 0 : 1;
    const bo = isOpen(b) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  });
}

/** Cuenta por estado: { todo, doing, done, open, total }. */
export function countByStatus(tasks = []) {
  const c = { todo: 0, doing: 0, done: 0 };
  for (const t of tasks) if (t && c[t.status] != null) c[t.status]++;
  const open = c.todo + c.doing;
  return { ...c, open, total: tasks.length };
}

/**
 * Agrupa por responsable, en el orden de `users` (organigrama). Las tareas sin
 * responsable caen en un grupo "Sin asignar" al final. Cada grupo trae su conteo.
 * @param {Array} tasks
 * @param {Array<{name:string}>} users  equipo en el orden deseado
 * @returns {Array<{name:string|null, tasks:Array, counts:Object}>}
 */
export function groupByAssignee(tasks = [], users = []) {
  const groups = new Map(); // key (name_lower|"") -> { name, tasks }
  const keyOf = (name) => norm(name);

  // Sembramos cada miembro del equipo aunque no tenga tareas (la mesa los incluye).
  for (const u of users) {
    const k = keyOf(u && u.name);
    if (!k) continue;
    if (!groups.has(k)) groups.set(k, { name: u.name, tasks: [] });
  }

  for (const t of tasks) {
    const k = keyOf(t && t.assignee);
    if (!groups.has(k)) groups.set(k, { name: t && t.assignee ? t.assignee : null, tasks: [] });
    groups.get(k).tasks.push(t);
  }

  const out = [];
  for (const g of groups.values()) {
    if (g.name === null && !g.tasks.length) continue; // grupo fantasma vacío
    out.push({ name: g.name, tasks: sortTasks(g.tasks), counts: countByStatus(g.tasks) });
  }
  // "Sin asignar" siempre al final; el resto conserva el orden de `users`.
  return out.sort((a, b) => (a.name === null ? 1 : 0) - (b.name === null ? 1 : 0));
}

/** Tareas abiertas de una persona (para su briefing). */
export function openFor(tasks = [], name) {
  const k = norm(name);
  return sortTasks(tasks.filter((t) => t && isOpen(t) && norm(t.assignee) === k));
}
