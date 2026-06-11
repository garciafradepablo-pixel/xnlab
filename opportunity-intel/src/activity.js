// =============================================================================
// activity.js — Feed de actividad del equipo: la trazabilidad (lógica pura).
//
// El pegamento de "una única fuente de verdad": cada vez que algo cambia (una
// tarea hecha, un archivo subido, un lead nuevo), la acción que muta emite un
// evento. El Feed los lee y los muestra agrupados por día. Append-only: es la
// memoria honesta de qué pasó y quién lo hizo, no un estado editable.
//
// El AUTOR no lo pone el cliente: lo resuelve el servidor desde el token (no se
// puede firmar en nombre de otro). Aquí solo se describe y se agrupa.
// =============================================================================

import { getToken } from "./auth.js";
import { remoteActivity } from "./remote.js";

// Verbos conocidos: glifo + frase. El servidor valida contra este mismo conjunto
// (mantener en sincronía con functions/activity). Un verbo desconocido se pinta
// con un punto neutro y no rompe el feed.
export const VERBS = {
  task_new: { glyph: "＋", text: "creó la tarea" },
  task_done: { glyph: "✓", text: "completó" },
  file_up: { glyph: "📎", text: "subió" },
  file_rm: { glyph: "🗑", text: "eliminó" },
  lead_new: { glyph: "✨", text: "creó el lead" },
  client_update: { glyph: "🔁", text: "actualizó" },
  ai_run: { glyph: "🤖", text: "el piloto capturó leads" },
  note: { glyph: "📝", text: "anotó" },
  next_action: { glyph: "▶", text: "ejecutó" },
};

/** Glifo + frase de un verbo (con respaldo neutro para verbos no catalogados). */
export function verbMeta(verb) {
  return VERBS[verb] || { glyph: "•", text: "registró" };
}

const atOf = (ev) => (ev && (ev.at || ev.created_at)) || null;
const ms = (v) => (typeof v === "number" ? v : Date.parse(v));

/**
 * Crea un evento normalizado. Sin actor o sin verbo → null (no se registra
 * basura). El actor real lo pone el servidor; aquí sirve para tests y para el
 * pintado optimista. @param {{actor?, verb, object?, meta?}} input
 */
export function makeEvent({ actor, verb, object, meta } = {}) {
  if (!verb) return null;
  const now = new Date().toISOString();
  return {
    id: `a_${now}_${Math.random().toString(36).slice(2, 8)}`,
    actor: String(actor || "").trim() || null,
    verb: String(verb),
    object: object != null && String(object).trim() ? String(object).trim().slice(0, 160) : null,
    meta: meta || null,
    at: now,
  };
}

/** Frase legible de un evento: "Pablo completó «Llamar a Bodega X»". */
export function describe(ev) {
  if (!ev) return "";
  const m = verbMeta(ev.verb);
  const actor = String(ev.actor || "Alguien").trim();
  const obj = ev.object ? ` «${ev.object}»` : "";
  const where = ev.meta && ev.meta.folder ? ` en ${ev.meta.folder}` : "";
  return `${actor} ${m.text}${obj}${where}`.replace(/\s+/g, " ").trim();
}

/** Orden estable: más reciente primero. */
export function sortEvents(events = []) {
  return [...events].sort((a, b) => (ms(atOf(b)) || 0) - (ms(atOf(a)) || 0));
}

function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }

/** Etiqueta de día relativa: "Hoy", "Ayer" o fecha corta. */
export function dayLabel(at, now = Date.now()) {
  const t = ms(at);
  if (!Number.isFinite(t)) return "—";
  const days = Math.round((startOfDay(now) - startOfDay(t)) / 86400000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  return new Date(t).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/**
 * Agrupa los eventos por día natural, día más reciente primero y, dentro de cada
 * día, evento más reciente arriba. @returns {Array<{key, label, events}>}
 */
export function groupByDay(events = [], now = Date.now()) {
  const sorted = sortEvents(events);
  const groups = [];
  const idx = new Map();
  for (const ev of sorted) {
    const t = ms(atOf(ev));
    if (!Number.isFinite(t)) continue;
    const key = startOfDay(t);
    if (!idx.has(key)) { const g = { key, label: dayLabel(t, now), events: [] }; idx.set(key, g); groups.push(g); }
    idx.get(key).events.push(ev);
  }
  return groups;
}

/** Hora del evento en lenguaje humano ("ahora mismo", "hace 12 min", "14:30"). */
export function relativeTime(at, now = Date.now()) {
  const t = ms(at);
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "ahora mismo";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 6) return `hace ${h} h`;
  return new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

// ── Capa de red ──────────────────────────────────────────────────────────────

/**
 * Emite un evento al feed. Fire-and-forget: nunca espera ni rompe el flujo que
 * lo llama (si no hay sesión o falla la red, simplemente no se registra). El
 * actor lo pone el servidor desde el token. @returns {Promise<{ok}>}
 */
export function logActivity(verb, object, meta) {
  const token = getToken();
  if (!token || !verb) return Promise.resolve({ ok: false });
  return remoteActivity(token, {
    action: "emit",
    verb: String(verb),
    object: object != null ? String(object).slice(0, 160) : null,
    meta: meta || null,
  }).catch(() => ({ ok: false }));
}

/** Trae los eventos recientes del feed (más reciente primero). */
export function fetchFeed(limit) {
  const token = getToken();
  if (!token) return Promise.resolve({ ok: false, error: "sin sesión" });
  return remoteActivity(token, { action: "feed", limit });
}
