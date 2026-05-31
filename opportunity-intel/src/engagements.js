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
    milestones: [],
    attachments: [],
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

function makeTask({ title, assignee = "", state = "todo", due = null, deps = [] } = {}) {
  return {
    id: uid("task"),
    title: String(title || "").trim() || "Tarea",
    state: TASK_STATES.includes(state) ? state : "todo",
    assignee: assignee || "",
    due: normDate(due),
    deps: Array.isArray(deps) ? deps.filter(Boolean) : [],
    createdAt: now(),
    doneAt: state === "done" ? now() : null,
  };
}

// Normaliza una fecha a YYYY-MM-DD (o null). Acepta string o Date.
function normDate(d) {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d) ? null : d.toISOString().slice(0, 10);
  const s = String(d).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

const taskById = (eng, id) => eng.tasks.find((t) => t.id === id) || null;

/** Añade una tarea. Devuelve un engagement nuevo. */
export function addTask(eng, title, assignee = "") {
  const task = makeTask({ title, assignee });
  return touch({ ...eng, tasks: [...eng.tasks, task] });
}

/**
 * Cambia el estado de una tarea. `done` sella `doneAt`; salir de `done` lo
 * limpia. No deja avanzar a `doing`/`done` mientras tenga dependencias sin
 * cerrar (las dependencias mandan): en ese caso es un no-op.
 */
export function setTaskState(eng, taskId, nextState) {
  if (!TASK_STATES.includes(nextState)) return eng;
  const t = taskById(eng, taskId);
  if (!t) return eng;
  if ((nextState === "doing" || nextState === "done") && isBlockedByDeps(eng, t)) return eng;
  const tasks = eng.tasks.map((x) =>
    x.id === taskId
      ? { ...x, state: nextState, doneAt: nextState === "done" ? (x.doneAt || now()) : null }
      : x
  );
  return touch({ ...eng, tasks });
}

/** Fija (o limpia con null) la fecha límite de una tarea. */
export function setTaskDue(eng, taskId, due) {
  const tasks = eng.tasks.map((t) => (t.id === taskId ? { ...t, due: normDate(due) } : t));
  return touch({ ...eng, tasks });
}

/** Elimina una tarea y la quita de las dependencias de las demás. */
export function removeTask(eng, taskId) {
  const tasks = eng.tasks
    .filter((t) => t.id !== taskId)
    .map((t) => (t.deps.includes(taskId) ? { ...t, deps: t.deps.filter((d) => d !== taskId) } : t));
  return touch({ ...eng, tasks });
}

// ---- Dependencias entre tareas ---------------------------------------------

/** ¿Crearía un ciclo añadir `dep` como dependencia de `taskId`? (DFS sobre deps). */
function wouldCycle(eng, taskId, dep) {
  if (dep === taskId) return true;
  const seen = new Set();
  const stack = [dep];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === taskId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    const t = taskById(eng, cur);
    if (t) stack.push(...t.deps);
  }
  return false;
}

/** Añade una dependencia (taskId depende de dependsOnId). Evita auto-deps y ciclos. */
export function addDependency(eng, taskId, dependsOnId) {
  const t = taskById(eng, taskId);
  if (!t || !taskById(eng, dependsOnId)) return eng;
  if (t.deps.includes(dependsOnId)) return eng;
  if (wouldCycle(eng, taskId, dependsOnId)) return eng;
  const tasks = eng.tasks.map((x) => (x.id === taskId ? { ...x, deps: [...x.deps, dependsOnId] } : x));
  return touch({ ...eng, tasks });
}

/** Quita una dependencia. */
export function removeDependency(eng, taskId, dependsOnId) {
  const tasks = eng.tasks.map((x) => (x.id === taskId ? { ...x, deps: x.deps.filter((d) => d !== dependsOnId) } : x));
  return touch({ ...eng, tasks });
}

/** Dependencias aún sin cerrar (las que bloquean el avance). */
export function blockingDeps(eng, task) {
  return (task.deps || [])
    .map((id) => taskById(eng, id))
    .filter((d) => d && d.state !== "done");
}

/** ¿La tarea está bloqueada por dependencias sin cerrar? */
export function isBlockedByDeps(eng, task) {
  return blockingDeps(eng, task).length > 0;
}

// ---- Hitos -----------------------------------------------------------------

/** Añade un hito con fecha objetivo. */
export function addMilestone(eng, title, due = null) {
  const text = String(title || "").trim();
  if (!text) return eng;
  const m = { id: uid("ms"), title: text, due: normDate(due), doneAt: null };
  const milestones = [...(eng.milestones || []), m].sort(byDue);
  return touch({ ...eng, milestones });
}

/** Alterna un hito entre cumplido / pendiente. */
export function toggleMilestone(eng, id) {
  const milestones = (eng.milestones || []).map((m) =>
    m.id === id ? { ...m, doneAt: m.doneAt ? null : now() } : m);
  return touch({ ...eng, milestones });
}

/** Elimina un hito. */
export function removeMilestone(eng, id) {
  return touch({ ...eng, milestones: (eng.milestones || []).filter((m) => m.id !== id) });
}

function byDue(a, b) { return (a.due || "9999").localeCompare(b.due || "9999"); }

// ---- Adjuntos (enlaces) ----------------------------------------------------
// No subimos binarios: el estado se sincroniza como un único documento JSON, así
// que un adjunto es una REFERENCIA citada (etiqueta + URL) — honesto con la
// arquitectura. Drive, Figma, un repo, un brief: lo que viva en algún sitio.

/** Añade un adjunto-enlace. Exige una URL http(s). */
export function addAttachment(eng, label, url, by = "") {
  const u = String(url || "").trim();
  if (!/^https?:\/\//i.test(u)) return eng;
  const a = { id: uid("att"), label: String(label || "").trim() || u, url: u, by: by || "", at: now() };
  return touch({ ...eng, attachments: [...(eng.attachments || []), a] });
}

/** Elimina un adjunto. */
export function removeAttachment(eng, id) {
  return touch({ ...eng, attachments: (eng.attachments || []).filter((a) => a.id !== id) });
}

// ---- Bitácora --------------------------------------------------------------

/**
 * Añade una entrada a la bitácora (sesión de trabajo / decisión / nota). Puede
 * vincular un commit de git: `addLog(eng, nota, by, { commit: { hash, url } })`.
 * El hash se normaliza a corto (7) y se conserva el largo para el enlace.
 */
export function addLog(eng, note, by = "", { commit = null } = {}) {
  const text = String(note || "").trim();
  const c = normCommit(commit);
  if (!text && !c) return eng;
  const entry = { id: uid("log"), at: now(), by: by || "", note: text, commit: c };
  // Más reciente primero: la bitácora se lee de arriba abajo.
  return touch({ ...eng, log: [entry, ...eng.log] });
}

function normCommit(c) {
  if (!c) return null;
  const hash = String(c.hash || "").trim().toLowerCase();
  if (!/^[0-9a-f]{7,40}$/.test(hash)) return null;
  const url = String(c.url || "").trim();
  return { hash, short: hash.slice(0, 7), url: /^https?:\/\//i.test(url) ? url : "" };
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

/** Hoy en formato YYYY-MM-DD (inyectable en tests). */
export function today(d = new Date()) {
  return normDate(d) || new Date().toISOString().slice(0, 10);
}

/**
 * ¿Un item (tarea u hito) está vencido? Tiene `due` en el pasado y NO está
 * cerrado (tarea: state!=="done"; hito: sin doneAt). `ref` = fecha de hoy.
 */
export function isOverdue(item, ref = today()) {
  if (!item || !item.due) return false;
  const done = item.doneAt || item.state === "done";
  return !done && item.due < ref;
}

/** Cuenta de items vencidos en un engagement (tareas + hitos). */
export function overdueCount(eng, ref = today()) {
  const t = eng.tasks.filter((x) => isOverdue(x, ref)).length;
  const m = (eng.milestones || []).filter((x) => isOverdue(x, ref)).length;
  return t + m;
}

/** ¿Todo entregable cerrado? (todas las tareas hechas y hay al menos una). */
export function isComplete(eng) {
  return eng.tasks.length > 0 && eng.tasks.every((t) => t.state === "done");
}
