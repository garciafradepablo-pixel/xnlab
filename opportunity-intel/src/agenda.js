// =============================================================================
// agenda.js — Planificación de rondas de llamadas por persona.
//
// Reparte los leads asignados a alguien en días laborables respetando su
// capacidad (llamadas/día) y sus días de trabajo. Una "ronda" es un bloque de
// días (por defecto una semana laboral). Lógica PURA y testeable (sin DOM, sin
// almacenamiento): la UI solo pinta lo que estas funciones deciden, igual que
// today.js. Así "cómo se estructura la semana de Dani" queda blindado por tests.
// =============================================================================

// Horario por defecto: lunes-viernes (ISO 1..7), jornada de oficina, 8
// llamadas/día. perDay es la capacidad real: cuántas llamadas caben en un día.
export const DEFAULT_SCHEDULE = { workdays: [1, 2, 3, 4, 5], start: "09:00", end: "18:00", perDay: 8 };

const pad = (n) => String(n).padStart(2, "0");
/** Fecha → "YYYY-MM-DD" en horario local (sin saltos de zona). */
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// getDay(): 0=domingo..6=sábado. Nuestros workdays usan ISO 1=lunes..7=domingo.
const isoDow = (date) => (date.getDay() === 0 ? 7 : date.getDay());

/** Generador infinito de fechas laborables (YYYY-MM-DD) desde `from` inclusive. */
function* workdays(from, days) {
  const set = new Set(days && days.length ? days : DEFAULT_SCHEDULE.workdays);
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let guard = 0;
  while (guard++ < 4000) {
    if (set.has(isoDow(d))) yield ymd(d);
    d.setDate(d.getDate() + 1);
  }
}

/**
 * Ordena oportunidades por prioridad de llamada en frío: primero el Índice de
 * Éxito (lo que de verdad cierra), luego la confianza. Sin tener en cuenta el
 * estado — es para PLANIFICAR la ronda, no para el foco de hoy.
 */
export function orderByPriority(opps = []) {
  return [...opps].sort((a, b) => {
    const sa = a.scores || {}, sb = b.scores || {};
    return (sb.successIndex || 0) - (sa.successIndex || 0) || (sb.confidence || 0) - (sa.confidence || 0);
  });
}

/**
 * Reparte leads (ya ordenados por prioridad) en días laborables, llenando
 * `perDay` por jornada. Cada lead recibe una fecha, un número de día y una ronda.
 *
 * @param {Array} leads  oportunidades ordenadas (la primera, la más prioritaria)
 * @param {{workdays?:number[], perDay?:number}} schedule
 * @param {{from?:Date|string, perRound?:number}} [opts]
 *   from: día de arranque (por defecto hoy). perRound: días por ronda (5 = semana).
 * @returns {Array<{id:string, date:string, round:number, day:number, slot:number}>}
 */
export function planRounds(leads = [], schedule = DEFAULT_SCHEDULE, opts = {}) {
  const perDay = Math.max(1, Math.floor(schedule.perDay || DEFAULT_SCHEDULE.perDay));
  const days = schedule.workdays && schedule.workdays.length ? schedule.workdays : DEFAULT_SCHEDULE.workdays;
  const perRound = Math.max(1, Math.floor(opts.perRound || 5));
  const it = workdays(opts.from ? new Date(opts.from) : new Date(), days);

  const out = [];
  let dayIndex = 0;
  let date = it.next().value;
  let slot = 0;
  for (const lead of leads) {
    if (slot >= perDay) { date = it.next().value; dayIndex++; slot = 0; }
    slot++;
    out.push({ id: lead.id, date, round: Math.floor(dayIndex / perRound) + 1, day: dayIndex + 1, slot });
  }
  return out;
}

/** Agrupa asignaciones por fecha, en orden cronológico. */
export function groupByDate(assignments = []) {
  const m = new Map();
  for (const a of assignments) (m.get(a.date) || m.set(a.date, []).get(a.date)).push(a);
  return [...m.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1)).map(([date, items]) => ({ date, items }));
}

/** Agrupa asignaciones por ronda, en orden. */
export function groupByRound(assignments = []) {
  const m = new Map();
  for (const a of assignments) (m.get(a.round) || m.set(a.round, []).get(a.round)).push(a);
  return [...m.entries()].sort((x, y) => x[0] - y[0]).map(([round, items]) => ({ round, items }));
}

/** Resumen del plan: total de llamadas, días, rondas y fechas de inicio/fin. */
export function planSummary(assignments = []) {
  if (!assignments.length) return { calls: 0, days: 0, rounds: 0, from: null, to: null };
  const dates = [...new Set(assignments.map((a) => a.date))].sort();
  return {
    calls: assignments.length,
    days: dates.length,
    rounds: Math.max(...assignments.map((a) => a.round)),
    from: dates[0],
    to: dates[dates.length - 1],
  };
}
