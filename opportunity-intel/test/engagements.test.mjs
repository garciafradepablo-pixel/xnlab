// Tests de la fase Entregar: módulo puro engagements.js + roundtrip en store.js
// (persistencia y fusión por id vía export/importState, igual que el resto del
// estado compartido). Cero red, cero navegador.
//
// store.js captura localStorage al cargar, así que montamos un shim + sesión de
// escritura ANTES de importarlo dinámicamente.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();
globalThis.localStorage.setItem("oi:users", JSON.stringify([{ name: "Tester", color: "#4a9eff", role: "admin", token: "tok-admin" }]));
globalThis.localStorage.setItem("oi:session", JSON.stringify({ name: "Tester", role: "admin", token: "tok-admin" }));

import {
  createEngagement, engagementFromLead, addTask, setTaskState, removeTask,
  addLog, setStatus, progress, openTasks, isComplete,
} from "../src/engagements.js";

const store = await import("../src/store.js");

let passed = 0, failed = 0;
function ok(cond, msg) { if (cond) { passed++; } else { failed++; console.error("FAIL:", msg); } }
function eq(a, b, msg) { ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// ---- createEngagement: por defecto interno, válido y vacío -------------------
{
  const e = createEngagement({ title: "Connect", by: "Pablo" });
  ok(e.id && e.id.startsWith("eng_"), "id con prefijo eng_");
  eq(e.kind, "internal", "kind por defecto interno");
  eq(e.leadId, null, "sin lead");
  eq(e.status, "active", "arranca activo");
  eq(e.tasks.length, 0, "sin tareas");
  eq(e.log.length, 0, "sin bitácora");
  eq(e.createdBy, "Pablo", "firma de creación");
  eq(createEngagement({}).title, "Proyecto sin título", "título por defecto");
}

// ---- engagementFromLead: cliente, atado al lead, con tarea de arranque -------
{
  const lead = { id: "L1", company: "La Casa del Limonero", sector: "hospitality" };
  const e = engagementFromLead(lead, { by: "Javi", serviceLabel: "Web + Funnel" });
  eq(e.kind, "client", "lead firmado → engagement de cliente");
  eq(e.leadId, "L1", "atado al lead");
  eq(e.sector, "hospitality", "hereda el sector del lead");
  eq(e.title, "La Casa del Limonero — Web + Funnel", "título con empresa + servicio");
  eq(e.tasks.length, 1, "siembra una tarea de arranque");
  eq(e.tasks[0].title, "Kickoff y discovery", "tarea de kickoff");
  let threw = false;
  try { engagementFromLead(null); } catch { threw = true; }
  ok(threw, "lead inválido lanza");
}

// ---- tareas: añadir, cambiar estado, sellar doneAt, eliminar -----------------
{
  let e = createEngagement({ title: "X" });
  e = addTask(e, "Definir alcance", "Pablo");
  e = addTask(e, "Maquetar");
  eq(e.tasks.length, 2, "dos tareas");
  eq(e.tasks[0].state, "todo", "nace en todo");
  eq(e.tasks[0].assignee, "Pablo", "responsable asignado");

  const id = e.tasks[0].id;
  e = setTaskState(e, id, "doing");
  eq(e.tasks[0].state, "doing", "pasa a en curso");
  ok(e.tasks[0].doneAt == null, "doing no sella doneAt");

  e = setTaskState(e, id, "done");
  eq(e.tasks[0].state, "done", "pasa a hecho");
  ok(!!e.tasks[0].doneAt, "done sella doneAt");

  e = setTaskState(e, id, "todo");
  ok(e.tasks[0].doneAt == null, "salir de done limpia doneAt");

  const before = e.tasks.length;
  e = setTaskState(e, "no-existe", "done");
  eq(e.tasks.length, before, "id inexistente no rompe");
  e = setTaskState(e, id, "inventado");
  eq(e.tasks[0].state, "todo", "estado inválido se ignora");

  e = removeTask(e, id);
  eq(e.tasks.length, 1, "elimina una tarea");
}

// ---- progress / openTasks / isComplete --------------------------------------
{
  let e = createEngagement({ title: "X" });
  eq(progress(e).pct, 0, "sin tareas → 0%");
  ok(!isComplete(e), "vacío no está completo");

  e = addTask(e, "a"); e = addTask(e, "b"); e = addTask(e, "c"); e = addTask(e, "d");
  eq(progress(e).total, 4, "cuatro tareas");
  e = setTaskState(e, e.tasks[0].id, "done");
  eq(progress(e).pct, 25, "1/4 = 25%");
  eq(openTasks(e).length, 3, "tres abiertas");

  for (const t of e.tasks) e = setTaskState(e, t.id, "done");
  eq(progress(e).pct, 100, "todas hechas = 100%");
  ok(isComplete(e), "todas hechas → completo");
}

// ---- bitácora: más reciente primero, vacío se ignora ------------------------
{
  let e = createEngagement({ title: "X" });
  e = addLog(e, "Primera sesión", "Pablo");
  e = addLog(e, "   ", "Pablo"); // vacío
  e = addLog(e, "Segunda sesión", "Javi");
  eq(e.log.length, 2, "ignora notas vacías");
  eq(e.log[0].note, "Segunda sesión", "más reciente primero");
  eq(e.log[0].by, "Javi", "firma de la entrada");
}

// ---- setStatus valida el enum ----------------------------------------------
{
  let e = createEngagement({ title: "X" });
  e = setStatus(e, "done");
  eq(e.status, "done", "marca entregado");
  e = setStatus(e, "inventado");
  eq(e.status, "done", "estado inválido se ignora");
}

// ---- store: persistencia + upsert + borrado ---------------------------------
{
  store.resetAll();
  eq(store.getEngagements().length, 0, "store arranca vacío");
  const e = store.saveEngagement(createEngagement({ title: "Connect", by: "Pablo" }));
  eq(store.getEngagements().length, 1, "guarda uno");
  ok(!!e.updatedAt, "sella updatedAt al guardar");
  eq(store.getEngagement(e.id).title, "Connect", "lo recupera por id");

  store.saveEngagement({ ...e, title: "Connect v2" });
  eq(store.getEngagements().length, 1, "upsert por id, no duplica");
  eq(store.getEngagement(e.id).title, "Connect v2", "actualiza en sitio");

  store.removeEngagement(e.id);
  eq(store.getEngagements().length, 0, "elimina por id");
}

// ---- store: roundtrip export/import (el canal de sync Pablo↔Javi) -----------
{
  store.resetAll();
  const a = store.saveEngagement(createEngagement({ title: "A interno", by: "Pablo" }));
  const json = store.exportState();
  ok(json.includes("engagements"), "exportState incluye engagements");

  // Otro "navegador" parte de cero e importa.
  store.resetAll();
  eq(store.getEngagements().length, 0, "navegador limpio");
  const r = store.importState(json);
  ok(r.ok, "import ok");
  eq(store.getEngagements().length, 1, "importa el engagement");
  eq(store.getEngagement(a.id).title, "A interno", "mismo contenido");

  // Merge no destructivo: una versión más reciente gana; una más vieja no pisa.
  const newer = { ...store.getEngagement(a.id), title: "A editado", updatedAt: "2999-01-01T00:00:00.000Z" };
  store.importState(JSON.stringify({ _format: "opportunity-intel/state", engagements: [newer] }));
  eq(store.getEngagement(a.id).title, "A editado", "lo más reciente gana");
  const older = { ...store.getEngagement(a.id), title: "A viejo", updatedAt: "2000-01-01T00:00:00.000Z" };
  store.importState(JSON.stringify({ _format: "opportunity-intel/state", engagements: [older] }));
  eq(store.getEngagement(a.id).title, "A editado", "lo viejo no pisa lo nuevo");
}

console.log(`engagements.test: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
