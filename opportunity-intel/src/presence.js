// =============================================================================
// presence.js — Presencia del equipo: quién está ahora y en qué anda.
//
// Primera capa de "Presence & Communication": un estado por persona
// (disponible / ausente / ocupado / en reunión / desconectado), su última
// señal de vida y en qué está trabajando. No es chat; es saber, de un vistazo,
// con quién puedes contar en este momento.
//
// El cliente late: cada cierto rato manda su estado a la función `presence`
// (un upsert por persona). El resto lo lee y, con la frescura del último latido,
// decide si alguien sigue ahí o se le fue la pestaña. Si no late en 75s, se le
// considera desconectado solo (una pestaña cerrada no deja a nadie "verde" para
// siempre). Lógica pura aquí; el latido en vivo lo arranca la UI tras entrar.
// =============================================================================

import { getToken } from "./auth.js";
import { remotePresence } from "./remote.js";

// Estados que una persona declara. "offline" es el estado de despedida explícito
// (al cerrar sesión); el resto significan presencia activa.
export const STATUSES = ["online", "away", "busy", "meeting", "offline"];

export const STATUS_LABELS = {
  online: "Disponible",
  away: "Ausente",
  busy: "Ocupado",
  meeting: "En reunión",
  offline: "Desconectado",
};

// Clase del punto de color (la pinta styles.css). El "offline" es apagado.
export const STATUS_DOT = {
  online: "on",
  away: "away",
  busy: "busy",
  meeting: "meeting",
  offline: "off",
};

// Orden de prioridad para la mesa "Quién está ahora": presentes arriba.
const RANK = { online: 0, meeting: 1, busy: 2, away: 3, offline: 9 };

// Si el último latido tiene más de esto, la persona se considera desconectada
// aunque su último estado declarado fuera "disponible" (pestaña cerrada, sueño,
// red caída). El latido vive bastante por debajo de este umbral.
export const ONLINE_TTL_MS = 75 * 1000;

const norm = (s) => String(s || "").trim().toLowerCase();
const ms = (iso) => { const t = Date.parse(iso); return Number.isFinite(t) ? t : 0; };

/** ¿Es un estado declarable válido? Protege el upsert de basura. */
export function validStatus(status) {
  return STATUSES.includes(String(status || ""));
}

/**
 * Estado EFECTIVO de un registro: lo declarado, pero degradado a "offline" si el
 * latido está rancio o no hay dato. Es lo que se pinta; nunca miente sobre quién
 * sigue ahí. @param {{status?:string, updated_at?:string}} rec
 */
export function deriveStatus(rec, now = Date.now()) {
  if (!rec || !rec.status) return "offline";
  if (rec.status === "offline") return "offline";
  if (!validStatus(rec.status)) return "offline";
  if (now - ms(rec.updated_at) > ONLINE_TTL_MS) return "offline"; // latido rancio
  return rec.status;
}

/** ¿La persona cuenta como presente ahora mismo? */
export function isPresent(rec, now = Date.now()) {
  return deriveStatus(rec, now) !== "offline";
}

/**
 * Fusiona los registros del servidor con el equipo (de `users`) para que SIEMPRE
 * aparezcan todos, aunque alguien no haya latido nunca (→ desconectado). Cada
 * fila trae el estado efectivo, lo que anda haciendo y su última señal.
 * @param {Array} records  filas de la función presence
 * @param {Array<{name:string}>} users  equipo en el orden deseado
 * @returns {Array<{name, status, declared, activity, lastSeen, me?}>}
 */
export function buildRoster(records = [], users = [], now = Date.now(), meName = "") {
  const byKey = new Map();
  for (const r of records) {
    const k = r && (r.name_lower || norm(r.name));
    if (k) byKey.set(k, r);
  }
  const meKey = norm(meName);
  const seen = new Set();
  const rows = [];

  const push = (name, rec) => {
    const k = norm(name);
    if (!k || seen.has(k)) return;
    seen.add(k);
    rows.push({
      name: (rec && rec.name) || name,
      status: deriveStatus(rec, now),
      declared: (rec && rec.status) || "offline",
      activity: (rec && String(rec.activity || "").trim()) || "",
      lastSeen: (rec && rec.updated_at) || null,
      me: k === meKey,
    });
  };

  // Primero el equipo en su orden (organigrama); luego cualquier registro suelto
  // que no esté en la lista (p. ej. alguien recién invitado aún no listado).
  for (const u of users) if (u && u.name) push(u.name, byKey.get(norm(u.name)));
  for (const r of records) if (r) push(r.name, r);
  return rows;
}

/** Ordena la mesa: presentes arriba (por prioridad de estado), luego por nombre. */
export function sortRoster(roster = []) {
  return [...roster].sort((a, b) => {
    const ra = RANK[a.status] ?? 9, rb = RANK[b.status] ?? 9;
    if (ra !== rb) return ra - rb;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

/** Conteo para el encabezado: { present, online, total }. */
export function summarize(roster = []) {
  let present = 0, online = 0;
  for (const r of roster) {
    if (r.status !== "offline") present++;
    if (r.status === "online") online++;
  }
  return { present, online, total: roster.length };
}

/** Última señal en lenguaje humano ("ahora mismo", "hace 3 min", "hace 2 h"). */
export function relativeSeen(updatedAt, now = Date.now()) {
  const t = ms(updatedAt);
  if (!t) return "sin señal";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "ahora mismo";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

// ── Capa de red (no se ejercita en tests) ───────────────────────────────────

/** Manda mi latido: estado + en qué ando. Resiliente (nunca lanza). */
export function sendBeat(status, activity) {
  const token = getToken();
  if (!token) return Promise.resolve({ ok: false, error: "sin sesión" });
  const st = validStatus(status) ? status : "online";
  return remotePresence(token, { action: "beat", status: st, activity: String(activity || "").slice(0, 120) });
}

/** Trae la mesa cruda del servidor (sin fusionar con el equipo). */
export function fetchRoster() {
  const token = getToken();
  if (!token) return Promise.resolve({ ok: false, error: "sin sesión" });
  return remotePresence(token, { action: "roster" });
}

// ── Latido en vivo (controlador de runtime; lo arranca la UI) ────────────────

const BEAT_MS = 30 * 1000; // bastante por debajo de ONLINE_TTL_MS
let beatTimer = null;
let getBeat = null; // () => ({ status, activity })

/**
 * Arranca el latido: late ya y luego cada BEAT_MS. `getBeat` lo provee la UI y
 * devuelve el estado actual + actividad (p. ej. la vista en la que estás).
 * Idempotente: re-arrancar solo cambia la fuente. @param {Function} getState
 */
export function startHeartbeat(getState) {
  getBeat = typeof getState === "function" ? getState : null;
  if (beatTimer) return; // ya late
  const tick = () => { const s = (getBeat && getBeat()) || {}; sendBeat(s.status || "online", s.activity || ""); };
  tick();
  beatTimer = setInterval(tick, BEAT_MS);
  if (beatTimer && typeof beatTimer.unref === "function") beatTimer.unref();
}

/** Manda un latido inmediato (al cambiar de vista/estado, sin esperar al timer). */
export function beatNow() {
  const s = (getBeat && getBeat()) || {};
  return sendBeat(s.status || "online", s.activity || "");
}

/** Para el latido y anuncia la despedida (un último beat "offline"). */
export function stopHeartbeat() {
  if (beatTimer) { clearInterval(beatTimer); beatTimer = null; }
  getBeat = null;
  return sendBeat("offline", "");
}
