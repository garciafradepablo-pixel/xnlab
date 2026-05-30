// =============================================================================
// interests.js — Memoria de los intereses de búsqueda del usuario.
//
// Cada captación registra qué se buscó y a qué sector fue. Con eso, Connect
// ofrece accesos rápidos a lo que más te interesa y ordena por relevancia para
// ti. Local y ligero (localStorage con fallback en memoria).
// =============================================================================

const KEY = "oi:searchInterests";
const mem = new Map();
const storage = typeof localStorage !== "undefined" ? localStorage
  : { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };

const norm = (s) => String(s || "").trim().toLowerCase();
function read() { try { const r = storage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function write(v) { try { storage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } }

/** Registra (o refuerza) una búsqueda. */
export function recordSearch(query, sectorKey, sectorLabel) {
  const q = String(query || "").trim();
  if (q.length < 2) return;
  const list = read();
  const k = norm(q);
  const ex = list.find((x) => norm(x.q) === k);
  if (ex) { ex.count = (ex.count || 1) + 1; ex.at = Date.now(); ex.sectorKey = sectorKey; ex.sectorLabel = sectorLabel; }
  else list.push({ q, sectorKey, sectorLabel, count: 1, at: Date.now() });
  write(list);
}

/** Tus búsquedas, por relevancia (frecuencia y reciente). */
export function getInterests(limit = 8) {
  return read()
    .sort((a, b) => (b.count - a.count) || (b.at - a.at))
    .slice(0, limit);
}
