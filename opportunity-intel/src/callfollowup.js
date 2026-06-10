// =============================================================================
// callfollowup.js — Del análisis de una llamada a una tarea de seguimiento real.
//
// Cierra el eslabón "llamada → follow-up → agenda": si una llamada deja una
// fecha de seguimiento (explícita en el análisis, o expresada en la
// transcripción como "mañana", "el lunes", "la semana que viene", "en 3 días"),
// se fabrica una TAREA de seguimiento asociada al lead y a la llamada. Esa tarea
// viaja por la colección `tasks` del documento compartido y aparece en Hoy/Agenda.
//
// Reglas honestas:
//   - Sin fecha clara NO se inventa fecha: se devuelve null (el siguiente paso
//     ya queda guardado dentro de la llamada, pero no se crea tarea con fecha falsa).
//   - El id de la tarea es DETERMINISTA por llamada (`fu_<callId>`): guardar o
//     editar la misma llamada actualiza la misma tarea, nunca la duplica.
//
// Todo PURO y testeable: el parser recibe una fecha de referencia, así que el
// resultado no depende del reloj en los tests.
// =============================================================================

import { ymd } from "./agenda.js";

const pad = (n) => String(n).padStart(2, "0");
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const isYmd = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

// Suma `n` días a una fecha de referencia y devuelve "YYYY-MM-DD" (hora local).
function addDays(ref, n) {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  d.setDate(d.getDate() + n);
  return ymd(d);
}

const WEEKDAYS = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };

/**
 * Extrae una fecha de seguimiento de un texto, relativa a `refDate`. Mínimo,
 * honesto y testeable: cubre las formas que de verdad aparecen en una llamada.
 * Devuelve "YYYY-MM-DD" o null si no hay fecha clara.
 *
 * TODO: ampliar a expresiones más ricas ("a final de mes", "tras las fiestas")
 * cuando aparezcan datos reales que lo justifiquen.
 *
 * @param {string} text
 * @param {Date} [refDate]  fecha de referencia (hoy); inyectable para tests
 * @returns {string|null}
 */
export function parseFollowUpDate(text, refDate = new Date()) {
  const n = norm(text);
  if (!n.trim()) return null;

  // 1) Fecha explícita dd/mm[/yyyy] o dd-mm[-yyyy].
  const m = n.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (m) {
    const day = Number(m[1]); const mon = Number(m[2]);
    let year = m[3] ? Number(m[3]) : refDate.getFullYear();
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && mon >= 1 && mon <= 12) {
      return `${year}-${pad(mon)}-${pad(day)}`;
    }
  }

  // 2) Pasado mañana (antes que "mañana").
  if (/\bpasado\s+manana\b/.test(n)) return addDays(refDate, 2);

  // 3) Semana que viene / próxima semana.
  if (/\b(semana que viene|proxima semana|la semana que viene)\b/.test(n)) return addDays(refDate, 7);

  // 4) "en X días" / "en un día".
  const days = n.match(/\ben\s+(\d+|un|una)\s+dias?\b/);
  if (days) return addDays(refDate, days[1] === "un" || days[1] === "una" ? 1 : Number(days[1]));

  // 5) "en X semanas".
  const weeks = n.match(/\ben\s+(\d+|un|una)\s+semanas?\b/);
  if (weeks) return addDays(refDate, (weeks[1] === "un" || weeks[1] === "una" ? 1 : Number(weeks[1])) * 7);

  // 6) Día de la semana ("el lunes", "el próximo jueves") → próxima ocurrencia.
  for (const [name, idx] of Object.entries(WEEKDAYS)) {
    if (new RegExp(`\\b${name}\\b`).test(n)) {
      let delta = (idx - refDate.getDay() + 7) % 7;
      if (delta === 0) delta = 7; // "el lunes" estando en lunes = el próximo
      return addDays(refDate, delta);
    }
  }

  // 7) Mañana (como día), ignorando "por la mañana"/"esta mañana" (franja horaria).
  const cleaned = n.replace(/\b(esta|por la|de la)\s+manana\b/g, " ");
  if (/\bmanana\b/.test(cleaned)) return addDays(refDate, 1);

  // 8) Hoy.
  if (/\bhoy\b/.test(n)) return addDays(refDate, 0);

  return null; // sin fecha clara → no inventamos
}

// Prioridad inferida de la tarea, a partir del análisis de la llamada.
function inferPriority(analysis = {}) {
  if (analysis.urgency === "alta") return "alta";
  if (analysis.urgency === "baja") return "baja";
  const cp = typeof analysis.closeProbability === "number" ? analysis.closeProbability : null;
  if (cp != null) return cp >= 70 ? "alta" : cp >= 40 ? "media" : "baja";
  return "media";
}

/**
 * Construye la tarea de seguimiento de una llamada, o null si no hay fecha clara.
 * Id determinista por llamada → upsert sin duplicar.
 *
 * @param {import('./calls.js').CallRecord} call
 * @param {object} [lead]  oportunidad (para el título); usa .company
 * @param {object} [opts]  { refDate, assignee }
 * @returns {object|null}  tarea con campos extra (type, leadId, callId, dueDate, note, priority)
 */
export function buildFollowUpTask(call, lead = {}, opts = {}) {
  if (!call || !call.id) return null;
  const refDate = opts.refDate || new Date();
  const a = call.analysis || {};
  // Fecha: la explícita del análisis (LLM) manda; si no, se parsea del texto.
  const explicit = isYmd(a.followUpDate) ? a.followUpDate : null;
  const text = [call.transcript, a.nextStep, a.followUp].filter(Boolean).join(". ");
  const dueDate = explicit || parseFollowUpDate(text, refDate);
  if (!dueDate) return null;

  const now = new Date().toISOString();
  const company = lead.company || "lead";
  return {
    id: `fu_${call.id}`,
    type: "follow_up",
    leadId: call.leadId,
    callId: call.id,
    dueDate,
    title: `Seguimiento · ${company}`,
    note: a.nextStep || "Seguimiento de la llamada.",
    priority: inferPriority(a),
    assignee: opts.assignee || call.by || null,
    status: "todo",
    by: call.by || null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Tareas de seguimiento pendientes que tocan hoy o están vencidas, ordenadas por
 * fecha (lo más vencido primero). Para la vista Hoy/Agenda.
 * @param {Array} tasks
 * @param {string} today  "YYYY-MM-DD"
 */
export function dueFollowupTasks(tasks = [], today) {
  return tasks
    .filter((t) => t && t.type === "follow_up" && t.status !== "done" && t.dueDate && (!today || t.dueDate <= today))
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
}
