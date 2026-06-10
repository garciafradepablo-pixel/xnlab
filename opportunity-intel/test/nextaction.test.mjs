// nextaction.test.mjs — Próxima mejor acción del lead (lógica pura).

const { getNextBestAction, NEXT_ACTIONS, resolveNextActionIntent } = await import("../src/nextaction.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("nextaction.test.mjs");

const lead = { id: "l1", scores: {} };
const A = (status, calls = [], tasks = [], extra = {}) =>
  getNextBestAction(lead, calls, tasks, { status, today: "2026-06-10", ...extra });

// resueltos
ok(A("won").action === "wait", "ganado → esperar (en cliente)");
ok(A("rejected").action === "wait", "rechazado → esperar");
ok(A("wrong_fit").action === "wait", "mal encaje → esperar");

// seguimiento agendado que toca manda sobre todo lo demás
const dueTasks = [{ type: "follow_up", status: "todo", dueDate: "2026-06-09", note: "Llamar con decisor" }];
ok(A("called", [], dueTasks).action === "follow_up", "seguimiento vencido → hacer seguimiento");
const futureTasks = [{ type: "follow_up", status: "todo", dueDate: "2026-06-20" }];
ok(A("not_called", [], futureTasks).action === "call", "seguimiento futuro no adelanta la primera llamada");
const doneTask = [{ type: "follow_up", status: "done", dueDate: "2026-06-01" }];
ok(A("not_called", [], doneTask).action === "call", "seguimiento hecho no cuenta");

// embudo
ok(A("proposal_sent").action === "follow_up", "propuesta enviada → seguimiento de cierre");
ok(A("interested").action === "proposal", "interesado → enviar propuesta");
ok(A("meeting_booked").action === "wait", "reunión agendada → esperar/preparar");
ok(A("not_called").action === "call", "sin contactar → llamar");
ok(A("no_answer").action === "call", "no contesta → reintentar (llamar)");
ok(A("follow_up").action === "follow_up", "hilo abierto → seguimiento");

// enriquecer antes de llamar
const enrichLead = { id: "l2", scores: { recommendation: "enrich" } };
ok(getNextBestAction(enrichLead, [], [], { status: "not_called" }).action === "gather_info", "motor pide enriquecer → pedir info");

// objeción de información tras llamar → pedir info
const calledInfo = [{ at: "2026-06-05", result: "called", analysis: { objections: ["Mándame info"] } }];
ok(A("called", calledInfo).action === "gather_info", "objeción de info tras llamar → pedir más información");

// muchos toques sin avance → cerrar como perdido
const many = [{ at: "1" }, { at: "2" }, { at: "3" }];
ok(A("no_answer", many).action === "close_lost", "3+ toques sin avance → cerrar como perdido");
// pero si avanzó, no se cierra aunque haya muchas llamadas
ok(A("interested", many).action === "proposal", "con avance, las llamadas no fuerzan el cierre");

// forma de salida
const r = A("not_called");
ok(r.label === NEXT_ACTIONS.call && typeof r.why === "string" && r.why.length > 0, "devuelve {action,label,why}");

// --- resolveNextActionIntent: la acción se vuelve operativa ---------------------
const L = { id: "L1", company: "Bodega Norte", scores: {} };
const R = (action, calls = [], tasks = [], ctx = {}) =>
  resolveNextActionIntent(action, L, calls, tasks, { status: "not_called", today: "2026-06-10", ...ctx });

// llamar → abrir lead
ok(R("call").kind === "open_lead", "llamar → open_lead");

// enviar propuesta → confirmar cambio a Propuesta enviada
const prop = R("proposal", [], [], { status: "interested" });
ok(prop.kind === "confirm_status_change" && prop.statusTarget === "proposal_sent" && prop.requiresConfirm === true, "proposal → confirm a proposal_sent");
// no-degradar: si ya está en propuesta o más, no retrocede
ok(R("proposal", [], [], { status: "won" }).kind === "noop", "proposal sobre won → noop (no-degradar)");
ok(R("proposal", [], [], { status: "proposal_sent" }).kind === "noop", "proposal sobre proposal_sent → noop");

// follow-up con tarea existente → abrir esa tarea (sin duplicar)
const existingTasks = [{ id: "fu_x", type: "follow_up", status: "todo", leadId: "L1" }];
const fuOpen = R("follow_up", [], existingTasks, { status: "called" });
ok(fuOpen.kind === "open_task" && fuOpen.existingTaskId === "fu_x", "follow_up con tarea → open_task");
// la tarea hecha NO cuenta como pendiente → crea borrador
const doneTasks = [{ id: "fu_x", type: "follow_up", status: "done", leadId: "L1" }];
ok(R("follow_up", [], doneTasks).kind === "create_task", "follow_up con tarea hecha → create_task");

// follow-up sin tarea → borrador de tarea con id determinista
const fuNew = R("follow_up", [{ at: "2026-06-05", analysis: { nextStep: "Llamar al decisor" } }]);
ok(fuNew.kind === "create_task" && fuNew.taskDraft.id === "fu_manual_L1", "follow_up sin tarea → create_task draft");
ok(fuNew.taskDraft.type === "follow_up" && fuNew.taskDraft.leadId === "L1", "draft bien formado");
ok(fuNew.taskDraft.note === "Llamar al decisor", "draft toma el siguiente paso de la última llamada");

// esperar → noop con motivo
const w = R("wait");
ok(w.kind === "noop" && typeof w.reason === "string" && w.reason.length > 0, "wait → noop con motivo");

// cerrar perdido → confirmar cambio a Rechazado
const cl = R("close_lost", [], [], { status: "no_answer" });
ok(cl.kind === "confirm_status_change" && cl.statusTarget === "rejected" && cl.requiresConfirm === true, "close_lost → confirm a rejected");

// pedir más información → abrir lead
ok(R("gather_info").kind === "open_lead", "gather_info → open_lead");

// revisar manualmente → manual_review
ok(R("review").kind === "manual_review", "review → manual_review");

// robustez: sin llamadas ni tareas no rompe
ok(R("follow_up").kind === "create_task" && resolveNextActionIntent("call", L).kind === "open_lead", "sin calls/tasks no rompe");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
