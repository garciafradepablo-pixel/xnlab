// =============================================================================
// kudos.js — Reconocimiento entre el equipo. Un gesto pequeño, fechado y
// firmado: la forma más legítima (y barata) de mover motivación y autoridad
// ganada — el creador reconoce el mérito a la vista de todos. No es vigilancia
// ni ranking; es mérito hecho visible. Lógica pura y testeable.
//
// Un kudo = { id, to (nombre), from (quien reconoce), note, at }.
// =============================================================================

let _seq = 0;
function uid(p) {
  _seq = (_seq + 1) % 1e6;
  const rnd = (typeof Math !== "undefined" ? Math.random() : 0).toString(36).slice(2, 7);
  return `${p}_${Date.now().toString(36)}${_seq.toString(36)}${rnd}`;
}
const nowIso = () => new Date().toISOString();

/** Crea un reconocimiento para `to`, firmado por `from`. null si falta destino. */
export function createKudo({ to, from = "", note = "" } = {}) {
  const dest = String(to || "").trim();
  if (!dest) return null;
  return { id: uid("kudo"), to: dest, from: String(from || "").trim(), note: String(note || "").trim(), at: nowIso() };
}

/** Reconocimientos recibidos por `name`, más recientes primero. */
export function kudosFor(list = [], name) {
  return (list || []).filter((k) => k && k.to === name).sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

/** Cuántos reconocimientos ha recibido `name`. */
export function kudosCount(list = [], name) {
  return (list || []).filter((k) => k && k.to === name).length;
}
