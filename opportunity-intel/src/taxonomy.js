// =============================================================================
// taxonomy.js — El mapa de captación. Una idea en una línea se convierte en un
// árbol de categorías anidadas (carpetas dentro de carpetas) que organiza la
// búsqueda de empresas. Las HOJAS son nichos concretos y buscables.
//
// El cerebro vive en la Edge Function `taxonomy` (Gemini). Aquí guardamos el
// árbol en localStorage, lo fusionamos sin duplicar al re-generar, y exponemos
// utilidades para navegarlo, contar leads por carpeta y construir consultas.
//
// Forma de un nodo: { name: string, children: Node[] }.  El bosque es Node[].
// La "ruta" de un nodo es el array de nombres desde la raíz, p.ej.
// ["Clínicas","Ortopedia","Brackets"].
// =============================================================================

const NS = "oi:";
const KEY = `${NS}categories`;
const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/taxonomy";
const ANON = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };

function read() { try { const r = storage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
function write(v) { try { storage.setItem(KEY, JSON.stringify(v)); } catch { /* */ } }

const eq = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const findChild = (list, name) => (list || []).find((n) => eq(n.name, name)) || null;

/** @returns {Array<{name:string,children:Array}>} el bosque guardado */
export function getForest() { return read(); }
export function saveForest(forest) { write(Array.isArray(forest) ? forest : []); }
export function clearForest() { write([]); }

/** Nodo en una ruta (o null). Ruta vacía = no aplica (usa getForest). */
export function nodeAt(path) {
  let list = read(), node = null;
  for (const name of path || []) {
    node = findChild(list, name);
    if (!node) return null;
    list = node.children || [];
  }
  return node;
}

/** Lista de hijos en una ruta. Ruta vacía → raíces del bosque. */
export function childrenAt(path) {
  if (!path || !path.length) return read();
  const n = nodeAt(path);
  return n ? (n.children || []) : [];
}

/** ¿Es hoja el nodo en esta ruta? (sin hijos) */
export function isLeaf(path) {
  const n = nodeAt(path);
  return !!n && (!n.children || n.children.length === 0);
}

// Fusión recursiva: mete `incoming` dentro de `base` casando por nombre, sin
// duplicar. Devuelve `base` mutado para encadenar.
function mergeInto(base, incoming) {
  for (const inc of incoming || []) {
    const name = String(inc?.name || "").trim();
    if (!name) continue;
    let existing = findChild(base, name);
    if (!existing) { existing = { name, children: [] }; base.push(existing); }
    if (Array.isArray(inc.children) && inc.children.length) {
      existing.children = existing.children || [];
      mergeInto(existing.children, inc.children);
    }
  }
  return base;
}

/** Fusiona un árbol nuevo en el bosque guardado (sin duplicar) y lo persiste. */
export function mergeForest(newRoots) {
  const forest = mergeInto(read(), newRoots || []);
  write(forest);
  return forest;
}

/** Borra el nodo de una ruta (y su subárbol). */
export function removePath(path) {
  if (!path || !path.length) return;
  const forest = read();
  let list = forest;
  for (let i = 0; i < path.length - 1; i++) {
    const node = findChild(list, path[i]);
    if (!node) return;
    list = node.children || [];
  }
  const idx = list.findIndex((n) => eq(n.name, path[path.length - 1]));
  if (idx >= 0) { list.splice(idx, 1); write(forest); }
}

/** Todas las hojas bajo una ruta → [{name, path:[...]}]. Ruta vacía = todo. */
export function leavesUnder(path = []) {
  const out = [];
  const walk = (nodes, prefix) => {
    for (const n of nodes || []) {
      const p = [...prefix, n.name];
      if (!n.children || !n.children.length) out.push({ name: n.name, path: p });
      else walk(n.children, p);
    }
  };
  walk(path.length ? (nodeAt(path)?.children || []) : read(), path);
  // Si la propia ruta es una hoja, ella misma es la hoja.
  if (path.length && isLeaf(path)) return [{ name: path[path.length - 1], path }];
  return out;
}

/** Consulta de descubrimiento a partir de una ruta (hoja + contexto raíz). */
export function pathQuery(path) {
  const p = (path || []).filter(Boolean);
  if (!p.length) return "";
  // Hoja primero (lo más específico) + la raíz para contexto del mapa.
  return p.length > 1 ? `${p[p.length - 1]} ${p[0]}` : p[0];
}

const startsWith = (full, prefix) =>
  Array.isArray(full) && prefix.every((seg, i) => eq(full[i] || "", seg));

/** Cuenta leads cuya categoryPath empieza por `path`. */
export function countUnder(path, leads) {
  if (!Array.isArray(leads)) return 0;
  return leads.filter((l) => startsWith(l.categoryPath, path)).length;
}

/** Leads cuya categoryPath empieza por `path`. */
export function leadsUnder(path, leads) {
  if (!Array.isArray(leads)) return [];
  return leads.filter((l) => startsWith(l.categoryPath, path));
}

// Respaldo local (sin red): replica el de la función — respeta "/" o raíz única.
function localFallback(prompt) {
  const text = String(prompt || "").trim();
  if (!text) return [];
  const segments = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const roots = [];
  let any = false;
  for (const seg of segments) {
    const parts = seg.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    any = true;
    let level = roots;
    for (const p of parts) {
      let n = findChild(level, p);
      if (!n) { n = { name: p, children: [] }; level.push(n); }
      level = n.children;
    }
  }
  if (any) return roots;
  const title = text.replace(/\s+/g, " ").replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
  return [{ name: title.slice(0, 48), children: [] }];
}

/** Convierte una ruta ["a","b","c"] en un sub-árbol encadenado (para mergeForest). */
export function pathNodes(path) {
  const p = (path || []).filter(Boolean);
  if (!p.length) return [];
  let node = { name: p[p.length - 1], children: [] };
  for (let i = p.length - 2; i >= 0; i--) node = { name: p[i], children: [node] };
  return [node];
}

// —— Etiquetas multidimensión (entorno · clase · estética) ————————————————————
/** Dimensiones y valores distintos presentes en los leads, con conteo. */
export function allTags(leads) {
  const dims = new Map(); // dim -> Map(value -> count)
  for (const l of leads || []) {
    const t = l && l.tags;
    if (!t || typeof t !== "object") continue;
    for (const [dim, val] of Object.entries(t)) {
      if (!val) continue;
      if (!dims.has(dim)) dims.set(dim, new Map());
      const m = dims.get(dim);
      m.set(val, (m.get(val) || 0) + 1);
    }
  }
  return [...dims.entries()].map(([dim, m]) => ({
    dim,
    values: [...m.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
  }));
}
/** ¿El lead casa con un filtro de faceta {dim, value}? (null = no filtra) */
export function leadMatchesFacet(lead, facet) {
  if (!facet || !facet.dim) return true;
  return !!(lead && lead.tags && eq(lead.tags[facet.dim] || "", facet.value));
}

/**
 * Clasifica un lote de empresas en el árbol (vía Edge Function `classify`).
 * Devuelve [{ i, path:[...], tags:{...} }] o [] si no hay IA/red.
 */
export async function classifyLeads(items, forest, token) {
  if (typeof fetch === "undefined" || !Array.isArray(items) || !items.length) return [];
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ action: "classify", items, forest: forest || getForest(), token: token || null }),
      signal: typeof AbortSignal !== "undefined" ? AbortSignal.timeout(20000) : undefined,
    });
    if (!res.ok) return [];
    const d = await res.json();
    return d && d.ok && Array.isArray(d.assignments) ? d.assignments : [];
  } catch {
    return [];
  }
}

/**
 * Genera un árbol a partir de una idea. Llama a la Edge Function (Gemini); si no
 * hay red o falla, cae al respaldo local. Devuelve { ok, tree, ai }.
 */
export async function generateTaxonomy(prompt, token) {
  const text = String(prompt || "").trim();
  if (!text) return { ok: false, error: "Escribe una idea.", tree: [] };
  if (typeof fetch !== "undefined") {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
        body: JSON.stringify({ prompt: text, token: token || null }),
        signal: typeof AbortSignal !== "undefined" ? AbortSignal.timeout(15000) : undefined,
      });
      if (res.ok) {
        const d = await res.json();
        if (d && d.ok && Array.isArray(d.tree) && d.tree.length) return { ok: true, tree: d.tree, ai: !!d.ai };
      }
    } catch { /* sin red → respaldo local */ }
  }
  return { ok: true, tree: localFallback(text), ai: false };
}
