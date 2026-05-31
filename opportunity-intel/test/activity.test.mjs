// Tests del feed de actividad (derivado de engagements + CRM): orden temporal,
// tipos de evento, resolución de nombre de lead, límite y descarte de ruido.
import { buildActivity, weeklyDigest } from "../src/activity.js";
let passed = 0, failed = 0;
function ok(c, m) { if (c) { passed++; } else { failed++; console.error("FAIL:", m); } }
function eq(a, b, m) { ok(a === b, `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

const engagements = [
  {
    id: "e1", title: "Connect interno", createdAt: "2026-05-01T10:00:00Z", createdBy: "Pablo",
    log: [
      { at: "2026-05-03T09:00:00Z", by: "Javi", note: "Cableado del Estudio", commit: null },
      { at: "2026-05-04T09:00:00Z", by: "Pablo", note: "", commit: { short: "ee2d7ec", hash: "ee2d7ec" } },
    ],
    milestones: [
      { id: "m1", title: "Entrega 1", doneAt: "2026-05-05T12:00:00Z" },
      { id: "m2", title: "Pendiente", doneAt: null },
    ],
  },
];
const tracking = {
  L1: { status: "won", by: "Pablo", updatedAt: "2026-05-06T08:00:00Z" },
  L2: { status: "not_called", by: "", updatedAt: "2026-05-02T08:00:00Z" }, // ruido: se descarta
};
const leadName = (id) => ({ L1: "La Casa del Limonero" }[id] || "");

{
  const feed = buildActivity({ engagements, tracking, leadName });
  // Eventos esperados: eng_new, 2 log, 1 ms (m2 no), 1 crm (L2 no) = 5
  eq(feed.length, 5, "reúne los eventos con firma/fecha y descarta el ruido");
  eq(feed[0].kind, "crm", "lo más reciente primero (CRM 06-may)");
  ok(feed[0].text.includes("La Casa del Limonero"), "resuelve el nombre del lead");
  ok(feed[0].text.includes("Firmado"), "traduce el estado del CRM");
  ok(feed.some((x) => x.kind === "ms" && x.text.includes("Entrega 1")), "incluye el hito cumplido");
  ok(!feed.some((x) => x.text.includes("Pendiente")), "no incluye hito sin cumplir");
  const commitEvt = feed.find((x) => x.commit);
  ok(commitEvt && commitEvt.note.includes("ee2d7ec"), "nota de commit cuando no hay texto");

  // orden estrictamente descendente por fecha
  let sorted = true;
  for (let i = 1; i < feed.length; i++) if (feed[i - 1].at < feed[i].at) sorted = false;
  ok(sorted, "orden temporal descendente");
}

{
  const feed = buildActivity({ engagements, tracking, leadName, limit: 2 });
  eq(feed.length, 2, "respeta el límite");
}

// ---- retos de pensamiento crítico en el feed --------------------------------
{
  const growth = {
    Pablo: { owner: "Pablo", critical: { level: 2, log: [
      { id: "c1", at: "2026-05-07T10:00:00Z", kind: "assumption", note: "Asumí el alcance sin confirmarlo" },
      { id: "c2", at: "2026-05-08T10:00:00Z", kind: "contrarian", note: "" },
    ] } },
    Javi: { owner: "Javi", critical: { log: [{ id: "c3", at: "2026-05-09T10:00:00Z", kind: "evidence", note: "Pedí datos antes de decidir" }] } },
  };
  const feed = buildActivity({ engagements: [], tracking: {}, growth });
  eq(feed.length, 3, "incluye los retos de crítica de todo el equipo");
  ok(feed.every((x) => x.kind === "critical"), "todos marcados como crítica");
  ok(feed[0].by === "Javi", "firmado por quien lo ejercitó, más reciente primero");
  ok(feed[0].text.includes("pensamiento crítico"), "texto reconocible");
  ok(feed.some((x) => x.text.includes("Supuesto cuestionado")), "traduce el tipo de reto");
}

{
  eq(buildActivity({}).length, 0, "sin datos → feed vacío");
}

// ---- resumen semanal --------------------------------------------------------
{
  const NOW = Date.parse("2026-05-10T12:00:00Z");
  const d = (daysAgo) => new Date(NOW - daysAgo * 86400000).toISOString();
  const feed = [
    { at: d(1), by: "Pablo", kind: "critical" },
    { at: d(2), by: "Pablo", kind: "log" },
    { at: d(3), by: "Javi", kind: "critical" },
    { at: d(6), by: "Javi", kind: "crm" },
    { at: d(10), by: "Pablo", kind: "critical" }, // fuera de la ventana de 7 días
  ];
  const w = weeklyDigest(feed, NOW);
  eq(w.total, 4, "cuenta solo los últimos 7 días");
  eq(w.critical, 2, "dos retos de crítica esta semana");
  eq(w.byKind.critical, 2, "desglose por tipo");
  eq(w.byPerson.Pablo.total, 2, "total por persona (dentro de la ventana)");
  eq(w.byPerson.Javi.critical, 1, "crítica por persona");
  eq(weeklyDigest([], NOW).total, 0, "feed vacío → resumen en cero");
}

console.log(`activity.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
