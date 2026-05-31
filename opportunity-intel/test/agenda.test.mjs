// Tests de agenda.js: items personales/comunes, vinculación a tareas del
// Estudio, tomar items comunes, fechas/vencimiento y agrupación por día.
import {
  COMMON, createAgendaItem, fromEngagementTask, toggleDone, setDate, claim,
  itemsFor, isOverdue, groupByDay, addDays, today, normDate,
} from "../src/agenda.js";

let passed = 0, failed = 0;
function ok(c, m) { if (c) { passed++; } else { failed++; console.error("FAIL:", m); } }
function eq(a, b, m) { ok(a === b, `${m} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// ---- crear ------------------------------------------------------------------
{
  const i = createAgendaItem({ title: "Llamar a Javi", owner: "Pablo", date: "2026-06-01", by: "Pablo" });
  ok(i.id.startsWith("ag_"), "id con prefijo");
  eq(i.owner, "Pablo", "dueño");
  eq(i.date, "2026-06-01", "fecha normalizada");
  eq(i.done, false, "nace sin hacer");
  eq(createAgendaItem({}).owner, COMMON, "por defecto va a la agenda común");
  eq(createAgendaItem({ title: "x", date: "no" }).date, null, "fecha inválida → null");
}

// ---- vincular tarea del Estudio --------------------------------------------
{
  const eng = { id: "e1", title: "Connect" };
  const task = { id: "t1", title: "Maquetar" };
  const i = fromEngagementTask(eng, task, { owner: "Javi", date: "2026-06-02", by: "Javi" });
  eq(i.link.engagementId, "e1", "vincula al proyecto");
  eq(i.link.taskId, "t1", "vincula a la tarea");
  eq(i.title, "Maquetar", "toma el título de la tarea");
  let threw = false; try { fromEngagementTask(null, null); } catch { threw = true; }
  ok(threw, "datos faltantes lanza");
}

// ---- hecho / fecha / tomar --------------------------------------------------
{
  let i = createAgendaItem({ title: "x", owner: COMMON });
  i = toggleDone(i); ok(i.done && i.doneAt, "marca hecho con sello");
  i = toggleDone(i); ok(!i.done && !i.doneAt, "desmarca y limpia sello");
  i = setDate(i, "2026-07-01"); eq(i.date, "2026-07-01", "fija fecha");
  i = claim(i, "Pablo"); eq(i.owner, "Pablo", "tomar común → persona (vincula agendas)");
}

// ---- lecturas: itemsFor / overdue / group ----------------------------------
{
  const ref = "2026-06-10";
  const items = [
    createAgendaItem({ title: "atrasada", owner: "Pablo", date: "2026-06-01" }),
    createAgendaItem({ title: "hoy", owner: "Pablo", date: ref }),
    createAgendaItem({ title: "mañana", owner: "Pablo", date: addDays(ref, 1) }),
    createAgendaItem({ title: "futuro", owner: "Pablo", date: "2026-06-20" }),
    createAgendaItem({ title: "sin fecha", owner: "Pablo" }),
    createAgendaItem({ title: "de Javi", owner: "Javi", date: ref }),
  ];
  eq(itemsFor(items, "Pablo").length, 5, "filtra por dueño");
  ok(isOverdue(items[0], ref), "atrasada vence");
  ok(!isOverdue(items[1], ref), "hoy no vence");
  const done = toggleDone(items[0]);
  ok(!isOverdue(done, ref), "hecha no vence aunque sea pasada");

  const groups = groupByDay(itemsFor(items, "Pablo"), ref);
  eq(groups[0].key, "overdue", "primero atrasado");
  eq(groups[1].key, "today", "luego hoy");
  eq(groups[2].key, "tomorrow", "luego mañana");
  eq(groups[groups.length - 1].key, "none", "sin fecha al final");
}

// ---- helpers de fecha -------------------------------------------------------
{
  eq(addDays("2026-06-30", 1), "2026-07-01", "addDays cruza mes");
  eq(normDate(new Date("2026-01-15T10:00:00Z")), "2026-01-15", "normaliza Date");
  ok(/^\d{4}-\d{2}-\d{2}$/.test(today()), "today con formato ISO corto");
}

console.log(`agenda.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
