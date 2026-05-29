// =============================================================================
// verification.test.mjs — Verificación manual de huecos → evidencia citada que
// sube la puntuación, sin fabricar. Run: node test/verification.test.mjs
// =============================================================================

import * as store from "../src/store.js";
import { scoreOpportunity } from "../src/scoring.js";
import { FILTER_KEYS, DEFAULT_CONFIG } from "../src/models.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("verification.test.mjs");

function lead(sig) {
  const signals = {};
  const codes = { G: "green", Y: "yellow", R: "red", X: "grey" };
  FILTER_KEYS.forEach((k, i) => (signals[k] = { level: codes[sig[i]] || "grey" }));
  return { id: "v1", signals, evidence: [], researched: true };
}

store.resetAll();

// Lead con varios grises (huecos).
const o = lead("GGXXXGGXGX");
const before = scoreOpportunity(o, DEFAULT_CONFIG).confidence;

// 1. Verificar un hueco como verde sube la confianza.
store.addVerification("v1", "visibleTension", "green", "Web anticuada confirmada", "https://x.es");
const applied1 = store.applyVerifications(o);
const after1 = scoreOpportunity(applied1, DEFAULT_CONFIG).confidence;
ok(after1 > before, "verificar un hueco como verde sube la confianza");
ok(applied1.evidence.length === 1, "la verificación añade una evidencia");
ok(applied1.evidence[0].url, "la evidencia de verificación lleva cita (url)");
ok(applied1.signals.visibleTension.level === "green", "la señal verificada queda en verde");

// 2. Upsert por filtro: re-verificar el mismo filtro no duplica.
store.addVerification("v1", "visibleTension", "yellow", "Revisado de nuevo: parcial");
ok(store.getLeadVerifications("v1").length === 1, "re-verificar el mismo filtro hace upsert (no duplica)");
ok(store.getLeadVerifications("v1")[0].level === "yellow", "el upsert refleja el último veredicto");

// 3. Varias verificaciones acumulan y suben el % verificado.
store.addVerification("v1", "activePainSignal", "green", "Reseñas con quejas de reservas", "https://maps.x");
const applied2 = store.applyVerifications(o);
const v = scoreOpportunity(applied2, DEFAULT_CONFIG).verification;
ok(applied2.evidence.length === 2, "dos filtros verificados = dos evidencias");
ok(v.verifiedShare > 0, "el % verificado sube con verificaciones citadas");

// 4. removeVerification revierte.
store.removeVerification("v1", "visibleTension");
ok(store.getLeadVerifications("v1").length === 1, "eliminar una verificación la quita");
store.removeVerification("v1", "activePainSignal");
ok(store.getLeadVerifications("v1").length === 0, "sin verificaciones, lista vacía");
const restored = store.applyVerifications(o);
ok(restored.evidence.length === 0, "sin verificaciones el lead vuelve a su estado original");

// 5. Verificación negativa (rojo) NO sube — refleja la realidad.
store.addVerification("v1", "economicCapacity", "red", "Margen bajo confirmado");
const appliedNeg = store.applyVerifications(o);
const afterNeg = scoreOpportunity(appliedNeg, DEFAULT_CONFIG).confidence;
ok(afterNeg <= before, "verificar un filtro en rojo no infla (puede bajar)");

// 6. Export/import incluye verificaciones implícitamente vía estado.
ok(typeof store.getVerifications() === "object", "getVerifications devuelve objeto");

store.resetAll();
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
