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
//
// RBAC: el login/registro devuelven el ROL del usuario y un TOKEN de sesión
// opaco. El token viaja en las llamadas que mutan datos (estado compartido,
// descubrimiento) y el servidor decide con él si tu rol tiene permiso (403 si
// no). El token NO es la service_role key — es un identificador de sesión.
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

/** Registra una cuenta (requiere invitación salvo el primer usuario). Las
 *  etiquetas las elige el usuario en la ronda del registro. */
export function remoteRegister(name, password, color, invite, tags) {
  return call("register", { name, password, color, invite, tags: tags || [] });
}

/** Catálogo de etiquetas de equipo (slug/label). Requiere sesión válida. */
export function remoteTagCatalog(token) {
  return call("tagCatalog", { token });
}

/** Fija las etiquetas del propio usuario (multi). Requiere sesión válida. */
export function remoteSetTags(token, tags) {
  return call("setTags", { token, tags: tags || [] });
}

/** Amplía el catálogo de etiquetas (solo admin; el servidor refuerza). */
export function remoteAddTag(token, label) {
  return call("addTag", { token, label });
}

/** Quita una etiqueta del catálogo (solo admin; el servidor refuerza). */
export function remoteRemoveTag(token, label) {
  return call("removeTag", { token, label });
}

/** Fija el nivel jerárquico de alguien (solo admin; el servidor refuerza). */
export function remoteSetTier(token, targetName, tier) {
  return call("setTier", { token, targetName, tier });
}

/** Ajusta las etiquetas de otra persona (solo admin; el servidor refuerza). */
export function remoteSetUserTags(token, targetName, tags) {
  return call("setUserTags", { token, targetName, tags: tags || [] });
}

/** Genera un código de invitación (solo admin; el servidor refuerza). */
export function remoteCreateInvite(token, role) {
  return call("createInvite", { token, role });
}

/** Verifica credenciales. {ok, user:{name,color,role,token}?, error?} (puede lanzar sin red). */
export function remoteLogin(name, password) {
  return call("login", { name, password });
}

/** Revalida un token y devuelve el usuario+rol actuales del servidor. {ok, user?} */
export function remoteMe(token) {
  return call("me", { token });
}

/** Cambia el rol de otro usuario (solo admin lo logra; el servidor refuerza). */
export function remoteSetRole(token, targetName, role) {
  return call("setRole", { token, targetName, role });
}

/** Cambia la contraseña del propio usuario (requiere token de sesión válido). */
export function remoteSetPassword(token, password) {
  return call("setPassword", { token, password });
}

/** Fija el avatar (emoji) del propio usuario (requiere token de sesión válido). */
export function remoteSetAvatar(token, avatar) {
  return call("setAvatar", { token, avatar });
}

/** Lista de {name, color, role} de todas las cuentas. [] si falla. */
export async function remoteList() {
  try { const r = await call("list", {}); return r.ok ? r.users : []; }
  catch { return []; }
}
