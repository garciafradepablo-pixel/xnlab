// =============================================================================
// agenda.js — Agendas personales + agenda común, con vinculación de tareas.
//
// Un item de agenda tiene un DUEÑO: el nombre de un trabajador (agenda personal)
// o "common" (agenda compartida del equipo). Un item puede VINCULARSE a una
// tarea del Estudio (engagements) — así una tarea de un proyecto entra en la
// agenda personal de quien la va a hacer un día concreto. Y un item común puede
// "tomarse" (reasignarse a una persona): así se vinculan las agendas entre sí.
//
// Lógica pura, sin store ni red. Funciones que reciben y devuelven datos nuevos.
// =============================================================================

export const COMMON = "common";

let _seq = 0;
function uid(p) {
  _seq = (_seq + 1) % 1e6;
  const rnd = (typeof Math !== "undefined" ? Math.random() : 0).toString(36).slice(2, 7);
  return `${p}_${Date.now().toString(36)}${_seq.toString(36)}${rnd}`;
}
const nowIso = () => new Date().toISOString();

/** Normaliza a YYYY-MM-DD (o null). Acepta string o Date. */
export function normDate(d) {
  if (!d) return null;
  if (d instanceof Date) return isNaN(d) ? null : d.toISOString().slice(0, 10);
  const s = String(d).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

/** Hoy en YYYY-MM-DD (inyectable en tests). */
export function today(d = new Date()) {
  return normDate(d) || new Date().toISOString().slice(0, 10);
}

/** Crea un item de agenda. `owner` = nombre de usuario o COMMON. */
export function createAgendaItem({ title, owner = COMMON, date = null, by = "", link = null } = {}) {
  return {
    id: uid("ag"),
    owner: String(owner || COMMON),
    title: String(title || "").trim() || "Sin título",
    date: normDate(date),
    done: false,
    doneAt: null,
    link: link && link.engagementId ? { engagementId: link.engagementId, taskId: link.taskId || null } : null,
    createdAt: nowIso(),
    by: by || "",
  };
}

/** Crea un item de agenda VINCULADO a una tarea del Estudio. */
export function fromEngagementTask(engagement, task, { owner, date = null, by = "" } = {}) {
  if (!engagement || !task) throw new Error("fromEngagementTask: faltan datos");
  return createAgendaItem({
    title: task.title,
    owner: owner || by || COMMON,
    date,
    by,
    link: { engagementId: engagement.id, taskId: task.id },
  });
}

/** Marca/desmarca hecho. */
export function toggleDone(item) {
  const done = !item.done;
  return { ...item, done, doneAt: done ? nowIso() : null };
}

/** Fija (o limpia con null) la fecha. */
export function setDate(item, date) {
  return { ...item, date: normDate(date) };
}

/** Reasigna el dueño: común → persona (tomar), o entre personas (delegar). */
export function claim(item, owner) {
  return { ...item, owner: String(owner || COMMON) };
}

// ---- Lecturas (puras) -------------------------------------------------------

/** Items de un dueño (nombre o COMMON). */
export function itemsFor(items, owner) {
  return (items || []).filter((i) => i.owner === owner);
}

/** ¿Item vencido? Tiene fecha pasada y no está hecho. */
export function isOverdue(item, ref = today()) {
  return !!item.date && !item.done && item.date < ref;
}

/**
 * Agrupa items en cubos ordenados para pintar: Atrasado, Hoy, Mañana, futuros
 * por fecha, y "Sin fecha" al final. Cada cubo: { key, label, date, items }.
 */
export function groupByDay(items, ref = today()) {
  const list = (items || []).slice();
  const tomorrow = addDays(ref, 1);
  const buckets = new Map();
  const ensure = (key, label, date) => {
    if (!buckets.has(key)) buckets.set(key, { key, label, date, items: [] });
    return buckets.get(key);
  };
  for (const it of list) {
    if (!it.date) { ensure("none", "Sin fecha", null).items.push(it); continue; }
    if (isOverdue(it, ref)) { ensure("overdue", "Atrasado", null).items.push(it); continue; }
    if (it.date === ref) { ensure("today", "Hoy", ref).items.push(it); continue; }
    if (it.date === tomorrow) { ensure("tomorrow", "Mañana", tomorrow).items.push(it); continue; }
    ensure(it.date, it.date, it.date).items.push(it);
  }
  const order = (b) => (b.key === "overdue" ? "0" : b.key === "today" ? "1" : b.key === "tomorrow" ? "2" : b.key === "none" ? "9999" : "3" + b.date);
  return [...buckets.values()].sort((a, b) => order(a).localeCompare(order(b)));
}

export function addDays(date, n) {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
