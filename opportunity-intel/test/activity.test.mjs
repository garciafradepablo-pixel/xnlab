// Tests del feed de actividad (derivado de engagements + CRM): orden temporal,
// tipos de evento, resolución de nombre de lead, límite y descarte de ruido.
import { buildActivity } from "../src/activity.js";

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

{
  eq(buildActivity({}).length, 0, "sin datos → feed vacío");
}

console.log(`activity.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
