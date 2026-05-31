// =============================================================================
// growth.js — Desarrollo personal por trabajador (y por el CEO).
//
// La idea: cada persona tiene un perfil con dos caras.
//   - FORTALEZAS (pros / habilidades): lo que ya domina, con un nivel 1–5 que
//     sube a medida que crece. Se ven y se celebran.
//   - FRENOS ("perezas" / negativas): lo que le cuesta. Tienen un recorrido
//     open → working → closed. CERRAR un freno es el logro; al cerrarlo se puede
//     convertir en una NUEVA POTENCIA (nace una fortaleza). Así, limando frenos,
//     aparecen fuerzas nuevas según se desarrolla como profesional.
//
// Lógica pura: recibe un perfil, devuelve uno nuevo. El store guarda un perfil
// por dueño y lo sincroniza con el resto del estado compartido.
// =============================================================================

export const FRICTION_STATUS = ["open", "working", "closed"];
export const FRICTION_LABELS = { open: "Detectado", working: "En ello", closed: "Superado" };
export const MIN_LEVEL = 1, MAX_LEVEL = 5;

// Pensamiento crítico: pilar que SE VALORA y se potencia explícitamente. No es
// una habilidad más en la lista — tiene su propio nivel, sus retos y sus
// provocaciones. Cada reto registrado es un acto concreto de pensar mejor.
export const CRITICAL_KINDS = {
  assumption: "Supuesto cuestionado",
  contrarian: "Postura contraria defendida",
  evidence: "Evidencia exigida",
  decision: "Decisión re-examinada",
};
export const CRITICAL_KIND_KEYS = Object.keys(CRITICAL_KINDS);
export const CRITICAL_PROMPTS = [
  "¿Qué supuesto diste por bueno hoy sin comprobarlo?",
  "Defiende, en serio, la postura contraria a tu última decisión.",
  "¿Qué evidencia te haría cambiar de opinión? ¿La tienes?",
  "¿Qué diría el otro del equipo que estás pasando por alto?",
  "Si esto sale mal, ¿cuál será la causa más probable?",
  "¿Estás resolviendo el problema real o el más cómodo?",
  "¿Qué parte de tu plan no sobreviviría a una crítica honesta?",
];

let _seq = 0;
function uid(p) {
  _seq = (_seq + 1) % 1e6;
  const rnd = (typeof Math !== "undefined" ? Math.random() : 0).toString(36).slice(2, 7);
  return `${p}_${Date.now().toString(36)}${_seq.toString(36)}${rnd}`;
}
const nowIso = () => new Date().toISOString();
const clamp = (n) => Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.round(Number(n) || MIN_LEVEL)));

/** Perfil vacío para un dueño. */
export function emptyProfile(owner) {
  return { owner: String(owner || ""), strengths: [], frictions: [], critical: { level: 1, log: [] }, updatedAt: nowIso() };
}

const touch = (p) => ({ ...p, updatedAt: nowIso() });

// ---- Fortalezas -------------------------------------------------------------

export function addStrength(profile, label, level = 3, note = "") {
  const text = String(label || "").trim();
  if (!text) return profile;
  const s = { id: uid("str"), label: text, level: clamp(level), note: String(note || ""), at: nowIso(), bornFrom: null };
  return touch({ ...profile, strengths: [...(profile.strengths || []), s] });
}

export function setStrengthLevel(profile, id, level) {
  return touch({ ...profile, strengths: (profile.strengths || []).map((s) => (s.id === id ? { ...s, level: clamp(level) } : s)) });
}

export function removeStrength(profile, id) {
  return touch({ ...profile, strengths: (profile.strengths || []).filter((s) => s.id !== id) });
}

// ---- Frenos ("perezas") -----------------------------------------------------

export function addFriction(profile, label, note = "") {
  const text = String(label || "").trim();
  if (!text) return profile;
  const f = { id: uid("fri"), label: text, status: "open", note: String(note || ""), at: nowIso(), closedAt: null };
  return touch({ ...profile, frictions: [...(profile.frictions || []), f] });
}

export function setFrictionStatus(profile, id, status) {
  if (!FRICTION_STATUS.includes(status)) return profile;
  const frictions = (profile.frictions || []).map((f) =>
    f.id === id ? { ...f, status, closedAt: status === "closed" ? (f.closedAt || nowIso()) : null } : f);
  return touch({ ...profile, frictions });
}

/** Avanza el recorrido: open → working → closed (cíclico se detiene en closed). */
export function advanceFriction(profile, id) {
  const f = (profile.frictions || []).find((x) => x.id === id);
  if (!f) return profile;
  const i = FRICTION_STATUS.indexOf(f.status);
  const next = FRICTION_STATUS[Math.min(i + 1, FRICTION_STATUS.length - 1)];
  return setFrictionStatus(profile, id, next);
}

export function removeFriction(profile, id) {
  return touch({ ...profile, frictions: (profile.frictions || []).filter((f) => f.id !== id) });
}

/**
 * Cierra un freno y lo convierte en una NUEVA POTENCIA: marca el freno como
 * superado y nace una fortaleza (nivel 2 por defecto, con trazo de su origen).
 */
export function closeFrictionToStrength(profile, frictionId, strengthLabel, level = 2) {
  const f = (profile.frictions || []).find((x) => x.id === frictionId);
  if (!f) return profile;
  let p = setFrictionStatus(profile, frictionId, "closed");
  const label = String(strengthLabel || "").trim() || `Superé: ${f.label}`;
  const s = { id: uid("str"), label, level: clamp(level), note: "", at: nowIso(), bornFrom: f.label };
  return touch({ ...p, strengths: [...(p.strengths || []), s] });
}

// ---- Pensamiento crítico ----------------------------------------------------

const crit = (p) => (p && p.critical) || { level: 1, log: [] };

/**
 * Registra un reto de pensamiento crítico (un acto concreto: cuestionar un
 * supuesto, defender la contraria, exigir evidencia, re-examinar una decisión).
 * El nivel sube con la práctica sostenida: cada 3 retos, un punto (máx 5), y
 * nunca baja por debajo del alcanzado.
 */
export function logCritical(profile, { kind = "assumption", note = "" } = {}) {
  const c = crit(profile);
  const k = CRITICAL_KIND_KEYS.includes(kind) ? kind : "assumption";
  const entry = { id: uid("crit"), at: nowIso(), kind: k, note: String(note || "").trim() };
  const log = [entry, ...(c.log || [])];
  const earned = clamp(1 + Math.floor(log.length / 3));
  return touch({ ...profile, critical: { level: Math.max(c.level || 1, earned), log } });
}

export function setCriticalLevel(profile, level) {
  const c = crit(profile);
  return touch({ ...profile, critical: { ...c, level: clamp(level) } });
}

export function removeCritical(profile, id) {
  const c = crit(profile);
  return touch({ ...profile, critical: { ...c, log: (c.log || []).filter((e) => e.id !== id) } });
}

export function criticalSummary(profile) {
  const c = crit(profile);
  const log = c.log || [];
  const days = new Set(log.map((e) => String(e.at).slice(0, 10)));
  return { level: c.level || 1, total: log.length, days: days.size };
}

// Provocación del día: rota de forma estable (no cambia en cada render).
export function criticalPrompt(seed = new Date()) {
  const day = Math.floor((seed instanceof Date ? seed.getTime() : Number(seed) || 0) / 86400000);
  return CRITICAL_PROMPTS[((day % CRITICAL_PROMPTS.length) + CRITICAL_PROMPTS.length) % CRITICAL_PROMPTS.length];
}

// Reto SEMANAL del equipo: la misma provocación para todos durante la semana
// (índice por semana, ALINEADO A LUNES), para pensar críticamente sobre lo
// mismo en común. (Día 0 de la época es jueves; −4 mueve el corte al lunes.)
export function weeklyCriticalPrompt(seed = new Date()) {
  const days = Math.floor((seed instanceof Date ? seed.getTime() : Number(seed) || 0) / 86400000);
  const week = Math.floor((days - 4) / 7);
  return CRITICAL_PROMPTS[((week % CRITICAL_PROMPTS.length) + CRITICAL_PROMPTS.length) % CRITICAL_PROMPTS.length];
}

// ---- Resumen / visualización ------------------------------------------------

export function summary(profile) {
  const strengths = (profile?.strengths || []);
  const frictions = (profile?.frictions || []);
  const avgLevel = strengths.length
    ? Math.round((strengths.reduce((s, x) => s + (x.level || 0), 0) / strengths.length) * 10) / 10
    : 0;
  const open = frictions.filter((f) => f.status === "open").length;
  const working = frictions.filter((f) => f.status === "working").length;
  const closed = frictions.filter((f) => f.status === "closed").length;
  // Impulso: proporción de frenos ya superados (0–100). El progreso hecho visible.
  const momentum = frictions.length ? Math.round((closed / frictions.length) * 100) : 0;
  const critical = criticalSummary(profile);
  return { strengths: strengths.length, avgLevel, open, working, closed, momentum, critical };
}
