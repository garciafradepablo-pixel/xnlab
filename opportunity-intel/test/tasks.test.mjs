// =============================================================================
// tasks.test.mjs — Tareas que un admin asigna a cada trabajador. Verifica el
// alta, el filtro por trabajador, el marcar hecho/pendiente, el borrado con
// lápida (oculto pero propagable) y el merge "lo más reciente por id gana" del
// estado compartido. Sin red: scheduleSync es no-op fuera de la app.
// =============================================================================

import * as store from "../src/store.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("tasks.test.mjs");

// Pizarra limpia.
store.importState(JSON.stringify({ _format: "opportunity-intel/state", tasks: [] }), { replace: true });

// — Alta y filtro por trabajador —
const t1 = store.addTask({ to: "Javi", title: "Llamar a la clínica Ourense" });
const t2 = store.addTask({ to: "PABLO", title: "Cerrar propuesta XN" });
ok(t1 && t2, "addTask crea tareas con id");
ok(store.getTasksFor("javi").length === 1, "getTasksFor filtra por trabajador (sin distinguir mayúsculas)");
ok(store.getTasksFor("Pablo")[0].title === "Cerrar propuesta XN", "la tarea correcta llega al trabajador");
ok(store.addTask({ to: "Javi", title: "" }) === null, "addTask exige título");

// — Marcar hecha / pendiente —
store.setTaskDone(t1.id, true);
ok(store.getTasksFor("Javi")[0].done === true, "setTaskDone marca hecha");
store.setTaskDone(t1.id, false);
ok(store.getTasksFor("Javi")[0].done === false, "setTaskDone vuelve a pendiente");

// — Borrado con lápida: desaparece de las vistas pero sigue exportándose —
store.removeTask(t2.id);
ok(store.getTasksFor("Pablo").length === 0, "removeTask oculta la tarea");
ok(store.getTasks().length === 1, "getTasks no muestra lápidas");
const exported = JSON.parse(store.exportState());
ok(Array.isArray(exported.tasks) && exported.tasks.some((t) => t.id === t2.id && t.deleted),
  "exportState incluye la lápida para propagar el borrado");

// — Merge: lo más reciente por id gana, y la lápida entrante borra —
const remote = {
  _format: "opportunity-intel/state",
  tasks: [
    { id: t1.id, to: "Javi", title: "Llamar a la clínica Ourense (actualizado)", done: true, updatedAt: "2999-01-01T00:00:00.000Z" },
    { id: "task_new_remote", to: "Javi", title: "Tarea creada en otro dispositivo", done: false, updatedAt: "2999-01-01T00:00:00.000Z" },
  ],
};
store.importState(JSON.stringify(remote), { replace: false });
const javi = store.getTasksFor("Javi");
ok(javi.find((t) => t.id === t1.id)?.title.includes("actualizado"), "el merge adopta la versión más reciente por updatedAt");
ok(javi.some((t) => t.id === "task_new_remote"), "el merge incorpora tareas nuevas de otro dispositivo");

// Una versión entrante MÁS VIEJA no pisa la local más nueva.
store.setTaskDone(t1.id, false); // local ahora es lo más nuevo
store.importState(JSON.stringify({ _format: "opportunity-intel/state", tasks: [
  { id: t1.id, to: "Javi", title: "viejo", done: true, updatedAt: "2000-01-01T00:00:00.000Z" },
] }), { replace: false });
ok(store.getTasksFor("Javi").find((t) => t.id === t1.id)?.done === false,
  "una versión entrante más vieja no pisa la local más nueva");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
