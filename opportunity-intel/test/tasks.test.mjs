// tasks.test.mjs — Tareas del equipo (lógica pura).

const { STATUSES, STATUS_LABELS, nextStatus, isOpen, makeTask, sortTasks, countByStatus, groupByAssignee, openFor } =
  await import("../src/tasks.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("tasks.test.mjs");

// --- estados ---
ok(STATUSES.join(",") === "todo,doing,done", "tres estados en orden");
ok(STATUS_LABELS.doing === "Haciendo", "etiqueta legible de estado");
ok(nextStatus("todo") === "doing" && nextStatus("doing") === "done", "ciclo avanza");
ok(nextStatus("done") === "todo", "done vuelve a todo (ciclo cerrado)");
ok(nextStatus("basura") === "todo", "estado raro cae a todo");

// --- isOpen ---
ok(isOpen({ status: "todo" }) && isOpen({ status: "doing" }), "todo/doing están abiertas");
ok(!isOpen({ status: "done" }) && !isOpen(null), "done y nulo no están abiertas");

// --- makeTask ---
ok(makeTask({ title: "" }) === null, "sin título no hay tarea");
ok(makeTask({ title: "   " }) === null, "título solo espacios no vale");
const t1 = makeTask({ title: "  Llamar a Bodega X  ", assignee: "Dani", by: "Pablo" });
ok(t1.title === "Llamar a Bodega X", "título recortado");
ok(t1.assignee === "Dani" && t1.by === "Pablo", "autor y responsable guardados");
ok(t1.status === "todo" && !!t1.id && !!t1.createdAt, "nace en todo, con id y fecha");
ok(makeTask({ title: "x", assignee: "  " }).assignee === null, "responsable vacío → null");
ok(makeTask({ title: "a".repeat(400) }).title.length === 280, "título se trunca a 280");

// --- sortTasks: abiertas antes que hechas, recientes arriba ---
const sorted = sortTasks([
  { id: "a", status: "done", updatedAt: "2026-01-03" },
  { id: "b", status: "todo", updatedAt: "2026-01-01" },
  { id: "c", status: "doing", updatedAt: "2026-01-02" },
]);
ok(sorted.map((t) => t.id).join("") === "cba", "orden: abiertas (recientes) y luego hechas");

// --- countByStatus ---
const counts = countByStatus([
  { status: "todo" }, { status: "todo" }, { status: "doing" }, { status: "done" },
]);
ok(counts.todo === 2 && counts.doing === 1 && counts.done === 1, "cuenta por estado");
ok(counts.open === 3 && counts.total === 4, "open = todo+doing; total = todas");

// --- groupByAssignee ---
const users = [{ name: "Pablo" }, { name: "Dani" }];
const tasks = [
  { id: "1", assignee: "Dani", status: "todo", updatedAt: "2026-01-02" },
  { id: "2", assignee: "Dani", status: "done", updatedAt: "2026-01-01" },
  { id: "3", assignee: null, status: "todo", updatedAt: "2026-01-01" },
];
const groups = groupByAssignee(tasks, users);
ok(groups[0].name === "Pablo" && groups[0].tasks.length === 0, "siembra a todo el equipo, aunque sin tareas");
const dani = groups.find((g) => g.name === "Dani");
ok(dani.counts.open === 1 && dani.counts.total === 2, "agrupa y cuenta por responsable");
ok(groups[groups.length - 1].name === null, "sin asignar va al final");
ok(groupByAssignee(tasks, users).find((g) => g.name === null).tasks.length === 1, "recoge las sin asignar");

// case-insensitive del responsable
const ci = groupByAssignee([{ id: "x", assignee: "dani", status: "todo" }], [{ name: "Dani" }]);
ok(ci.find((g) => g.name === "Dani").tasks.length === 1, "responsable sin distinguir mayúsculas");

// --- openFor ---
const mine = openFor(tasks, "dani");
ok(mine.length === 1 && mine[0].id === "1", "openFor trae solo mis tareas abiertas");
ok(openFor(tasks, "nadie").length === 0, "openFor de un desconocido está vacío");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
