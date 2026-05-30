// =============================================================================
// synthesis.test.mjs — El veredicto inteligente combina nota, señales y nicho.
// =============================================================================
import { synthesize } from "../src/synthesis.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("synthesis.test.mjs");

// Caliente con palancas (web obsoleta = actionableLever amarillo; apertura = transitionSignal).
const hot = synthesize({
  scores: { confidence: 84 },
  signals: { actionableLever: { level: "yellow" }, transitionSignal: { level: "green" } },
  decisionMaker: { name: "Rosa" },
}, { sectorRate: { ranked: true, rate: 67 } });
ok(hot.temp === "hot" && hot.tempLabel === "CALIENTE", "84 → caliente");
ok(hot.levers.length >= 2, "detecta varias palancas");
ok(hot.levers[0].strong === true, "ordena las palancas fuertes (verde) primero");
ok(/Llamar ya/i.test(hot.headline), "veredicto manda llamar ya");
ok(/67%/.test(hot.headline), "incorpora la conversión del nicho");
ok(hot.nextAction === "Llamar hoy", "acción: llamar hoy");

// Frío sin señales.
const cold = synthesize({ scores: { confidence: 40 }, signals: {} });
ok(cold.temp === "cold" && cold.levers.length === 0, "40 sin señales → frío y sin palancas");
ok(/faltan señales|Enriquece/i.test(cold.headline), "frío manda enriquecer");
ok(cold.sectorRate === null, "sin datos de nicho → null");

// Templado.
ok(synthesize({ scores: { confidence: 62 }, signals: {} }).temp === "warm", "62 → templado");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
