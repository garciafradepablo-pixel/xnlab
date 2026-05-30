// =============================================================================
// customsectors.test.mjs — Sectores definibles desde la app (Fase 8).
// =============================================================================

// Shim de localStorage para Node.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const cs = await import("../src/customsectors.js");
const { lensFor, lensLabel } = await import("../src/lenses.js");
const { FILTER_KEYS } = await import("../src/models.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("customsectors.test.mjs");

// 1. De entrada, solo los 4 sectores base.
ok(cs.allSectors().length === 4, "arranca con 4 sectores base");
ok(cs.getCustomSectors().length === 0, "sin sectores custom al inicio");

// 2. Crear un sector custom.
const r = cs.addCustomSector("Tatuaje", "estudio tatuaje, tattoo studio");
ok(r.ok && r.key === "tatuaje", "crea el sector y genera su clave");
ok(cs.allSectors().length === 5, "ahora hay 5 sectores");
ok(cs.sectorByKey("tatuaje").label === "Tatuaje", "se recupera por clave");
ok(JSON.stringify(cs.queriesFor("tatuaje")) === JSON.stringify(["estudio tatuaje", "tattoo studio"]), "guarda las consultas");

// 3. Validaciones.
ok(!cs.addCustomSector("a").ok, "rechaza nombre demasiado corto");
ok(!cs.addCustomSector("Tatuaje").ok, "rechaza duplicado");

// 4. La lente del sector custom es neutra por defecto (afina con el uso).
const lens = lensFor("tatuaje");
ok(FILTER_KEYS.every((k) => lens[k] === 1), "lente custom arranca neutra");
ok(lensLabel("tatuaje") !== null, "tiene etiqueta de lente");

// 5. Lente personalizada se respeta.
cs.addCustomSector("Música", ["sala conciertos"], { whyNow: 1.3, transitionSignal: 1.2 });
ok(lensFor("musica").whyNow === 1.3, "respeta la lente personalizada");

// 6. Eliminar.
cs.removeCustomSector("tatuaje");
ok(!cs.sectorByKey("tatuaje"), "elimina el sector");
ok(cs.allSectors().some((s) => s.key === "musica"), "el otro sector sigue");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
