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
  // 401/403 (sesión o permiso) son respuestas legítimas con cuerpo JSON, no
  // errores de red: deja que el llamante las interprete. Solo 5xx es "caído".
  if (!res.ok && res.status >= 500) throw new Error(`backend ${res.status}`);
  return res.json();
}

/**
 * Trae el documento compartido. El `token` de sesión identifica al usuario; el
 * servidor exige sesión válida para leer. {ok, data, rev} (data=null si vacío).
 */
export function remoteLoadState(token, workspace = "default") {
  return call("load", { workspace, token });
}

/**
 * Guarda el documento compartido con control optimista por `rev`. El servidor
 * exige que el ROL detrás del `token` pueda escribir (admin/editor) o devuelve
 * 403 — refuerzo real, no solo ocultar botones.
 * @returns {Promise<{ok, rev?, conflict?, data?, error?}>}
 */
export function remoteSaveState(data, rev, token, workspace = "default") {
  return call("save", { workspace, data, rev, token });
}

/**
 * Crea un enlace de PRUEBA en solo-lectura (lo pueden generar los roles con
 * permiso de escritura). scope: "workspace" (toda la app) | "company" (ficha).
 * @returns {Promise<{ok, token?, scope?, expires_at?, error?}>}
 */
export function remoteCreateShare(token, scope, company, companyName, workspace = "default") {
  return call("createShare", { token, scope, company, companyName, workspace });
}

/**
 * Abre un enlace de prueba SIN sesión: devuelve el estado compartido en lectura
 * y el foco (scope/company). El que mira no necesita registro ni cuenta.
 * @returns {Promise<{ok, readOnly?, scope?, company?, companyName?, data?, rev?, error?}>}
 */
export function remoteLoadShare(share) {
  return call("loadShare", { share });
}
