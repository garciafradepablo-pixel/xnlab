// =============================================================================
// enrich.test.mjs — Enriquecimiento honesto desde la web (Fase 3). Lógica pura.
// =============================================================================

import { factsToVerifications, summarizeEnrichment } from "../src/enrich.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("enrich.test.mjs");

const YEAR = 2026;
const clinic = { sector: "health", website: "https://clinica.example" };

// 1. Copyright viejo → tensión visible amarilla, citada.
const v1 = factsToVerifications({ ok: true, url: "https://x", copyrightYear: 2019 }, clinic, { year: YEAR });
const tension = v1.find((v) => v.filter === "visibleTension");
ok(tension && tension.level === "yellow", "©2019 → tensión visible amarilla");
ok(tension.auto && tension.srcLabel === "Lectura de su web", "marcada como lectura automática de la web");
ok(/2019/.test(tension.note), "la nota cita el año real");

// 2. Web reciente → NO inventa tensión por copyright.
const v2 = factsToVerifications({ ok: true, copyrightYear: 2025 }, clinic, { year: YEAR });
ok(!v2.some((v) => v.filter === "visibleTension" && /©/.test(v.note)), "web reciente no genera tensión por copyright");

// 3. Clínica sin reserva online → palanca por construir.
const v3 = factsToVerifications({ ok: true, hasBooking: false }, clinic, { year: YEAR });
ok(v3.some((v) => v.filter === "actionableLever" && v.level === "yellow"), "clínica sin reserva → palanca amarilla");

// 4. Clínica CON reserva → palanca que existe (optimizar), no se descarta.
const v4 = factsToVerifications({ ok: true, hasBooking: true }, clinic, { year: YEAR });
ok(v4.some((v) => v.filter === "actionableLever" && /optimizar/.test(v.note)), "con reserva → palanca a optimizar");

// 5. Sector donde la reserva no aplica (growth) → no fuerza palanca.
const v5 = factsToVerifications({ ok: true, hasBooking: false }, { sector: "growth" }, { year: YEAR });
ok(!v5.some((v) => v.filter === "actionableLever"), "growth sin reserva no genera palanca falsa");

// 6. Un indicio por filtro como máximo (copyright viejo + sin viewport → 1 tensión).
const v6 = factsToVerifications({ ok: true, copyrightYear: 2018, hasViewport: false }, clinic, { year: YEAR });
ok(v6.filter((v) => v.filter === "visibleTension").length === 1, "no duplica el mismo filtro");

// 7. Honestidad: un email genérico NO crea 'decisor alcanzable'.
const v7 = factsToVerifications({ ok: true, emails: ["info@x.com"], phones: ["+34..."] }, clinic, { year: YEAR });
ok(!v7.some((v) => v.filter === "reachableDecisionMaker"), "no inventa decisor desde un email genérico");

// 8. facts no-ok → nada.
ok(factsToVerifications({ ok: false }, clinic).length === 0, "sin lectura válida → sin señales");

// 9. Resumen legible.
ok(summarizeEnrichment(v1).length > 10 && /web/.test(summarizeEnrichment([])), "resumen legible (con y sin señales)");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
