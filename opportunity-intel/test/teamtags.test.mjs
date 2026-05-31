// teamtags.test.mjs — Etiquetas de equipo (catálogo + ojeada), lógica pura.
// Shim mínimo de localStorage para el cacheo del catálogo.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const { DEFAULT_CATALOG, getCatalog, cacheCatalog, labelMap, labelOf, cleanTags, teamByTag } =
  await import("../src/teamtags.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("teamtags.test.mjs");

ok(DEFAULT_CATALOG.length > 5, "el catálogo semilla trae perfiles");
ok(getCatalog() === DEFAULT_CATALOG, "sin caché, getCatalog cae a la semilla");

cacheCatalog([{ slug: "legal", label: "Legal" }, { slug: "rrhh", label: "Recursos Humanos" }]);
ok(getCatalog().length === 2, "tras cachear, getCatalog usa el del servidor");
ok(labelOf("legal") === "Legal", "labelOf resuelve la etiqueta cacheada");
ok(labelMap().get("rrhh") === "Recursos Humanos", "labelMap mapea slug→label");
ok(labelOf("desconocida") === "desconocida", "slug desconocido cae a sí mismo");

ok(cleanTags(["RRHH", "rrhh", "", "  Legal "]).join(",") === "rrhh,legal", "cleanTags normaliza, deduplica y recorta");
ok(cleanTags("no-array").length === 0, "cleanTags tolera entradas no-array");

const summary = teamByTag([
  { name: "Pablo", tags: ["direccion", "rrhh"] },
  { name: "Sara", tags: ["rrhh", "psicologia"] },
  { name: "Javi", tags: [] },
]);
const rrhh = summary.find((t) => t.slug === "rrhh");
ok(rrhh && rrhh.count === 2, "teamByTag cuenta personas por etiqueta");
ok(rrhh.people.includes("Pablo") && rrhh.people.includes("Sara"), "lista quién lleva cada etiqueta");
ok(summary[0].slug === "rrhh", "ordena por más frecuente primero");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
