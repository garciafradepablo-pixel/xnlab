// =============================================================================
// store.js — Persistence + the learning loop.
//
// Everything operational (call status, notes, post-call outcomes) is kept in
// localStorage keyed by opportunity id, so it survives reloads without a
// backend. The learning loop records call outcomes the scoring engine can
// later use to calibrate weights (see applyLearning()).
//
// In a live system, swap the localStorage functions for API calls — the shape
// of the records does not change.
// =============================================================================

import { deriveCalibration, deriveSuccessCalibration } from "./calibration.js";
import { currentUser, currentRole, getToken } from "./auth.js";
import { can } from "./roles.js";
import * as statesync from "./statesync.js";

const NS = "oi:"; // namespace
const TRACK_KEY = `${NS}tracking`;
const LEARN_KEY = `${NS}learning`;
const CONFIG_KEY = `${NS}config`;
const VERIFY_KEY = `${NS}verify`;
const USER_LEADS_KEY = `${NS}userLeads`;
const TASKS_KEY = `${NS}tasks`; // tareas del equipo (quién hace qué), compartidas
const USER_KEY = `${NS}who`; // quién trabaja (Javi / Pablo / …)
const REV_KEY = `${NS}rev`; // revisión del documento compartido (control optimista)

// Graceful no-op storage when localStorage is unavailable (e.g. Node tests).
const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : {
        getItem: (k) => (mem.has(k) ? mem.get(k) : null),
        setItem: (k, v) => mem.set(k, v),
        removeItem: (k) => mem.delete(k),
      };

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
    /* quota / private mode — fail silent, demo is non-critical */
  }
}

// =============================================================================
// Estado compartido (Supabase) — la mesa de trabajo común de Pablo y Javi.
//
// localStorage sigue siendo la caché/offline; el servidor es la fuente durable.
// El estado solo se sincroniza cuando se ARRANCA explícitamente (startSharedSync,
// tras iniciar sesión). En tests/CLI no se arranca → cero red, comportamiento
// idéntico al anterior. Capa remota inyectable para tests.
// =============================================================================

let remote = statesync;
export function __setStateRemote(r) { remote = r; } // tests

let syncEnabled = false;
let pushTimer = null;
let pushInFlight = false;
let pushAgain = false;

// Estado visible para la UI: "idle" | "syncing" | "synced" | "offline" | "local".
let syncState = "idle";
const syncListeners = new Set();
export function getSyncState() { return syncState; }
export function onSyncState(cb) { syncListeners.add(cb); return () => syncListeners.delete(cb); }
function setSync(s) {
  if (s === syncState) return;
  syncState = s;
  for (const cb of syncListeners) { try { cb(s); } catch { /* */ } }
}

function getRev() { return Number(read(REV_KEY, 0)) || 0; }
function setRev(r) { write(REV_KEY, Number(r) || 0); }

/** Documento compartido = exactamente lo que serializa exportState(). */
function snapshot() { return JSON.parse(exportState()); }

/**
 * Arranca la sincronización compartida: trae el documento del servidor, lo
 * fusiona con lo local (no destructivo) y sube de vuelta lo que solo existía en
 * este navegador (migración desde localStorage). Idempotente y seguro.
 * @returns {Promise<{ok:boolean, error?:string}>}
 */
export async function startSharedSync() {
  syncEnabled = true;
  return pullSharedState();
}
export function stopSharedSync() {
  syncEnabled = false;
  if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
}
export function isSyncEnabled() { return syncEnabled; }

/** Trae y fusiona el estado compartido en local. Luego sube lo local-only. */
export async function pullSharedState() {
  setSync("syncing");
  try {
    const r = await remote.remoteLoadState(getToken());
    if (r && r.ok) {
      if (r.data) {
        importState(r.data, { replace: false }); // newest-per-entity wins
        // Config compartida: adóptala solo si aquí no había una guardada (no pisa
        // ajustes locales deliberados).
        if (r.data.config && getSavedConfig(null) == null) saveConfig(r.data.config);
      }
      setRev(r.rev || 0);
      // Migración: sube lo que solo estaba en este navegador, SOLO si tu rol
      // puede escribir. Un viewer/analyst carga y mira, pero no empuja nada.
      if (can(currentRole(), "write")) await pushSharedState();
      else setSync("synced");
      return { ok: true };
    }
    setSync("local");
    return { ok: false, error: (r && r.error) || "sin respuesta" };
  } catch {
    setSync("offline");
    return { ok: false, error: "offline" };
  }
}

/**
 * Sube el estado local al servidor con control optimista por `rev`. Si hay
 * conflicto (otro escribió antes), re-fusiona lo del servidor y reintenta una
 * vez. Nunca pisa ciegamente.
 *
 * El servidor exige rol con permiso de escritura (admin/editor); si no, 403.
 * Aquí cortamos antes por UX (sin gastar una llamada) pero el servidor es la
 * autoridad. @returns {Promise<{ok:boolean, conflict?:boolean, error?:string}>}
 */
export async function pushSharedState() {
  // Guarda local de cortesía: un rol sin escritura no intenta subir.
  if (!can(currentRole(), "write")) { setSync("synced"); return { ok: false, error: "rol sin permiso de escritura" }; }
  setSync("syncing");
  try {
    let r = await remote.remoteSaveState(snapshot(), getRev(), getToken());
    if (r && r.conflict) {
      if (r.data) importState(r.data, { replace: false });
      setRev(r.rev || 0);
      r = await remote.remoteSaveState(snapshot(), getRev(), getToken());
    }
    if (r && r.ok) { setRev(r.rev || 0); setSync("synced"); return { ok: true }; }
    // 403/401: el servidor rechazó por permiso/sesión. No es "offline".
    setSync("local");
    return { ok: false, conflict: !!(r && r.conflict), error: (r && r.error) || "no guardado" };
  } catch {
    setSync("offline");
    return { ok: false, error: "offline" };
  }
}

/** Programa una subida con rebote: agrupa ráfagas de cambios en una escritura. */
function scheduleSync() {
  if (!syncEnabled) return; // off en tests/CLI → cero red
  if (pushInFlight) { pushAgain = true; return; }
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(runScheduledPush, 800);
  // No mantener vivo el event loop por un timer pendiente (Node).
  if (pushTimer && typeof pushTimer.unref === "function") pushTimer.unref();
}
async function runScheduledPush() {
  pushTimer = null;
  pushInFlight = true;
  try { await pushSharedState(); }
  finally {
    pushInFlight = false;
    if (pushAgain) { pushAgain = false; scheduleSync(); }
  }
}

// ---- Per-opportunity operational tracking -----------------------------------

/** @returns {Object<string, TrackingRecord>} */
export function getTracking() {
  return read(TRACK_KEY, {});
}

/**
 * @typedef {Object} TrackingRecord
 * @property {string} status   One of models.CALL_STATUSES
 * @property {string} notes    Free-text notes after calls
 * @property {string} updatedAt ISO timestamp
 */

// ---- Quién trabaja (atribución de actividad) --------------------------------
// La autoría sale del usuario en sesión (auth.js). Si no hay sesión, cae al
// nombre suelto guardado (compatibilidad) o vacío.
export function getWho() {
  const u = currentUser();
  if (u) return u.name;
  return read(USER_KEY, "") || "";
}
export function setWho(name) {
  write(USER_KEY, String(name || "").trim());
  return getWho();
}

export function getRecord(id) {
  const all = getTracking();
  return all[id] || { status: "not_called", notes: "", updatedAt: null, by: null };
}

export function setStatus(id, status) {
  const all = getTracking();
  all[id] = { ...getRecord(id), status, updatedAt: new Date().toISOString(), by: getWho() || null };
  write(TRACK_KEY, all);
  scheduleSync();
  return all[id];
}

export function setNotes(id, notes) {
  const all = getTracking();
  all[id] = { ...getRecord(id), notes, updatedAt: new Date().toISOString(), by: getWho() || null };
  write(TRACK_KEY, all);
  scheduleSync();
  return all[id];
}

// ---- Tareas del equipo (quién hace qué) -------------------------------------
// Colección compartida más: lista de tareas con autor y responsable. Mutar
// cualquiera dispara la subida con rebote (scheduleSync), igual que el tracking.

/** @returns {Array} todas las tareas del equipo. */
export function getTasks() {
  const list = read(TASKS_KEY, []);
  return Array.isArray(list) ? list : [];
}

/** Inserta o reemplaza una tarea por id (sella `updatedAt`). */
export function upsertTask(task) {
  if (!task || !task.id) return null;
  const list = getTasks().filter((t) => t.id !== task.id);
  const sealed = { ...task, updatedAt: new Date().toISOString() };
  list.push(sealed);
  write(TASKS_KEY, list);
  scheduleSync();
  return sealed;
}

/** Cambia el estado de una tarea (por hacer / haciendo / hecho). */
export function setTaskStatus(id, status) {
  const list = getTasks();
  const t = list.find((x) => x.id === id);
  if (!t) return null;
  t.status = status;
  t.updatedAt = new Date().toISOString();
  write(TASKS_KEY, list);
  scheduleSync();
  return t;
}

/** Borra una tarea por id. */
export function removeTask(id) {
  const list = getTasks();
  const next = list.filter((t) => t.id !== id);
  if (next.length === list.length) return false;
  write(TASKS_KEY, next);
  scheduleSync();
  return true;
}

// ---- The learning loop ------------------------------------------------------

/**
 * @typedef {Object} CallOutcome
 * @property {string} id              Opportunity id
 * @property {string} outcome         e.g. "meeting_booked", "rejected"
 * @property {string} objection       The objection actually raised
 * @property {string} whatWorked
 * @property {string} whatFailed
 * @property {boolean} hypothesisCorrect  Was our main hypothesis right?
 * @property {string} nextAction
 * @property {string} createdAt
 */

/** @returns {CallOutcome[]} */
export function getLearning() {
  return read(LEARN_KEY, []);
}

export function addOutcome(outcome) {
  const log = getLearning();
  log.push({ ...outcome, createdAt: new Date().toISOString() });
  write(LEARN_KEY, log);
  scheduleSync();
  return log;
}

// Estados decisivos que enseñan al modelo (éxito o fallo claros).
const DECISIVE = new Set(["interested", "meeting_booked", "won", "rejected", "wrong_fit"]);

/**
 * Aprende del CRM: registra (o actualiza) UN resultado automático por lead a
 * partir de su cambio de estado. Marcado `source:"crm"` y upsert por id para
 * que cambiar el estado varias veces no infle el log con duplicados.
 *
 * Estados no decisivos (sin llamar, llamado, no contesta, seguimiento) retiran
 * el resultado automático previo: aún no hay veredicto que aprender.
 */
export function recordStatusOutcome(id, status, meta = {}) {
  const log = getLearning().filter((o) => !(o.source === "crm" && o.id === id));
  if (DECISIVE.has(status)) {
    log.push({
      id,
      source: "crm",
      outcome: status,
      classification: meta.classification || null,
      sector: meta.sector || null, // para aprender qué nichos cierran mejor
      signals: meta.signals || null,
      // Predicción del motor en el momento de la llamada, para calibrar el
      // Índice de Éxito contra la realidad (lo que de verdad cierra).
      successIndexAtCall: typeof meta.successIndex === "number" ? meta.successIndex : null,
      hypothesisCorrect: status === "interested" || status === "meeting_booked",
      by: getWho() || null,
      createdAt: new Date().toISOString(),
    });
  }
  write(LEARN_KEY, log);
  scheduleSync();
  return log;
}

/**
 * Derive simple calibration hints from the outcome log. This is intentionally
 * conservative: it reports observed conversion by classification and by
 * dominant tension, and suggests directional weight nudges — it does NOT
 * silently mutate the engine. A human applies the nudge.
 *
 * @param {CallOutcome[]} [log]
 * @returns {{ sampleSize:number, hypothesisAccuracy:number|null,
 *   meetingRateByClass:Object, topObjections:Array, notes:string[] }}
 */
export function applyLearning(log = getLearning()) {
  const sampleSize = log.length;
  if (!sampleSize) {
    return {
      sampleSize: 0,
      hypothesisAccuracy: null,
      meetingRateByClass: {},
      topObjections: [],
      notes: ["No call outcomes recorded yet — learning loop is empty."],
    };
  }

  const correct = log.filter((o) => o.hypothesisCorrect).length;
  const hypothesisAccuracy = Math.round((correct / sampleSize) * 100);

  const byClass = {};
  for (const o of log) {
    const cls = o.classification || "unknown";
    byClass[cls] = byClass[cls] || { total: 0, meetings: 0 };
    byClass[cls].total++;
    if (o.outcome === "meeting_booked") byClass[cls].meetings++;
  }
  const meetingRateByClass = Object.fromEntries(
    Object.entries(byClass).map(([k, v]) => [
      k,
      { ...v, rate: Math.round((v.meetings / v.total) * 100) },
    ])
  );

  const objCounts = {};
  for (const o of log) {
    if (!o.objection) continue;
    objCounts[o.objection] = (objCounts[o.objection] || 0) + 1;
  }
  const topObjections = Object.entries(objCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([objection, count]) => ({ objection, count }));

  const notes = [];
  if (hypothesisAccuracy < 50)
    notes.push(
      "Hypothesis accuracy below 50% — tighten evidence requirements before shortlisting."
    );
  if (hypothesisAccuracy >= 75)
    notes.push("Hypothesis accuracy high — current filters are well calibrated.");

  return {
    sampleSize,
    hypothesisAccuracy,
    meetingRateByClass,
    topObjections,
    notes,
  };
}

// ---- Calibration (the loop that actually changes scoring) -------------------

/**
 * Per-filter weight multipliers derived from the call log, ready to drop into a
 * scoring config as `weightMultipliers`. Returns the full calibration object so
 * the UI can also show what changed and why.
 */
export function getCalibration() {
  return deriveCalibration(getLearning());
}

/** Calibración del Índice de Éxito desde los resultados reales de llamadas. */
export function getSuccessCalibration() {
  return deriveSuccessCalibration(getLearning());
}

// ---- Portability: export / import the operational state ---------------------
//
// The whole point of closing the loop across people: Pablo calls five leads,
// exports the log, Javi imports it, and the scoring they both see reflects all
// the calls. localStorage is per-browser; this makes the state a shareable file.

const PORTABLE_VERSION = 1;

/** Serialise tracking + outcomes (+ config) to a shareable JSON string. */
export function exportState() {
  return JSON.stringify(
    {
      _format: "opportunity-intel/state",
      _version: PORTABLE_VERSION,
      exportedAt: new Date().toISOString(),
      tracking: getTracking(),
      learning: getLearning(),
      verifications: getVerifications(),
      userLeads: getUserLeads(),
      tasks: getTasks(),
      config: read(CONFIG_KEY, null),
    },
    null,
    2
  );
}

/**
 * Merge an exported state back in. Non-destructive by default:
 *   - outcomes are appended and de-duplicated (by id+createdAt+outcome)
 *   - tracking records are merged, newest `updatedAt` winning per lead
 * Pass { replace: true } to overwrite instead of merge.
 *
 * @returns {{ ok:boolean, error?:string, addedOutcomes:number, mergedTracking:number }}
 */
export function importState(json, { replace = false } = {}) {
  let data;
  try {
    data = typeof json === "string" ? JSON.parse(json) : json;
  } catch {
    return { ok: false, error: "Not valid JSON.", addedOutcomes: 0, mergedTracking: 0 };
  }
  if (!data || data._format !== "opportunity-intel/state") {
    return {
      ok: false,
      error: "Unrecognised file — not an Opportunity Intelligence state export.",
      addedOutcomes: 0,
      mergedTracking: 0,
    };
  }

  // --- outcomes ---
  const incomingLog = Array.isArray(data.learning) ? data.learning : [];
  let addedOutcomes = 0;
  if (replace) {
    write(LEARN_KEY, incomingLog);
    addedOutcomes = incomingLog.length;
  } else {
    const existing = getLearning();
    const seen = new Set(existing.map(outcomeKey));
    for (const o of incomingLog) {
      if (seen.has(outcomeKey(o))) continue;
      seen.add(outcomeKey(o));
      existing.push(o);
      addedOutcomes++;
    }
    write(LEARN_KEY, existing);
  }

  // --- tracking ---
  const incomingTracking = data.tracking && typeof data.tracking === "object" ? data.tracking : {};
  let mergedTracking = 0;
  if (replace) {
    write(TRACK_KEY, incomingTracking);
    mergedTracking = Object.keys(incomingTracking).length;
  } else {
    const cur = getTracking();
    for (const [id, rec] of Object.entries(incomingTracking)) {
      const existing = cur[id];
      // newest update wins
      if (!existing || (rec.updatedAt || "") > (existing.updatedAt || "")) {
        cur[id] = rec;
        mergedTracking++;
      }
    }
    write(TRACK_KEY, cur);
  }

  // --- verifications (merge por lead+filtro, lo más reciente gana) ---
  const incomingVerif = data.verifications && typeof data.verifications === "object" ? data.verifications : {};
  if (replace) {
    write(VERIFY_KEY, incomingVerif);
  } else {
    const cur = getVerifications();
    for (const [id, list] of Object.entries(incomingVerif)) {
      const byFilter = new Map((cur[id] || []).map((v) => [v.filter, v]));
      for (const v of list) {
        const ex = byFilter.get(v.filter);
        if (!ex || (v.at || "") > (ex.at || "")) byFilter.set(v.filter, v);
      }
      cur[id] = [...byFilter.values()];
    }
    write(VERIFY_KEY, cur);
  }

  // --- userLeads (merge por id) ---
  const incomingLeads = Array.isArray(data.userLeads) ? data.userLeads : [];
  let addedLeads = 0;
  if (replace) {
    write(USER_LEADS_KEY, incomingLeads);
    addedLeads = incomingLeads.length;
  } else {
    const byId = new Map(getUserLeads().map((l) => [l.id, l]));
    for (const l of incomingLeads) {
      if (!byId.has(l.id)) addedLeads++;
      byId.set(l.id, l);
    }
    write(USER_LEADS_KEY, [...byId.values()]);
  }

  // --- tasks (merge por id, lo más reciente por updatedAt gana) ---
  const incomingTasks = Array.isArray(data.tasks) ? data.tasks : [];
  if (replace) {
    write(TASKS_KEY, incomingTasks);
  } else {
    const byId = new Map(getTasks().map((t) => [t.id, t]));
    for (const t of incomingTasks) {
      if (!t || !t.id) continue;
      const ex = byId.get(t.id);
      if (!ex || (t.updatedAt || "") > (ex.updatedAt || "")) byId.set(t.id, t);
    }
    write(TASKS_KEY, [...byId.values()]);
  }

  return { ok: true, addedOutcomes, mergedTracking, addedLeads };
}

function outcomeKey(o) {
  return `${o.id}|${o.createdAt || ""}|${o.outcome || ""}`;
}

// ---- Config persistence -----------------------------------------------------

export function getSavedConfig(fallback) {
  return read(CONFIG_KEY, fallback);
}
export function saveConfig(config) {
  write(CONFIG_KEY, config);
  scheduleSync();
}

// ---- Verificaciones manuales (cierra huecos grises con evidencia citada) ----
//
// El analista revisa la web/reseñas de un lead y confirma un hueco: marca el
// filtro como verde/amarillo y añade una nota que CUENTA como evidencia citada
// (fuente = el analista, url = lo que miró). Así sube la puntuación SIN inventar
// nada — la verificación es real y queda registrada con autor y fecha.

/** @returns {Object<string, Array>} verificaciones por id de lead. */
export function getVerifications() {
  return read(VERIFY_KEY, {});
}

/** Verificaciones de un lead concreto. */
export function getLeadVerifications(id) {
  return getVerifications()[id] || [];
}

/**
 * Registra una verificación manual de un filtro.
 * @param {string} id      id del lead
 * @param {string} filter  clave del filtro (models.FILTER_KEYS)
 * @param {"green"|"yellow"|"red"} level  veredicto tras revisar
 * @param {string} note    qué se observó
 * @param {string} [url]   qué se miró (web/reseñas) — sirve de cita
 */
export function addVerification(id, filter, level, note, url, meta = {}) {
  const all = getVerifications();
  const list = (all[id] || []).filter((v) => v.filter !== filter); // upsert por filtro
  list.push({
    filter, level, note: note || "",
    url: url || null,
    by: meta.by || getWho() || "analista",
    // Origen: una verificación manual (analista) o una lectura automática (web).
    auto: !!meta.auto,
    srcLabel: meta.srcLabel || null,
    at: new Date().toISOString(),
  });
  all[id] = list;
  write(VERIFY_KEY, all);
  scheduleSync();
  return list;
}

export function removeVerification(id, filter) {
  const all = getVerifications();
  if (!all[id]) return;
  all[id] = all[id].filter((v) => v.filter !== filter);
  if (!all[id].length) delete all[id];
  write(VERIFY_KEY, all);
  scheduleSync();
}

/**
 * Aplica las verificaciones manuales sobre un lead: sobrescribe las señales
 * confirmadas y añade su nota como evidencia citada. Devuelve un lead NUEVO
 * (no muta) listo para puntuar. Es el puente entre "recoger datos" y "subir
 * puntuación con evidencia".
 */
export function applyVerifications(opp, verifications = getLeadVerifications(opp.id)) {
  if (!verifications.length) return opp;
  const signals = { ...(opp.signals || {}) };
  const evidence = [...(opp.evidence || [])];
  for (const v of verifications) {
    signals[v.filter] = { level: v.level, note: v.note };
    evidence.push({
      filter: v.filter,
      type: v.auto ? "web" : "verificación",
      source: v.auto ? (v.srcLabel || "Lectura de su web") : "Verificado por analista",
      note: v.note || "Confirmado manualmente.",
      tier: 2,
      url: v.url || "verificación-manual",
    });
  }
  return { ...opp, signals, evidence, _verified: verifications.length };
}

// ---- Leads añadidos desde dentro de la app ----------------------------------
//
// Pablo/Javi pueden añadir leads desde la propia app (sección "Buscar leads").
// Se guardan aquí, se mezclan con el dataset investigado y se puntúan igual que
// el resto. Exportables/importables junto al estado para compartir entre ambos.

/** @returns {Array} leads de usuario (ya con forma de oportunidad). */
export function getUserLeads() {
  return read(USER_LEADS_KEY, []);
}

/** Añade o actualiza (por id) un lead de usuario. */
export function saveUserLead(lead) {
  const all = getUserLeads().filter((l) => l.id !== lead.id);
  all.push(lead);
  write(USER_LEADS_KEY, all);
  scheduleSync();
  return all;
}

export function removeUserLead(id) {
  write(USER_LEADS_KEY, getUserLeads().filter((l) => l.id !== id));
  scheduleSync();
}

/** Hard reset de la caché LOCAL (control "borrar" de la UI). No borra el estado
 *  compartido del servidor: al recargar/iniciar sesión se vuelve a traer desde
 *  Supabase. Es deliberado — evita que un borrado local destruya el trabajo
 *  compartido del equipo. */
export function resetAll() {
  [TRACK_KEY, LEARN_KEY, CONFIG_KEY, VERIFY_KEY, USER_LEADS_KEY, REV_KEY].forEach((k) => storage.removeItem(k));
}
