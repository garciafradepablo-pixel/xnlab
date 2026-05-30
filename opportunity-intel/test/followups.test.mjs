// =============================================================================
// followups.test.mjs — Secuencias de seguimiento multi-toque (Fase 6). Puro.
// =============================================================================

import { nextFollowup, dueLabel, dueFollowups } from "../src/followups.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("followups.test.mjs");

const H = 3600000;
const NOW = Date.parse("2026-05-30T12:00:00Z");
const ago = (h) => new Date(NOW - h * H).toISOString();

// 1. Estados resueltos / sin tocar → no hay seguimiento.
ok(nextFollowup({ status: "not_called" }, NOW) === null, "sin llamar → sin seguimiento");
ok(nextFollowup({ status: "meeting_booked", updatedAt: ago(50) }, NOW) === null, "reunión agendada → sin seguimiento");
ok(nextFollowup({ status: "rejected", updatedAt: ago(50) }, NOW) === null, "rechazado → sin seguimiento");

// 2. "No contesta": la cadencia avanza con el tiempo.
const fu1 = nextFollowup({ status: "no_answer", updatedAt: ago(1) }, NOW); // 1h: aún no vence el 1er toque (3h)
ok(fu1.step === 1 && !fu1.isDue, "no contesta, 1h → primer toque, aún no vence");
const fu2 = nextFollowup({ status: "no_answer", updatedAt: ago(4) }, NOW); // 4h: vence toque 1
ok(fu2.step === 1 && fu2.isDue && fu2.channel === "Teléfono", "4h → toque 1 vencido (teléfono)");
const fu3 = nextFollowup({ status: "no_answer", updatedAt: ago(30) }, NOW); // 30h: toque 2 (24h)
ok(fu3.step === 2 && fu3.channel === "WhatsApp" && fu3.isDue, "30h → toque 2 (WhatsApp) vencido");
const fu4 = nextFollowup({ status: "no_answer", updatedAt: ago(100) }, NOW); // >72h: toque 3 (email)
ok(fu4.step === 3 && fu4.channel === "Email", "100h → toque 3 (email)");
ok(fu4.total === 3, "conoce el total de toques de la secuencia");

// 3. Cada toque trae canal, acción y guion.
ok(fu2.action && fu2.script && fu2.script.length > 10, "el toque trae acción y guion");

// 4. Etiqueta de vencimiento.
ok(dueLabel(NOW - 2 * H, NOW) === "hace 2 h", "vencido hace 2 h");
ok(dueLabel(NOW + 5 * H, NOW) === "en 5 h", "próximo en 5 h");
ok(dueLabel(NOW + 26 * H, NOW) === "en 1 día", "próximo en 1 día");
ok(dueLabel(NOW, NOW) === "vence ahora", "vence ahora");

// 5. Seguimientos de hoy: solo los vencidos, el más vencido primero.
const opps = [
  { id: "A", company: "A" },
  { id: "B", company: "B" },
  { id: "C", company: "C" },
];
const tracking = {
  A: { status: "no_answer", updatedAt: ago(4) },    // vencido hace poco
  B: { status: "no_answer", updatedAt: ago(100) },  // muy vencido
  C: { status: "no_answer", updatedAt: ago(1) },    // aún no vence
};
const due = dueFollowups(opps, tracking, NOW);
ok(due.length === 2, "solo los vencidos entran (A y B, no C)");
ok(due[0].opp.id === "B", "el más vencido va primero");
ok(!due.some((d) => d.opp.id === "C"), "el que aún no vence no aparece");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
