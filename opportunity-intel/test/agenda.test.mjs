// =============================================================================
// agenda.test.mjs — Planificación de rondas + reparto por persona. Lógica pura.
// =============================================================================

import { planRounds, groupByDate, groupByRound, planSummary, orderByPriority, DEFAULT_SCHEDULE } from "../src/agenda.js";
import { pickTodayCalls } from "../src/today.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("agenda.test.mjs");

const leads = Array.from({ length: 12 }, (_, i) => ({ id: `L${i + 1}` }));

// 1. planRounds reparte por capacidad: 5/día → 3 días para 12 (5+5+2).
const plan = planRounds(leads, { workdays: [1, 2, 3, 4, 5], perDay: 5 }, { from: "2026-06-01", perRound: 5 });
ok(plan.length === 12, "planifica todas las llamadas");
ok(plan.filter((a) => a.date === plan[0].date).length === 5, "llena la capacidad del día (5)");
ok(new Set(plan.map((a) => a.date)).size === 3, "12 llamadas a 5/día ocupan 3 días");
ok(plan[0].slot === 1 && plan[4].slot === 5, "numera el hueco dentro del día");
ok(plan[5].day === 2 && plan[5].slot === 1, "la 6ª llamada abre el día 2");

// 2. Arranca el lunes pedido y SALTA el fin de semana.
ok(plan[0].date === "2026-06-01", "arranca en la fecha indicada (lunes)");
const dates = [...new Set(plan.map((a) => a.date))];
ok(dates[1] === "2026-06-02" && dates[2] === "2026-06-03", "días laborables consecutivos");
const planFri = planRounds(Array.from({ length: 8 }, (_, i) => ({ id: `F${i}` })), { perDay: 5 }, { from: "2026-06-05" });
const fdates = [...new Set(planFri.map((a) => a.date))];
ok(fdates[0] === "2026-06-05" && fdates[1] === "2026-06-08", "viernes → salta sábado/domingo al lunes");

// 3. Rondas = bloques de perRound días.
const big = planRounds(Array.from({ length: 30 }, (_, i) => ({ id: `B${i}` })), { perDay: 3 }, { from: "2026-06-01", perRound: 5 });
ok(Math.max(...big.map((a) => a.round)) === 2, "30 llamadas a 3/día = 10 días = 2 rondas de 5 días");
ok(big.find((a) => a.day === 6).round === 2, "el día 6 entra en la ronda 2");

// 4. Helpers de agrupación + resumen.
ok(groupByDate(plan).length === 3, "groupByDate agrupa por jornada");
ok(groupByRound(big).length === 2, "groupByRound agrupa por ronda");
const sum = planSummary(plan);
ok(sum.calls === 12 && sum.days === 3 && sum.rounds === 1, "resumen: 12 llamadas, 3 días, 1 ronda");
ok(sum.from === "2026-06-01" && sum.to === "2026-06-03", "resumen: fechas de inicio y fin");
ok(planSummary([]).calls === 0, "resumen vacío no rompe");

// 5. orderByPriority: primero Índice de Éxito, luego confianza.
const ord = orderByPriority([
  { id: "a", scores: { successIndex: 30, confidence: 90 } },
  { id: "b", scores: { successIndex: 70, confidence: 50 } },
  { id: "c", scores: { successIndex: 70, confidence: 80 } },
]);
ok(ord.map((o) => o.id).join("") === "cba", "ordena por éxito y desempata por confianza");

// 6. DEFAULT_SCHEDULE es lun-vie, 8/día.
ok(DEFAULT_SCHEDULE.perDay === 8 && DEFAULT_SCHEDULE.workdays.length === 5, "horario por defecto: L-V, 8/día");

// 7. pickTodayCalls con dueño: solo cuenta las de esa persona.
const opps = [
  { id: "o1", scores: { classification: "01", confidence: 80, successIndex: 40 } },
  { id: "o2", scores: { classification: "xn", confidence: 90, successIndex: 70 } },
  { id: "o3", scores: { classification: "01", confidence: 70, successIndex: 30 } },
];
const tr = {
  o1: { assignedTo: "Dani" },
  o2: { assignedTo: "Pablo" },
  o3: { assignedTo: "Dani" },
};
const dani = pickTodayCalls(opps, tr, { owner: "Dani", limit: 8 });
ok(dani.length === 2 && dani.every((o) => tr[o.id].assignedTo === "Dani"), "owner filtra a las de Dani");

// 8. Capacidad: limit corta a las que caben en su día.
ok(pickTodayCalls(opps, tr, { owner: "Dani", limit: 1 }).length === 1, "limit = capacidad/día");

// 9. today: una agendada para el futuro sale del foco; la de hoy/vencida sube.
const tr2 = {
  o1: { assignedTo: "Dani", scheduledFor: "2026-06-10" }, // futuro
  o3: { assignedTo: "Dani", scheduledFor: "2026-06-01" }, // hoy
};
const todayCalls = pickTodayCalls(opps, tr2, { owner: "Dani", today: "2026-06-01", limit: 8 });
ok(todayCalls.length === 1 && todayCalls[0].id === "o3", "agenda futura se reserva; solo entra la de hoy");

// 10. Sin owner/today: comportamiento clásico intacto (no rompe hoy.test).
ok(pickTodayCalls(opps, {}, { limit: 2 }).length === 2, "sin agenda, sigue funcionando igual");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
