// =============================================================================
// presence.js — Presencia ligera del equipo: quién está conectado y en qué
// vista, en vivo. Sin backend extra ni websockets: la presencia viaja por el
// MISMO documento compartido (store.js / export-importState) y se poda por TTL,
// así nunca crece ni ensucia el estado durable. Funciones puras y testeables.
//
// Una entrada es { name, color, view, at }. `at` es un epoch ms; si no se
// refresca dentro del TTL, el usuario se considera desconectado y se elimina.
// =============================================================================

export const PRESENCE_TTL = 45000;   // ms sin latido → fuera (offline)
export const HEARTBEAT_MS = 15000;   // cada cuánto late cada cliente (TTL/3)

const at = (v) => (typeof v === "number" ? v : Date.parse(v) || 0);

/** Quita entradas obsoletas (más viejas que `ttl`). Devuelve un mapa nuevo. */
export function prunePresence(map = {}, now = Date.now(), ttl = PRESENCE_TTL) {
  const out = {};
  for (const [name, e] of Object.entries(map || {})) {
    if (e && name && now - at(e.at) <= ttl) out[name] = e;
  }
  return out;
}

/** Inserta/actualiza la presencia de un usuario (clave: nombre). Mapa nuevo. */
export function upsertPresence(map = {}, entry, now = Date.now()) {
  const name = String(entry?.name || "").trim();
  if (!name) return map || {};
  return { ...(map || {}), [name]: { name, color: entry.color || "", view: entry.view || "", at: now } };
}

/**
 * Fusiona dos mapas de presencia: por nombre gana el latido más reciente.
 * Luego poda. Es lo que usa importState para mezclar lo del servidor con lo
 * local sin perder a nadie ni resucitar a quien ya se fue.
 */
export function mergePresence(a = {}, b = {}, now = Date.now(), ttl = PRESENCE_TTL) {
  const out = { ...(a || {}) };
  for (const [name, e] of Object.entries(b || {})) {
    if (!e || !name) continue;
    if (!out[name] || at(e.at) > at(out[name].at)) out[name] = e;
  }
  return prunePresence(out, now, ttl);
}

/** Lista activa, ordenada por nombre; opcionalmente excluye a alguien (a ti). */
export function activePresence(map = {}, { now = Date.now(), ttl = PRESENCE_TTL, exclude = "" } = {}) {
  return Object.values(prunePresence(map, now, ttl))
    .filter((e) => e.name && e.name !== exclude)
    .sort((x, y) => x.name.localeCompare(y.name));
}
