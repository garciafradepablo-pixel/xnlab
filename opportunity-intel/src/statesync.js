// =============================================================================
// statesync.js — Estado operativo compartido en el backend (Supabase).
//
// Resuelve "lo que hago en mi navegador no lo ve el otro": el estado operativo
// (CRM, notas, verificaciones, follow-ups, leads añadidos) deja de vivir SOLO
// en localStorage y pasa a guardarse de forma durable en Supabase, en un único
// documento de espacio de trabajo compartido. Así Pablo y Javi ven la misma
// mesa de trabajo desde cualquier navegador o dispositivo.
//
// Mecánica honesta y conservadora (sin realtime todavía):
//   - load: trae el documento compartido {data, rev}.
//   - save: escribe SOLO si tu `rev` coincide con el del servidor (control
//     optimista). Si otro escribió entre medias, el servidor devuelve
//     {conflict:true, data, rev} y el cliente re-fusiona y reintenta. Nunca
//     pisa ciegamente: lo más reciente por entidad gana (ver store.importState).
//
// La fuente durable es el servidor; localStorage queda como caché/offline.
// La Edge Function usa la service_role key EN EL SERVIDOR; el cliente solo lleva
// la clave publishable (pública). RLS de la tabla deniega el acceso directo:
// solo la función (service role) entra. =======================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/connect-state";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

async function call(action, payload) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok && res.status >= 500) throw new Error(`backend ${res.status}`);
  return res.json();
}

/** Trae el documento compartido. {ok, data, rev} (data=null si aún no existe). */
export function remoteLoadState(workspace = "default") {
  return call("load", { workspace });
}

/**
 * Guarda el documento compartido con control optimista por `rev`.
 * @returns {Promise<{ok, rev?, conflict?, data?, error?}>}
 *   ok:true → guardado, `rev` es el nuevo número de revisión.
 *   conflict:true → otro escribió antes; `data`/`rev` traen lo del servidor
 *   para que el cliente re-fusione y reintente.
 */
export function remoteSaveState(data, rev, by, workspace = "default") {
  return call("save", { workspace, data, rev, by: by || null });
}
