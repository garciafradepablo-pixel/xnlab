// =============================================================================
// signals.test.mjs — La capa de señales REALES. Comprueba que detecta huecos
// con base verificable y su cita, y que NUNCA inventa: sin base real, [].
// =============================================================================

import { detectSignals, primarySignal, hasRealSignal } from "../src/signals.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("signals.test.mjs");

const YEAR = 2026;

// === no_web: hueco fuerte y observable, sin red ===
const nameOnly = detectSignals({ company: "Bar Paco" }, { year: YEAR });
ok(nameOnly.length === 1 && nameOnly[0].key === "no_web", "lead solo-nombre → señal 'no_web'");
ok(nameOnly[0].strength === "strong" && nameOnly[0].verified === true, "no_web es fuerte y verificable (observable)");
ok(nameOnly[0].source === "presencia web", "no_web cita su fuente");

// Web válida → no dispara no_web
ok(detectSignals({ company: "X", website: "https://barpaco.com" }, { year: YEAR }).length === 0,
  "con web real y sin lectura de frescura → sin señales (silencio honesto, no inventa)");
ok(detectSignals({ company: "X", web: "tienda.example.es" }, { year: YEAR }).every((s) => s.key !== "no_web"),
  "el campo 'web' también cuenta como presencia web");

// === web_stale: derivado de una lectura REAL (enrich-web), citado ===
const stale = detectSignals({
  company: "Clínica Vieja", website: "https://clinicavieja.com",
  webFreshness: { readable: true, copyright_year: 2017, has_viewport: false },
}, { year: YEAR });
const ws = stale.find((s) => s.key === "web_stale");
ok(ws != null, "web con copyright 2017 + sin viewport → señal 'web_stale'");
ok(ws && /2017/.test(ws.label), "la etiqueta de web_stale incluye el año real leído");
ok(ws && ws.url === "https://clinicavieja.com" && ws.source === "su web", "web_stale lleva la URL como cita");
ok(ws && ws.strength === "indicative", "web_stale es indicio (el pie de copyright no es prueba férrea)");

// Web fresca y responsive → sin web_stale
ok(detectSignals({
  company: "Y", website: "https://moderna.com",
  webFreshness: { readable: true, copyright_year: 2026, has_viewport: true },
}, { year: YEAR }).length === 0, "web actual y responsive → sin señal (no se fuerza un hueco)");

// Frescura no legible → no se usa (no inventa sobre datos no leídos)
ok(detectSignals({
  company: "Z", website: "https://z.com", webFreshness: { readable: false },
}, { year: YEAR }).length === 0, "lectura no legible → no genera señal");

// === primarySignal: lo fuerte (observable) antes que el indicio ===
const both = { company: "Sin Web SL", webFreshness: { readable: true, copyright_year: 2015, has_viewport: false } };
// sin web real → no_web (fuerte); web_stale no aplica porque no hay web válida
ok(primarySignal(both, { year: YEAR }).key === "no_web", "primarySignal prioriza la señal fuerte (no_web)");
ok(hasRealSignal({ company: "Bar Paco" }, { year: YEAR }) === true, "hasRealSignal true cuando hay base real");
ok(hasRealSignal({ company: "X", website: "https://ok.com" }, { year: YEAR }) === false, "hasRealSignal false sin base real");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
