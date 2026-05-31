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
import { normalizeRole, DEFAULT_ROLE } from "./roles.js";

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

// Nombre canónico de equipo: MAYÚSCULAS y espacios colapsados. El servidor
// aplica lo mismo; aquí es para coherencia local y feedback inmediato.
const canonName = (s) => String(s || "").trim().replace(/\s+/g, " ").toUpperCase();
// Regla: nombre + al menos un apellido (dos palabras).
const hasSurname = (s) => canonName(s).split(" ").filter(Boolean).length >= 2;
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
// Apodo de partida = nombre de pila (privacidad: el equipo se ve por aka).
const firstName = (s) => { const w = canonName(s).split(" ")[0] || ""; return w ? w[0] + w.slice(1).toLowerCase() : ""; };

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

/** Colores aún libres (ningún usuario los firma). Un color elegido desaparece
 *  del catálogo para futuros usuarios. Vacío si ya están todos cogidos. */
export function availableColors() {
  const used = new Set(getUsers().map((u) => u.color));
  return SIGNATURE_COLORS.filter((c) => !used.has(c));
}

/** Mapa color → nombre del usuario que lo firma (para bloquear los cogidos). */
export function colorOwners() {
  const m = new Map();
  for (const u of getUsers()) if (u.color && !m.has(u.color)) m.set(u.color, u.name);
  return m;
}

/** Color libre que aún no usa nadie (o el primero si todos cogidos). */
export function nextFreeColor() {
  return availableColors()[0] || SIGNATURE_COLORS[0];
}

/**
 * Crea un usuario. Devuelve {ok, error?}.
 * El color es FIJO: una vez elegido, ese usuario siempre firma con él.
 */
export function createUser(name, password, color) {
  const n = canonName(name);
  if (n.length < 2) return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  if (!hasSurname(n)) return { ok: false, error: "Escribe tu NOMBRE y un APELLIDO (los dos)." };
  if (String(password || "").length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  const users = getUsers();
  if (users.some((u) => norm(u.name) === norm(n))) return { ok: false, error: "Ya existe un usuario con ese nombre." };
  const finalColor = color || nextFreeColor();
  users.push({ name: n, color: finalColor, hash: hash(password), createdAt: new Date().toISOString() });
  write(USERS_KEY, users);
  return { ok: true };
}

/** Inicia sesión (local). Devuelve {ok, error?, user?}. */
export function login(name, password) {
  const u = getUsers().find((x) => norm(x.name) === norm(name));
  if (!u) return { ok: false, error: "Usuario no encontrado." };
  if (u.hash !== hash(password)) return { ok: false, error: "Contraseña incorrecta." };
  // Sesión local sin backend: conserva el rol cacheado (o el por defecto). Sin
  // token, el servidor rechazará mutaciones — es el comportamiento honesto
  // offline: puedes mirar, pero escribir compartido exige sesión verificada.
  write(SESSION_KEY, { name: u.name, role: u.role || DEFAULT_ROLE, token: u.token || null });
  return { ok: true, user: { name: u.name, color: u.color, role: u.role || DEFAULT_ROLE } };
}

// Cachea/actualiza un usuario en local tras confirmarlo el backend, para que la
// sesión persista y se pueda entrar sin red la próxima vez en este navegador.
// Guarda también rol y token de sesión devueltos por el servidor.
function cacheUser(name, color, password, role, token, avatar, aka, email, photo) {
  const prev = getUsers().find((u) => norm(u.name) === norm(name));
  const users = getUsers().filter((u) => norm(u.name) !== norm(name));
  users.push({
    name, color, avatar: avatar ?? prev?.avatar ?? null, hash: hash(password),
    aka: aka ?? prev?.aka ?? null,
    email: email ?? prev?.email ?? null,
    photo: photo ?? prev?.photo ?? null,
    role: role ? normalizeRole(role) : DEFAULT_ROLE,
    token: token || null,
    createdAt: new Date().toISOString(), remote: true,
  });
  write(USERS_KEY, users);
}

/**
 * Crea un usuario en el BACKEND (durable, multi-dispositivo) y lo cachea en
 * local. Si el servidor no responde, cae al modo local para no bloquear.
 * @returns {Promise<{ok, error?}>}
 */
export async function createUserAsync(name, password, color, invite, email) {
  const n = canonName(name);
  if (n.length < 2) return { ok: false, error: "El nombre debe tener al menos 2 caracteres." };
  if (!hasSurname(n)) return { ok: false, error: "Escribe tu NOMBRE y un APELLIDO (los dos)." };
  if (String(password || "").length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  if (!validEmail(email)) return { ok: false, error: "Pon un email válido para tenerte localizado." };
  const finalColor = color || nextFreeColor();
  try {
    const r = await remote.remoteRegister(n, password, finalColor, invite, email);
    if (!r || !r.ok) return { ok: false, error: r?.error || "No se pudo crear el usuario." };
    cacheUser(r.user.name, r.user.color, password, r.user.role, r.user.token, r.user.avatar, r.user.aka, r.user.email, r.user.photo);
    return { ok: true };
  } catch {
    // Sin red: el registro necesita servidor (email/aka/durabilidad). No caemos a local.
    return { ok: false, error: "Sin conexión: el registro necesita servidor. Inténtalo de nuevo." };
  }
}

/**
 * Inicia sesión. REMOTE-FIRST cuando hay red: el backend es la fuente de verdad
 * y, sobre todo, emite el TOKEN de sesión que el servidor exige para autorizar
 * escrituras (RBAC). Sin token no se puede mutar la mesa compartida, así que un
 * login solo-local no basta cuando hay conexión.
 *
 * - Servidor confirma → cachea cuenta + rol + token y deja sesión verificada.
 * - Servidor dice "no encontrado" → puede ser una cuenta SOLO local anterior al
 *   backend: se intenta entrar en local y se migra al servidor.
 * - Servidor rechaza (contraseña incorrecta) → manda el servidor (no se cae a
 *   una contraseña local obsoleta).
 * - Sin red → caché local (sin token; las escrituras esperan a recuperar sesión).
 * @returns {Promise<{ok, error?, user?}>}
 */
export async function loginAsync(name, password) {
  try {
    const r = await remote.remoteLogin(name, password);
    if (r && r.ok && r.user) {
      cacheUser(r.user.name, r.user.color, password, r.user.role, r.user.token, r.user.avatar, r.user.aka, r.user.email, r.user.photo);
      write(SESSION_KEY, { name: r.user.name, role: normalizeRole(r.user.role), token: r.user.token || null });
      return { ok: true, user: { name: r.user.name, color: r.user.color, role: normalizeRole(r.user.role) } };
    }
    // Servidor accesible pero sin esa cuenta: ¿cuenta solo-local de antes del
    // backend? Intenta local y, si entra, migra para volverla durable.
    if (r && /no encontrad/i.test(r.error || "")) {
      const local = login(name, password);
      if (local.ok) { migrateLocalUser(name, password); return local; }
    }
    // Otro rechazo del servidor (p. ej. contraseña incorrecta) es autoritativo.
    return { ok: false, error: (r && r.error) || "No se pudo iniciar sesión." };
  } catch {
    // Sin red: cae a la caché local (sin token de servidor).
    return login(name, password);
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
      if (t) {
        t.remote = true;
        // Si el registro devolvió rol/token (cuenta nueva en el servidor),
        // adóptalos para que la sesión quede verificada y pueda escribir.
        if (r.ok && r.user) {
          t.role = normalizeRole(r.user.role);
          if (r.user.token) {
            t.token = r.user.token;
            write(SESSION_KEY, { name: t.name, role: t.role, token: t.token });
          }
        }
        write(USERS_KEY, users);
      }
    }
  } catch { /* sin red: se migrará en el próximo login */ }
}

/** Trae los colores de firma de todas las cuentas y los mezcla en local, para
 *  teñir la actividad por autor de forma consistente entre dispositivos. */
export async function syncRemoteColors() {
  try {
    const list = await remote.remoteList(getToken());
    if (!Array.isArray(list) || !list.length) return;
    const users = getUsers();
    const byName = new Map(users.map((u) => [norm(u.name), u]));
    for (const r of list) {
      // Para un no-admin, el servidor entrega `name` = apodo (privacidad). Para
      // un admin, `name` es el real y `aka` el apodo. La app tiñe/identifica por
      // apodo, así que guardamos ambos.
      const ex = byName.get(norm(r.name)) || byName.get(norm(r.aka));
      if (ex) { ex.color = r.color; if (r.role) ex.role = normalizeRole(r.role); ex.avatar = r.avatar ?? null; ex.aka = r.aka ?? ex.aka ?? null; ex.photo = r.photo ?? null; if (r.email) ex.email = r.email; } // el servidor manda
      else users.push({ name: r.name, aka: r.aka ?? r.name, email: r.email ?? null, color: r.color, avatar: r.avatar ?? null, photo: r.photo ?? null, role: r.role ? normalizeRole(r.role) : undefined, colorOnly: true }); // para teñir/badge
    }
    write(USERS_KEY, users);
  } catch { /* best-effort */ }
}

/** Genera un código de invitación (solo admin). {ok, code?, error?} */
export async function createInvite(role) {
  const s = read(SESSION_KEY, null);
  if (!s?.token) return { ok: false, error: "Necesitas una sesión verificada (con token)." };
  try { return await remote.remoteCreateInvite(s.token, role || "editor"); }
  catch { return { ok: false, error: "Sin conexión para crear la invitación." }; }
}

/** Fija el avatar (emoji) del usuario en sesión. Server-first; cae a local. */
export async function setAvatar(avatar) {
  const av = String(avatar || "").trim().slice(0, 8);
  const s = read(SESSION_KEY, null);
  const users = getUsers();
  const u = s && users.find((x) => norm(x.name) === norm(s.name));
  if (u) { u.avatar = av || null; write(USERS_KEY, users); }
  try {
    if (s?.token) { const r = await remote.remoteSetAvatar(s.token, av); if (r && r.ok) return { ok: true, avatar: av }; }
  } catch { /* sin red: queda en local */ }
  return { ok: true, avatar: av, local: !s?.token };
}

export function logout() { storage.removeItem(SESSION_KEY); }

/** Usuario en sesión o null.
 *  `name` es el APODO (aka) — la identidad de trabajo en la app (firma, muelle,
 *  ecos), porque el equipo se ve entre sí por apodo (privacidad). `realName`
 *  guarda NOMBRE + APELLIDO para la vista de Equipo (solo admin). */
export function currentUser() {
  const s = read(SESSION_KEY, null);
  if (!s) return null;
  const u = getUsers().find((x) => norm(x.name) === norm(s.name));
  if (!u) return null;
  const aka = u.aka || firstName(u.name) || u.name;
  return {
    name: aka, aka, realName: u.name,
    email: u.email || null, color: u.color,
    avatar: u.avatar || null, photo: u.photo || null,
    role: normalizeRole(s.role || u.role || DEFAULT_ROLE),
  };
}

/** Rol del usuario en sesión (admin/editor/viewer/analyst). viewer si no hay sesión. */
export function currentRole() {
  const u = currentUser();
  return u ? u.role : "viewer";
}

/** Token de sesión opaco para autorizar mutaciones en el servidor. null si no hay. */
export function getToken() {
  const s = read(SESSION_KEY, null);
  return s ? (s.token || null) : null;
}

/**
 * Revalida la sesión contra el servidor (fuente de verdad del rol): si un admin
 * cambió tu rol, se refleja aquí. Best-effort; si no hay red, deja lo cacheado.
 * @returns {Promise<{ok:boolean, role?:string}>}
 */
export async function refreshSession() {
  const s = read(SESSION_KEY, null);
  if (!s || !s.token) return { ok: false };
  try {
    const r = await remote.remoteMe(s.token);
    if (r && r.ok && r.user) {
      const role = normalizeRole(r.user.role);
      write(SESSION_KEY, { ...s, role });
      const users = getUsers();
      const u = users.find((x) => norm(x.name) === norm(s.name));
      if (u) {
        u.role = role;
        if (r.user.color) u.color = r.user.color;
        if (r.user.aka !== undefined) u.aka = r.user.aka;
        if (r.user.email !== undefined) u.email = r.user.email;
        if (r.user.photo !== undefined) u.photo = r.user.photo;
        write(USERS_KEY, users);
      }
      return { ok: true, role };
    }
    return { ok: false };
  } catch { return { ok: false }; }
}

/** Cambia la contraseña del usuario en sesión. Actualiza también el hash local. */
export async function changePassword(newPassword) {
  const token = getToken();
  if (!token) return { ok: false, error: "Necesitas una sesión verificada (vuelve a entrar online)." };
  if (String(newPassword || "").length < 4) return { ok: false, error: "La contraseña debe tener al menos 4 caracteres." };
  try {
    const r = await remote.remoteSetPassword(token, newPassword);
    if (r && r.ok) {
      // Mantén coherente el hash local para que el login offline siga valiendo.
      const u = currentUser();
      if (u) {
        const users = getUsers();
        const me = users.find((x) => norm(x.name) === norm(u.name));
        if (me) { me.hash = hash(newPassword); write(USERS_KEY, users); }
      }
      return { ok: true };
    }
    return { ok: false, error: (r && r.error) || "No se pudo cambiar la contraseña." };
  } catch { return { ok: false, error: "Sin conexión con el servidor." }; }
}

/** Cambia el rol de otro usuario (solo admin; el servidor refuerza con 403). */
export async function setUserRole(targetName, role) {
  const token = getToken();
  if (!token) return { ok: false, error: "Necesitas una sesión verificada." };
  try {
    const r = await remote.remoteSetRole(token, targetName, role);
    if (r && r.ok) {
      // Refleja el cambio en la caché local para el badge.
      const users = getUsers();
      const u = users.find((x) => norm(x.name) === norm(targetName));
      if (u) { u.role = normalizeRole(role); write(USERS_KEY, users); }
      return { ok: true };
    }
    return { ok: false, error: (r && r.error) || "No se pudo cambiar el rol." };
  } catch { return { ok: false, error: "Sin conexión con el servidor." }; }
}

/** Color de un usuario por su identidad visible (apodo o, si acaso, nombre).
 *  La autoría se firma por APODO, así que buscamos primero por aka. */
export function colorOf(name) {
  const k = norm(name);
  const u = getUsers().find((x) => norm(x.aka) === k) || getUsers().find((x) => norm(x.name) === k);
  return u ? u.color : null;
}

/**
 * Edita el perfil del usuario en sesión: APODO (aka), EMAIL y/o FOTO. Server-first
 * (durable y visible para el equipo); refleja en local para la sesión actual.
 * Pasa solo los campos que quieras cambiar. @returns {Promise<{ok, error?}>}
 */
export async function setProfile({ aka, email, photo } = {}) {
  const token = getToken();
  if (!token) return { ok: false, error: "Necesitas una sesión verificada (vuelve a entrar online)." };
  if (aka !== undefined && canonName(aka).length < 2) return { ok: false, error: "El apodo debe tener al menos 2 caracteres." };
  if (email !== undefined && !validEmail(email)) return { ok: false, error: "Pon un email válido para tenerte localizado." };
  try {
    const r = await remote.remoteSetProfile(token, { aka, email, photo });
    if (!r || !r.ok) return { ok: false, error: (r && r.error) || "No se pudo guardar el perfil." };
    const s = read(SESSION_KEY, null);
    const users = getUsers();
    const me = s && users.find((x) => norm(x.name) === norm(s.name));
    if (me) {
      if (r.user.aka !== undefined) me.aka = r.user.aka;
      if (r.user.email !== undefined) me.email = r.user.email;
      if (r.user.photo !== undefined) me.photo = r.user.photo;
      write(USERS_KEY, users);
    }
    return { ok: true, user: r.user };
  } catch { return { ok: false, error: "Sin conexión con el servidor." }; }
}
