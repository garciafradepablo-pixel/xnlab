// =============================================================================
// auth.js — Cuentas de usuario (local) con color de firma.
//
// Para trabajar en equipo dejando constancia de QUIÉN hace cada cosa:
//   - Crear usuario: nombre + contraseña + color (fijo, siempre el mismo).
//   - Iniciar sesión: nombre + contraseña.
//   - El usuario en sesión "firma" cada acción (estado, nota, verificación,
//     lead añadido) con su nombre y su color → la web se va tiñendo por autor.
//
// Seguridad honesta: es almacenamiento LOCAL del navegador, no un backend de
// verdad. La contraseña se guarda hasheada (no en claro) para no exponerla a
// la vista, pero NO sustituye a un login real con servidor. Sirve para separar
// el trabajo de Pablo y Javi en sus dispositivos y dejar autoría. Para
// multi-dispositivo real se conecta el backend (Supabase) — la forma no cambia.
// =============================================================================

import * as usersync from "./usersync.js";

const NS = "oi:";
const USERS_KEY = `${NS}users`;
const SESSION_KEY = `${NS}session`;

// Capa remota (Supabase). Inyectable para tests; en producción es usersync.
let remote = usersync;
export function __setRemote(r) { remote = r; }

const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };

function read(k, fb) { try { const r = storage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } }
function write(k, v) { try { storage.setItem(k, JSON.stringify(v)); } catch { /* */ } }

// Hash simple (FNV-1a) + sal. NO es criptográfico — solo evita guardar la
// contraseña en claro. Suficiente para un separador de usuarios local.
function hash(str) {
  let h = 0x811c9dc5;
  const s = `oi-salt::${str}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

const norm = (s) => String(s || "").trim().toLowerCase();

// Paleta de colores de firma (distintos y legibles sobre fondo oscuro).
export const SIGNATURE_COLORS = [
  "#4a9eff", // azul
  "#3fb950", // verde
  "#c9a227", // oro
  "#8b7bd8", // violeta
  "#f0883e", // naranja
  "#ec6cb9", // rosa
  "#2dd4bf", // turquesa
  "#f04747", // rojo
];

/** @returns {Array<{name,color,hash,createdAt}>} */
export function getUsers() { return read(USERS_KEY, []); }

/** Color libre que aún no usa nadie (o el primero si todos cogidos). */
export function nextFreeColor() {
  const used = new Set(getUsers().map((u) => u.color));
  return SIGNATURE_COLORS.find((c) => !used.has(c)) || SIGNATURE_COLORS[0];
}

/**
 * Crea un usuario. Devuelve {ok, error?}.
 * El color es FIJO: una vez elegido, ese usuario siempre firma con él.
 */
export function createUser(name, password, color) {
  const n = String(name || "").trim();
  if (n.length < 2) return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  if (String(password || "").length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  const users = getUsers();
  if (users.some((u) => norm(u.name) === norm(n))) return { ok: false, error: "Ya existe un usuario con ese nombre." };
  const finalColor = color || nextFreeColor();
  users.push({ name: n, color: finalColor, hash: hash(password), createdAt: new Date().toISOString() });
  write(USERS_KEY, users);
  return { ok: true };
}

/** Inicia sesión. Devuelve {ok, error?, user?}. */
export function login(name, password) {
  const u = getUsers().find((x) => norm(x.name) === norm(name));
  if (!u) return { ok: false, error: "Usuario no encontrado." };
  if (u.hash !== hash(password)) return { ok: false, error: "Contraseña incorrecta." };
  write(SESSION_KEY, { name: u.name });
  return { ok: true, user: { name: u.name, color: u.color } };
}

// Cachea/actualiza un usuario en local tras confirmarlo el backend, para que la
// sesión persista y se pueda entrar sin red la próxima vez en este navegador.
function cacheUser(name, color, password) {
  const users = getUsers().filter((u) => norm(u.name) !== norm(name));
  users.push({ name, color, hash: hash(password), createdAt: new Date().toISOString(), remote: true });
  write(USERS_KEY, users);
}

/**
 * Crea un usuario en el BACKEND (durable, multi-dispositivo) y lo cachea en
 * local. Si el servidor no responde, cae al modo local para no bloquear.
 * @returns {Promise<{ok, error?}>}
 */
export async function createUserAsync(name, password, color) {
  const n = String(name || "").trim();
  if (n.length < 2) return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  if (String(password || "").length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  const finalColor = color || nextFreeColor();
  try {
    const r = await remote.remoteRegister(n, password, finalColor);
    if (!r || !r.ok) return { ok: false, error: r?.error || "No se pudo crear el usuario." };
    cacheUser(r.user.name, r.user.color, password);
    return { ok: true };
  } catch {
    // Sin red: crea al menos en local (se sincronizará cuando vuelva la red).
    return createUser(n, password, finalColor);
  }
}

/**
 * Inicia sesión. Intenta LOCAL primero (rápido, offline); si falla (la cuenta
 * no está en ESTE navegador, o la contraseña no coincide), pregunta al BACKEND
 * — que es la fuente de verdad — y, si confirma, cachea la cuenta en local.
 * Así "creé mi usuario en Safari" funciona también dentro de WhatsApp y en otro
 * dispositivo. @returns {Promise<{ok, error?, user?}>}
 */
export async function loginAsync(name, password) {
  const localResult = login(name, password);
  if (localResult.ok) {
    // Migración silenciosa: una cuenta que solo existía en local (de antes del
    // backend) se sube al servidor para volverse durable y funcionar en otros
    // navegadores/dispositivos. Fire-and-forget: no retrasa la entrada.
    migrateLocalUser(name, password);
    return localResult;
  }
  try {
    const r = await remote.remoteLogin(name, password);
    if (r && r.ok && r.user) {
      cacheUser(r.user.name, r.user.color, password);
      write(SESSION_KEY, { name: r.user.name });
      return { ok: true, user: { name: r.user.name, color: r.user.color } };
    }
    // El backend respondió con un error claro (no encontrado / contraseña mal).
    if (r && r.error) return { ok: false, error: r.error };
    return localResult;
  } catch {
    // Sin red: devuelve el resultado local (no empeora el comportamiento previo).
    return localResult;
  }
}

/** Sube al backend una cuenta que solo existía en local, para hacerla durable.
 *  Best-effort e idempotente: si ya existe en el servidor, solo la marca. */
export async function migrateLocalUser(name, password) {
  try {
    const u = getUsers().find((x) => norm(x.name) === norm(name));
    if (!u || u.remote) return;
    const r = await remote.remoteRegister(u.name, password, u.color);
    if (r && (r.ok || /existe/i.test(r.error || ""))) {
      const users = getUsers();
      const t = users.find((x) => norm(x.name) === norm(name));
      if (t) { t.remote = true; write(USERS_KEY, users); }
    }
  } catch { /* sin red: se migrará en el próximo login */ }
}

/** Trae los colores de firma de todas las cuentas y los mezcla en local, para
 *  teñir la actividad por autor de forma consistente entre dispositivos. */
export async function syncRemoteColors() {
  try {
    const list = await remote.remoteList();
    if (!Array.isArray(list) || !list.length) return;
    const users = getUsers();
    const byName = new Map(users.map((u) => [norm(u.name), u]));
    for (const r of list) {
      const ex = byName.get(norm(r.name));
      if (ex) ex.color = r.color; // color es fijo: el del servidor manda
      else users.push({ name: r.name, color: r.color, colorOnly: true }); // solo para teñir
    }
    write(USERS_KEY, users);
  } catch { /* best-effort */ }
}

export function logout() { storage.removeItem(SESSION_KEY); }

/** Usuario en sesión (con su color) o null. */
export function currentUser() {
  const s = read(SESSION_KEY, null);
  if (!s) return null;
  const u = getUsers().find((x) => norm(x.name) === norm(s.name));
  return u ? { name: u.name, color: u.color } : null;
}

/** Color de un usuario por nombre (para teñir su actividad). null si no existe. */
export function colorOf(name) {
  const u = getUsers().find((x) => norm(x.name) === norm(name));
  return u ? u.color : null;
}
