// =============================================================================
// freshness.test.mjs — Detección de leads/momentos en desuso. Anti-empresas
// muertas. Run: node test/freshness.test.mjs
// =============================================================================

import { freshness, connectionDifficulty } from "../src/diagnosis.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("freshness.test.mjs");

const NOW = new Date().getFullYear();
const lead = (notes, researchedAt) => ({
  evidence: notes.map((n) => ({ note: n })),
  researchedAt,
});

// 1. Señal del año actual o anterior = fresca.
const f1 = freshness(lead([`Abrió nueva sede en ${NOW}`]));
ok(f1.tone === "fresh", "señal del año actual = fresca");
ok(f1.latestYear === NOW, "detecta el año más reciente");

// 2. Señal de hace ~2 años = aviso.
const f2 = freshness(lead([`Ronda cerrada en ${NOW - 2}`]));
ok(f2.tone === "warn", "señal de ~2 años = aviso");

// 3. Señal antigua (>2 años) = stale (riesgo de desuso).
const f3 = freshness(lead([`Inauguró en ${NOW - 5}`]));
ok(f3.tone === "stale", "señal de >2 años = stale");
ok(f3.ageYears === 5, "calcula la antigüedad");

// 4. Sin fecha en la evidencia = aviso (confirmar actividad).
const f4 = freshness(lead(["Empresa premium del sector"]));
ok(f4.tone === "warn", "sin fecha = aviso");
ok(f4.latestYear === null, "sin año detectado");

// 5. Coge el año MÁS reciente entre varias evidencias.
const f5 = freshness(lead([`Fundada en ${NOW - 6}`, `Expansión en ${NOW}`]));
ok(f5.latestYear === NOW, "usa el año más reciente, no el de fundación");
ok(f5.tone === "fresh", "el año reciente manda sobre el antiguo");

// 6. Siempre devuelve pasos de comprobación de vida.
ok(Array.isArray(f1.checks) && f1.checks.length >= 3, "incluye pasos de comprobación de actividad");

// 7. Ignora años fuera de rango (no confunde precios/números).
const f7 = freshness(lead(["Inversión de 80 millones; código postal 28001"]));
ok(f7.latestYear === null, "no toma números arbitrarios como años");

// --- connectionDifficulty ---
const dm = (extra) => ({ decisionMaker: { name: "X", linkedin: "in/x" }, signals: { reachableDecisionMaker: { level: "green" } }, ...extra });

// 8. Decisor con nombre + teléfono + LinkedIn = fácil.
const easy = connectionDifficulty(dm({ phone: "+34 600 00 00 00" }));
ok(easy.level === "easy", "decisor + teléfono + LinkedIn = fácil");
ok(easy.icon === "🟢", "fácil usa icono verde");
ok(easy.channels.includes("teléfono"), "lista el canal teléfono");

// 9. Sin decisor ni canal = difícil.
const hard = connectionDifficulty({ decisionMaker: {}, signals: {} });
ok(hard.level === "hard", "sin decisor ni canal = difícil");
ok(hard.icon === "🔴", "difícil usa icono rojo");

// 10. Caso intermedio.
const med = connectionDifficulty({ decisionMaker: { name: "Y" }, signals: { reachableDecisionMaker: { level: "yellow" } }, email: "y@z.es" });
ok(med.level === "medium", "nombre + email sin vía directa = medio");

// 11. El teléfono sube la puntuación de alcanzabilidad.
const noPhone = connectionDifficulty({ decisionMaker: { name: "Z" }, signals: {} });
const withPhone = connectionDifficulty({ decisionMaker: { name: "Z" }, signals: {}, phone: "+34 600" });
ok(withPhone.score > noPhone.score, "tener teléfono sube la alcanzabilidad");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
