// =============================================================================
// messaging.js — Mensajería interna del equipo (cliente).
//
// Habla con la Edge Function `chat`. Tres superficies sobre la misma tabla:
//   - general → chat general de empresa (todos).
//   - mejoras → apuntes / comentarios de mejora interna (board de notas).
//   - DM 1:1  → privado entre dos trabajadores (el servidor calcula el canal).
//
// El admin puede leer cualquier canal (supervisión); el servidor lo refuerza.
// Toda llamada lleva el token de sesión: sin sesión válida, 401.
// =============================================================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/chat";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

async function call(action, payload) {
  // Resiliente: una caída de red NUNCA lanza (devuelve un objeto limpio). Así la
  // UI puede pintar el error sin arrastrar rechazos sueltos.
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok && res.status >= 500) return { ok: false, error: `Servidor no disponible (${res.status}).` };
    return await res.json();
  } catch {
    return { ok: false, error: "Sin conexión con el servidor." };
  }
}

/** Canal de DM determinista (igual criterio que el servidor): name_lower ordenados. */
export function dmChannel(a, b) {
  return "dm:" + [String(a || "").trim().toLowerCase(), String(b || "").trim().toLowerCase()].sort().join("|");
}

/**
 * Envía un mensaje. Pasa `channel` ("general"|"mejoras") o `to` (nombre del
 * destinatario para un privado). kind "note" para apuntes de mejora.
 * @returns {Promise<{ok, message?, error?}>}
 */
export function sendMessage(token, { channel, to, body, kind } = {}) {
  return call("send", { token, channel, to, body, kind });
}

/** Lista los mensajes de un canal (asc). `since` (ISO) para sondeo incremental. */
export function listMessages(token, { channel, to, since, limit } = {}) {
  return call("list", { token, channel, to, since, limit });
}

/** Mis hilos de privados: [{with, channel, last, at}]. */
export async function listThreads(token) {
  try { const r = await call("threads", { token }); return r && r.ok ? r.threads : []; }
  catch { return []; }
}

/** SOLO admin: todos los hilos de privados del equipo (supervisión). */
export async function adminThreads(token) {
  try { const r = await call("adminThreads", { token }); return r && r.ok ? r.threads : []; }
  catch { return []; }
}

/** Nº de mensajes por autor (alimenta el panel de productividad). {from_lower:{name,count,last}} */
export async function messageStats(token) {
  try { const r = await call("stats", { token }); return r && r.ok ? r.stats : {}; }
  catch { return {}; }
}
