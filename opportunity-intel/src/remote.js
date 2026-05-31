// =============================================================================
// remote.js — Caller de Edge Functions (cliente).
//
// Una salida por acción; cada export envuelve un POST a su función con el token
// de sesión. Mismo backend que el resto del cliente (ver messaging/usersync).
// BASE es inyectable para tests/launcher; en producción cae al proyecto fijo.
// =============================================================================

const BASE = globalThis.__CONNECT_API__ || "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

const URL_DRIVE = BASE ? `${BASE}/drive` : "";
const URL_PRESENCE = BASE ? `${BASE}/presence` : "";

async function post(url, body) {
  // Resiliente: una caída de red NUNCA lanza (devuelve un objeto limpio). Así la
  // UI puede pintar el error sin arrastrar rechazos sueltos.
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    if (!res.ok && res.status >= 500) return { ok: false, error: `Servidor no disponible (${res.status}).` };
    return await res.json();
  } catch {
    return { ok: false, error: "Sin conexión con el servidor." };
  }
}

/** Drive: almacenamiento de archivos del equipo (carpetas). El payload lleva la
 *  acción ("list"|"signUpload"|"signDownload"|"delete") y el token de sesión. */
export function remoteDrive(token, payload) {
  return post(URL_DRIVE, { token, ...(payload || {}) });
}

/** Presencia: latido y mesa del equipo. El payload lleva la acción
 *  ("beat"|"roster") y, en beat, el estado y la actividad. */
export function remotePresence(token, payload) {
  return post(URL_PRESENCE, { token, ...(payload || {}) });
}
