// nextaction.test.mjs — Próxima mejor acción del lead (lógica pura).

const { getNextBestAction, NEXT_ACTIONS } = await import("../src/nextaction.js");

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

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
