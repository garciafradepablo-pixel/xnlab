// =============================================================================
// lenses.test.mjs — Lentes por sector: el motor evalúa cada empresa con la vara
// de su sector (versatilidad). Run con node.
// =============================================================================

import { lensFor, lensLabel, combineMultipliers, SECTOR_LENSES } from "../src/lenses.js";
import { scoreOpportunity } from "../src/scoring.js";
import { FILTER_KEYS, DEFAULT_CONFIG } from "../src/models.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("lenses.test.mjs");

// 1. Hay lente para cada sector y todas cubren los 10 filtros.
for (const sec of ["health", "realestate", "growth", "hospitality"]) {
  const l = lensFor(sec);
  ok(FILTER_KEYS.every((k) => typeof l[k] === "number"), `${sec}: lente cubre los 10 filtros`);
  ok(lensLabel(sec), `${sec}: tiene etiqueta legible`);
}

// 2. Sector desconocido → lente neutra (todo 1.0), no rompe.
const unknown = lensFor("tatuaje");
ok(FILTER_KEYS.every((k) => unknown[k] === 1), "sector desconocido → lente neutra");
ok(lensLabel("tatuaje") === null, "sector desconocido → sin etiqueta");

// 3. Los multiplicadores son moderados (0.7–1.4): afinan, no fabrican.
for (const [sec, l] of Object.entries(SECTOR_LENSES)) {
  for (const k of FILTER_KEYS) ok(l[k] >= 0.7 && l[k] <= 1.4, `${sec}.${k} en rango razonable`);
}

// 4. combineMultipliers fusiona lente × aprendizaje filtro a filtro.
const learned = Object.fromEntries(FILTER_KEYS.map((k) => [k, 1]));
learned.whyNow = 1.1;
const combo = combineMultipliers("growth", learned);
ok(Math.abs(combo.whyNow - lensFor("growth").whyNow * 1.1) < 1e-9, "combina lente × aprendizaje");
ok(Math.abs(combineMultipliers("growth", null).transitionSignal - lensFor("growth").transitionSignal) < 1e-9, "sin aprendizaje usa solo la lente");

// 5. La lente cambia el ORDEN entre sectores: el mismo patrón de señales puntúa
//    distinto según el sector (esa es la versatilidad).
function lead(sector, sig) {
  const signals = {};
  const codes = { G: "green", Y: "yellow", R: "red", X: "grey" };
  FILTER_KEYS.forEach((k, i) => (signals[k] = { level: codes[sig[i]] || "grey" }));
  return { id: "t", sector, signals, evidence: [] };
}
// Señales: solo "whyNow" (índice 5) y "transitionSignal" (0) verdes — momento puro.
const sigMomento = "GXXXXG XXXX".replace(/\s/g, "");
const growth = scoreOpportunity(lead("growth", sigMomento), DEFAULT_CONFIG).confidence;
const health = scoreOpportunity(lead("health", sigMomento), DEFAULT_CONFIG).confidence;
// growth premia el momento → debe puntuar más alto que health con el mismo patrón.
ok(growth > health, "el mismo 'momento' puntúa más en growth que en health (lente)");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
