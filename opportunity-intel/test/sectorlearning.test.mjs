// =============================================================================
// sectorlearning.test.mjs — Mide qué nichos cierran mejor, con honestidad.
// =============================================================================
import { sectorPerformance, sectorRate } from "../src/sectorlearning.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("sectorlearning.test.mjs");

const log = [
  { sector: "health", outcome: "meeting_booked" },
  { sector: "health", outcome: "interested" },
  { sector: "health", outcome: "rejected" },          // health: 2/3 = 67%
  { sector: "tatuaje", outcome: "rejected" },
  { sector: "tatuaje", outcome: "wrong_fit" },          // tatuaje: 0/2 (sin muestra)
  { sector: "health", outcome: "no_answer" },          // no decisivo → ignorado
  { sector: null, outcome: "interested" },              // sin sector → ignorado
];

const perf = sectorPerformance(log, { minSample: 3 });

// 1) Cuenta solo decisivos y por sector.
const health = perf.find((r) => r.sector === "health");
ok(health && health.decisive === 3 && health.wins === 2 && health.rate === 67, "health: 2 de 3 decisivos = 67%");

// 2) Honestidad: nicho con pocos datos no se juzga (ranked=false).
const tat = perf.find((r) => r.sector === "tatuaje");
ok(tat && tat.ranked === false, "tatuaje con 2 decisivos sigue 'calibrando' (no juzgado)");
ok(health.ranked === true, "health con 3 decisivos sí se juzga");

// 3) Orden: juzgables primero.
ok(perf[0].sector === "health", "el nicho juzgable va primero");

// 4) Ignora no-decisivos y sin sector.
ok(!perf.some((r) => r.sector == null), "ignora outcomes sin sector");
ok(perf.reduce((s, r) => s + r.decisive, 0) === 5, "solo cuenta los 5 decisivos con sector");

// 5) sectorRate de uno concreto.
ok(sectorRate(log, "health", { minSample: 3 }).rate === 67, "sectorRate devuelve la conversión del sector");
ok(sectorRate(log, "growth") === null, "sectorRate null si no hay datos");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
