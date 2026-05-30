// =============================================================================
// usersync.js — Cuentas en el backend (Supabase), durables y compartidas.
//
// Resuelve el problema real de "creé mi usuario y no aparece": el localStorage
// NO se comparte entre navegadores (Safari vs. el navegador interno de WhatsApp)
// ni entre dispositivos. Con esto, la cuenta vive en el servidor y Pablo y Javi
// entran desde cualquier sitio con el mismo usuario y contraseña.
//
// El backend es la fuente de verdad; auth.js cachea en local para mantener la
// sesión y poder entrar sin red. Las contraseñas se hashean y verifican en el
// servidor (SHA-256 + sal por usuario); el cliente nunca ve los hashes.
// =============================================================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/users";
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

/** Registra una cuenta en el servidor. {ok, user?, error?} (puede lanzar si no hay red). */
export function remoteRegister(name, password, color) {
  return call("register", { name, password, color });
}

/** Verifica credenciales en el servidor. {ok, user?, error?} (puede lanzar si no hay red). */
export function remoteLogin(name, password) {
  return call("login", { name, password });
}

/** Lista de {name, color} de todas las cuentas (para teñir por autor). [] si falla. */
export async function remoteList() {
  try { const r = await call("list", {}); return r.ok ? r.users : []; }
  catch { return []; }
}
