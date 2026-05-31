// =============================================================================
// macma.js — MACMA CORE · capa de datos. El sistema operativo humano.
//
// No gestiona clientes ni tareas: gestiona al operador. Guarda, de forma
// PRIVADA y por usuario, la materia prima de una persona — su biografía, los
// conflictos que describe, los retos que cumple — para que el motor (macma-
// engine.js) la lea y devuelva un modelo operativo: no un juicio, un espejo.
//
// Privacidad primero: a diferencia del Muelle (posits compartidos del equipo),
// lo de MACMA es íntimo. NO viaja por la sincronización compartida de Connect —
// vive en localStorage de este navegador, separado por usuario. El día que haya
// servidor, cada fila será privada por usuario (RLS), nunca visible al equipo.
// Ver supabase/macma-schema.sql para el destino.
//
// Sin DOM, sin auth: todo lo de fuera entra por parámetro (`user`). Así el motor
// y la capa de datos son testeables en Node, igual que store.js y posits.js.
//
// El día que llegue la IA: estas funciones son el único punto de cambio. La
// forma de los datos ya está pensada para que una generación por IA (puntuar la
// biografía, analizar un conflicto, proponer el reto) sustituya a la heurística
// sin tocar la UI. Los puntos de integración están marcados con // [IA].
// =============================================================================

// Almacenamiento tolerante: igual que store.js, cae a memoria en Node (tests).
const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : {
        getItem: (k) => (mem.has(k) ? mem.get(k) : null),
        setItem: (k, v) => mem.set(k, String(v)),
        removeItem: (k) => mem.delete(k),
      };

const NS = "oi:macma:";
const PROFILE_KEY = `${NS}profile`; // { [user]: { ...perfil } }
const BIO_KEY = `${NS}bios`; // { [user]: [ ...entradas ] }
const CONFLICT_KEY = `${NS}conflicts`; // { [user]: [ ...conflictos ] }
const CHALLENGE_KEY = `${NS}challenges`; // { [user]: [ ...retos diarios ] }

function read(key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* cuota / modo privado — fallo silencioso, no es crítico */
  }
}

// Clave estable por usuario: normaliza el nombre (igual criterio que auth.js).
function keyOf(user) {
  return String(user || "").trim().toLowerCase() || "_";
}
function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
const now = () => new Date().toISOString();

// Lee/escribe la colección de un usuario dentro del mapa { [user]: T }.
function readUser(key, user, fallback) {
  const all = read(key, {});
  const v = all[keyOf(user)];
  return v === undefined ? fallback : v;
}
function writeUser(key, user, value) {
  const all = read(key, {});
  all[keyOf(user)] = value;
  write(key, all);
}

// ---- Perfil -----------------------------------------------------------------
// El perfil es el contenedor. No se rellena con un formulario: se construye con
// la historia. Aquí solo guardamos metadatos (cuándo nació, si la voz está
// enlazada). El modelo (puntuaciones, patrones) lo deriva el motor en vivo.
export function getProfile(user) {
  return readUser(PROFILE_KEY, user, null);
}
export function ensureProfile(user) {
  let p = getProfile(user);
  if (!p) {
    p = { user: String(user || ""), createdAt: now(), updatedAt: now(), voiceLinked: false };
    writeUser(PROFILE_KEY, user, p);
  }
  return p;
}
export function touchProfile(user) {
  const p = ensureProfile(user);
  p.updatedAt = now();
  writeUser(PROFILE_KEY, user, p);
  return p;
}
export function setVoiceLinked(user, linked) {
  const p = ensureProfile(user);
  p.voiceLinked = !!linked;
  p.updatedAt = now();
  writeUser(PROFILE_KEY, user, p);
  return p;
}

// ---- Biografía --------------------------------------------------------------
// La materia prima. Cada entrada es un fragmento de vida con un ÁNGULO (kind):
// no "rellena tu perfil" sino "cuéntame una vez que fracasaste". Texto o voz.
// El catálogo de ángulos guía sin encorsetar — siempre hay un "Libre".
export const BIO_ANGLES = [
  { kind: "life-event", label: "Un momento que te marcó", prompt: "Cuenta un acontecimiento que cambió tu forma de operar. ¿Qué pasó y qué se rompió o se abrió en ti?" },
  { kind: "failure", label: "Un fracaso", prompt: "Describe algo que salió mal y del que aprendiste. No la versión de LinkedIn: la real." },
  { kind: "success", label: "Un logro", prompt: "Cuenta algo que construiste o conseguiste. ¿Qué hiciste tú que otro no habría hecho?" },
  { kind: "relationship", label: "Una relación clave", prompt: "Habla de una relación (socio, mentor, equipo) que te formó. ¿Qué te enseñó sobre ti?" },
  { kind: "leadership", label: "Liderar bajo presión", prompt: "Una vez que tuviste que liderar cuando todo apretaba. ¿Cómo reaccionaste?" },
  { kind: "fear", label: "Un miedo", prompt: "¿Qué te frena de verdad? El que casi no se dice en voz alta." },
  { kind: "ambition", label: "Una ambición", prompt: "¿Hacia dónde vas? No el objetivo trimestral — la dirección de fondo." },
  { kind: "free", label: "Libre", prompt: "Lo que quieras contar de ti. Tu voz, sin guion." },
];
export const ANGLE_BY_KIND = Object.fromEntries(BIO_ANGLES.map((a) => [a.kind, a]));

/** Entradas de biografía de un usuario, de la más reciente a la más antigua.
 *  Se invierte primero (último insertado al frente) y luego se ordena estable por
 *  fecha: así dos entradas del mismo milisegundo conservan el orden de inserción. */
export function getBios(user) {
  return readUser(BIO_KEY, user, [])
    .slice()
    .reverse()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}
/** Añade una entrada de biografía. source: "text" | "voice". */
export function addBio(user, { kind = "free", prompt = "", text, source = "text" }) {
  const clean = String(text || "").trim();
  if (!clean) return null;
  const entry = {
    id: uid("bio"),
    user: String(user || ""),
    kind,
    prompt: prompt || ANGLE_BY_KIND[kind]?.prompt || "",
    text: clean,
    source,
    createdAt: now(),
  };
  const all = readUser(BIO_KEY, user, []);
  all.push(entry);
  writeUser(BIO_KEY, user, all);
  touchProfile(user);
  return entry;
}
export function removeBio(user, id) {
  writeUser(BIO_KEY, user, readUser(BIO_KEY, user, []).filter((b) => b.id !== id));
  touchProfile(user);
}

// ---- Conflictos -------------------------------------------------------------
// El usuario describe un conflicto (socio, equipo, liderazgo) y el motor le
// devuelve estructura — hechos vs supuestos, motores emocionales vs operativos,
// una conversación y una acción. Guardamos el texto y el análisis devuelto.
export function getConflicts(user) {
  return readUser(CONFLICT_KEY, user, [])
    .slice()
    .reverse()
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}
/** Guarda un conflicto con su análisis (lo genera macma-engine; aquí persiste). */
export function addConflict(user, { title = "", text, analysis = null }) {
  const clean = String(text || "").trim();
  if (!clean) return null;
  const entry = {
    id: uid("cf"),
    user: String(user || ""),
    title: String(title || "").trim(),
    text: clean,
    analysis, // forma estable; el día de mañana lo rellena la IA. // [IA]
    createdAt: now(),
  };
  const all = readUser(CONFLICT_KEY, user, []);
  all.push(entry);
  writeUser(CONFLICT_KEY, user, all);
  touchProfile(user);
  return entry;
}
export function removeConflict(user, id) {
  writeUser(CONFLICT_KEY, user, readUser(CONFLICT_KEY, user, []).filter((c) => c.id !== id));
}

// ---- Evolución diaria -------------------------------------------------------
// Un reto al día. No diez. Uno. Lo elige el motor (determinista por usuario+día,
// sesgado al cuello de botella actual). Aquí solo guardamos el registro: qué reto
// tocó cada día y si se cumplió. El cumplimiento alimenta la constancia.
export function getChallengeLog(user) {
  return readUser(CHALLENGE_KEY, user, []);
}
/** Registra (idempotente por día) el reto que toca hoy. date = "YYYY-MM-DD". */
export function recordChallenge(user, date, { text, dimension }) {
  const log = readUser(CHALLENGE_KEY, user, []);
  let entry = log.find((e) => e.date === date);
  if (!entry) {
    entry = { id: uid("ch"), date, text, dimension, doneAt: null };
    log.push(entry);
    writeUser(CHALLENGE_KEY, user, log);
  }
  return entry;
}
/** Marca el reto de un día como cumplido (o lo revierte). */
export function setChallengeDone(user, date, done = true) {
  const log = readUser(CHALLENGE_KEY, user, []);
  const entry = log.find((e) => e.date === date);
  if (!entry) return null;
  entry.doneAt = done ? now() : null;
  writeUser(CHALLENGE_KEY, user, log);
  touchProfile(user);
  return entry;
}
/** Racha de días consecutivos con el reto cumplido, terminando hoy o ayer. */
export function challengeStreak(user) {
  const done = new Set(getChallengeLog(user).filter((e) => e.doneAt).map((e) => e.date));
  if (!done.size) return 0;
  const dayStr = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const start = done.has(dayStr(today)) ? today : new Date(today.getTime() - 86400000);
  if (!done.has(dayStr(start))) return 0;
  let n = 0;
  const cursor = new Date(start);
  while (done.has(dayStr(cursor))) { n++; cursor.setDate(cursor.getDate() - 1); }
  return n;
}

// ---- Señales de completitud (para la UI, no para juzgar) --------------------
// Cuánta materia prima hay. No es una nota: es cuánto puede "ver" el espejo.
export function corpus(user) {
  const bios = getBios(user);
  const words = bios.reduce((n, b) => n + String(b.text || "").trim().split(/\s+/).filter(Boolean).length, 0);
  const kinds = new Set(bios.map((b) => b.kind));
  return { entries: bios.length, words, angles: kinds.size, conflicts: getConflicts(user).length };
}

// ---- Reset (solo de este usuario, local) ------------------------------------
export function resetUser(user) {
  for (const key of [PROFILE_KEY, BIO_KEY, CONFLICT_KEY, CHALLENGE_KEY]) {
    const all = read(key, {});
    delete all[keyOf(user)];
    write(key, all);
  }
}
