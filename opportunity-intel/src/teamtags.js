// =============================================================================
// teamtags.js — Etiquetas que definen a cada persona del equipo.
//
// Cada trabajador, al registrarse, pasa por una ronda donde elige qué etiquetas
// lo definen (multi-selección): la misma persona puede ser Dirección, RRHH y
// Psicología a la vez. Así Pablo (admin/CEO) ve de un vistazo qué perfiles tiene
// y dónde están las carencias.
//
// El catálogo vive en el servidor (connect_team_tags) y el admin lo amplía. Aquí
// guardamos un catálogo SEMILLA idéntico al de la migración como respaldo offline
// y para pintar etiquetas aunque aún no haya llegado la lista del servidor.
//
// Forma de una etiqueta: { slug: string, label: string }. El usuario guarda solo
// los slugs; el label se resuelve contra el catálogo para mostrar.
// =============================================================================

/** Catálogo semilla (espejo de la migración admin_roles_team_tagging). */
export const DEFAULT_CATALOG = [
  { slug: "direccion", label: "Dirección / CEO" },
  { slug: "rrhh", label: "Recursos Humanos" },
  { slug: "psicologia", label: "Psicología" },
  { slug: "creatividad", label: "Creatividad" },
  { slug: "diseno", label: "Diseño" },
  { slug: "producto", label: "Producto" },
  { slug: "marketing", label: "Marketing" },
  { slug: "comunicacion", label: "Comunicación" },
  { slug: "ventas", label: "Ventas" },
  { slug: "operaciones", label: "Operaciones" },
  { slug: "tecnologia", label: "Tecnología" },
  { slug: "datos", label: "Datos" },
  { slug: "finanzas", label: "Finanzas" },
  { slug: "contenido", label: "Contenido" },
  { slug: "estrategia", label: "Estrategia" },
];

const NS = "oi:";
const KEY = `${NS}tagCatalog`;
const mem = new Map();
const storage =
  typeof localStorage !== "undefined"
    ? localStorage
    : { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) };

/** Cachea el catálogo traído del servidor (para offline / arranque rápido). */
export function cacheCatalog(list) {
  if (!Array.isArray(list) || !list.length) return;
  try { storage.setItem(KEY, JSON.stringify(list)); } catch { /* */ }
}

/** Catálogo conocido: el cacheado del servidor o, si no hay, la semilla. */
export function getCatalog() {
  try {
    const r = storage.getItem(KEY);
    const list = r ? JSON.parse(r) : null;
    if (Array.isArray(list) && list.length) return list;
  } catch { /* */ }
  return DEFAULT_CATALOG;
}

/** Mapa slug → label a partir de un catálogo (o el conocido). */
export function labelMap(catalog) {
  const m = new Map();
  for (const t of catalog || getCatalog()) if (t && t.slug) m.set(t.slug, t.label || t.slug);
  return m;
}

/** Etiqueta visible de un slug (cae al propio slug si es desconocido). */
export function labelOf(slug, catalog) {
  return labelMap(catalog).get(slug) || String(slug || "");
}

/** Normaliza una lista de slugs: strings, únicos, sin vacíos, tope 24. */
export function cleanTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.map((t) => String(t || "").trim().toLowerCase()).filter(Boolean))].slice(0, 24);
}

/**
 * Resumen del equipo por etiqueta: cuántas personas llevan cada slug, ordenado
 * de más a menos. users = [{name, tags:[...]}]. Para la ojeada del admin.
 * @returns {Array<{slug, label, count, people:string[]}>}
 */
export function teamByTag(users, catalog) {
  const lm = labelMap(catalog);
  const by = new Map(); // slug -> {count, people[]}
  for (const u of users || []) {
    for (const slug of cleanTags(u && u.tags)) {
      if (!by.has(slug)) by.set(slug, { count: 0, people: [] });
      const e = by.get(slug);
      e.count++;
      if (u.name) e.people.push(u.name);
    }
  }
  return [...by.entries()]
    .map(([slug, e]) => ({ slug, label: lm.get(slug) || slug, count: e.count, people: e.people }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
