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
  setTaskDue, addDependency, removeDependency, blockingDeps, isBlockedByDeps,
  addMilestone, toggleMilestone, removeMilestone,
  addAttachment, removeAttachment, isOverdue, overdueCount,
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

// ---- dependencias: bloquean el avance, sin ciclos ni auto-deps --------------
{
  let e = createEngagement({ title: "X" });
  e = addTask(e, "Diseño"); e = addTask(e, "Maqueta"); e = addTask(e, "Deploy");
  const [d, m, dep] = e.tasks.map((t) => t.id);

  e = addDependency(e, m, d); // maqueta depende de diseño
  eq(e.tasks[1].deps.length, 1, "registra la dependencia");
  e = addDependency(e, m, d); // duplicada
  eq(e.tasks[1].deps.length, 1, "no duplica dependencia");
  e = addDependency(e, m, m); // auto
  eq(e.tasks[1].deps.length, 1, "rechaza auto-dependencia");

  ok(isBlockedByDeps(e, e.tasks[1]), "maqueta bloqueada por diseño abierto");
  eq(blockingDeps(e, e.tasks[1]).length, 1, "una dependencia bloqueante");
  const before = e.tasks[1].state;
  e = setTaskState(e, m, "doing");
  eq(e.tasks[1].state, before, "no avanza mientras la dependencia sigue abierta");

  e = setTaskState(e, d, "done"); // cierro diseño
  ok(!isBlockedByDeps(e, e.tasks[1]), "desbloqueada al cerrar la dependencia");
  e = setTaskState(e, m, "done");
  eq(e.tasks[1].state, "done", "ahora sí avanza");

  // ciclo: deploy depende de maqueta; maqueta no puede depender de deploy
  e = addDependency(e, dep, m);
  e = addDependency(e, m, dep);
  ok(!e.tasks[1].deps.includes(dep), "rechaza dependencia que crearía un ciclo");

  e = removeDependency(e, dep, m);
  eq(e.tasks[2].deps.length, 0, "quita la dependencia");

  // al borrar una tarea, se limpia de las deps ajenas
  let e2 = createEngagement({ title: "Y" });
  e2 = addTask(e2, "A"); e2 = addTask(e2, "B");
  const [aid, bid] = e2.tasks.map((t) => t.id);
  e2 = addDependency(e2, bid, aid);
  e2 = removeTask(e2, aid);
  eq(e2.tasks[0].deps.length, 0, "borrar A la quita de las deps de B");
}

// ---- fechas y vencimiento ---------------------------------------------------
{
  let e = createEngagement({ title: "X" });
  e = addTask(e, "Entrega");
  const id = e.tasks[0].id;
  e = setTaskDue(e, id, "2026-01-15");
  eq(e.tasks[0].due, "2026-01-15", "fija la fecha");
  ok(isOverdue(e.tasks[0], "2026-02-01"), "vencida si hoy es posterior");
  ok(!isOverdue(e.tasks[0], "2026-01-01"), "no vencida si hoy es anterior");
  e = setTaskState(e, id, "done");
  ok(!isOverdue(e.tasks[0], "2026-02-01"), "una tarea hecha no está vencida");
  e = setTaskDue(e, id, null);
  eq(e.tasks[0].due, null, "limpia la fecha");
  eq(setTaskDue(e, id, "no-fecha").tasks[0].due, null, "fecha inválida → null");
}

// ---- hitos ------------------------------------------------------------------
{
  let e = createEngagement({ title: "X" });
  e = addMilestone(e, "Entrega 1", "2026-03-01");
  e = addMilestone(e, "Kickoff", "2026-01-10");
  eq(e.milestones.length, 2, "dos hitos");
  eq(e.milestones[0].title, "Kickoff", "ordenados por fecha");
  e = addMilestone(e, "   "); // vacío
  eq(e.milestones.length, 2, "ignora hito sin título");

  const id = e.milestones[0].id;
  e = toggleMilestone(e, id);
  ok(!!e.milestones[0].doneAt, "marca el hito cumplido");
  ok(!isOverdue(e.milestones[0], "2027-01-01"), "hito cumplido no vence");
  e = toggleMilestone(e, id);
  ok(!e.milestones[0].doneAt, "lo vuelve a abrir");
  ok(isOverdue(e.milestones[0], "2027-01-01"), "hito abierto y pasado → vencido");

  eq(overdueCount(e, "2027-01-01"), 2, "cuenta los dos hitos vencidos");
  e = removeMilestone(e, id);
  eq(e.milestones.length, 1, "elimina un hito");
}

// ---- adjuntos (enlaces) -----------------------------------------------------
{
  let e = createEngagement({ title: "X" });
  e = addAttachment(e, "Brief en Drive", "https://drive.example/brief", "Pablo");
  eq(e.attachments.length, 1, "añade un adjunto-enlace");
  eq(e.attachments[0].label, "Brief en Drive", "guarda la etiqueta");
  e = addAttachment(e, "", "https://x.example/y");
  eq(e.attachments[1].label, "https://x.example/y", "sin etiqueta usa la URL");
  e = addAttachment(e, "Malo", "no-es-url");
  eq(e.attachments.length, 2, "rechaza URL no http(s)");
  e = removeAttachment(e, e.attachments[0].id);
  eq(e.attachments.length, 1, "elimina un adjunto");
}

// ---- bitácora con commit ----------------------------------------------------
{
  let e = createEngagement({ title: "X" });
  e = addLog(e, "Cableado del Estudio", "Javi", { commit: { hash: "ee2d7ec1234", url: "https://github.com/x/y/commit/ee2d7ec1234" } });
  eq(e.log[0].commit.short, "ee2d7ec", "acorta el hash a 7");
  ok(e.log[0].commit.url.includes("commit"), "conserva el enlace");
  e = addLog(e, "", "Javi", { commit: { hash: "abcdef0" } }); // solo commit, sin nota
  eq(e.log.length, 2, "permite entrada de solo-commit");
  eq(e.log[0].commit.url, "", "url no http(s) se descarta");
  e = addLog(e, "nota normal", "Pablo");
  eq(e.log[0].commit, null, "nota sin commit → commit null");
  const n = e.log.length;
  e = addLog(e, "  ", "Pablo", { commit: { hash: "zzz" } }); // sin nota y hash inválido
  eq(e.log.length, n, "sin nota y commit inválido → no añade");
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
