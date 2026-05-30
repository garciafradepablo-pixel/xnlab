// =============================================================================
// today.test.mjs — Vista "Hoy": claridad ejecutiva (Fase 5). Lógica pura.
// =============================================================================

import { pickTodayCalls, nextStep, pipelinePulse } from "../src/today.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("today.test.mjs");

// Fábrica de oportunidad de prueba.
const opp = (id, cls, conf, successIndex, offer = "audit", rec = "call_immediately") => ({
  id, company: id, city: "Madrid", sector: "growth",
  suggestedOfferKey: offer,
  scores: { classification: cls, confidence: conf, successIndex, recommendation: rec },
});

const opps = [
  opp("A", "01", 80, 40),
  opp("B", "xn", 95, 70, "xn_transformation"),
  opp("C", "01", 72, 30),
  opp("D", "unqualified", 50, 10),          // no es real → fuera
  opp("E", "01", 88, 55),
];

// 1. Solo entran 01/XN; ordena por Índice de Éxito (lo que cierra) primero.
const calls = pickTodayCalls(opps, {}, { limit: 3 });
ok(calls.length === 3, "devuelve hasta el límite (3)");
ok(calls.every((o) => o.scores.classification !== "unqualified"), "excluye lo que no es 01/XN");
ok(calls[0].id === "B", "la de mayor Índice de Éxito va primera");
ok(calls[1].id === "E" && calls[2].id === "A", "ordena por éxito y confianza");

// 2. Estados resueltos salen; un hilo abierto sube.
const tracking = { B: { status: "meeting_booked" }, C: { status: "interested" } };
const calls2 = pickTodayCalls(opps, tracking, { limit: 3 });
ok(!calls2.some((o) => o.id === "B"), "la reunión agendada sale del foco de hoy");
ok(calls2[0].id === "C", "el hilo abierto (interesado) sube al primer puesto");

// 3. Siguiente paso según estado y recomendación.
ok(nextStep(opp("X", "01", 80, 40), {}).action === "Llamar de inmediato", "sin llamar + call_immediately → llamar ya");
ok(nextStep(opp("X", "01", 80, 40, "audit", "enrich"), {}).action === "Enriquecer antes de llamar", "enrich → enriquecer");
ok(nextStep(opp("X", "01", 80, 40), { status: "interested" }).action === "Cerrar reunión", "interesado → cerrar reunión");
ok(nextStep(opp("X", "01", 80, 40), { status: "no_answer" }).action.startsWith("Reintentar"), "no contesta → reintentar");
ok(nextStep(opp("X", "01", 80, 40), {}).why.length > 10, "siempre explica el porqué");

// 4. Pulso del pipeline: cuentas y valor.
const pulse = pipelinePulse(opps, { A: { status: "called" }, B: { status: "meeting_booked" } });
ok(pulse.total === 4, "cuenta solo oportunidades reales (4)");
ok(pulse.o1 === 3 && pulse.xn === 1, "reparte 01 (3) y XN (1)");
ok(pulse.called === 2 && pulse.pending === 2, "llamadas vs pendientes");
ok(pulse.meetings === 1, "cuenta reuniones agendadas");
ok(pulse.valueXn === 8000, "valor XN = ticket de transformación");
ok(pulse.valueTotal === 1500 * 3 + 8000, "valor total suma tickets");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
