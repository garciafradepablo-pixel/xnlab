// store-calls.test.mjs — Colección `calls` y dedupe de tareas en el store
// (persistencia compartida). Corre en Node sobre el fallback en memoria.

const store = await import("../src/store.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("store-calls.test.mjs");

// --- calls: upsert / filtrar por lead / borrar ---
store.upsertCall({ id: "c1", leadId: "L1", at: "2026-06-01", transcript: "x" });
store.upsertCall({ id: "c2", leadId: "L1", at: "2026-06-05" });
store.upsertCall({ id: "c3", leadId: "L2", at: "2026-06-03" });
ok(store.getCalls().length === 3, "upsertCall añade llamadas");
ok(!!store.getCalls().find((c) => c.id === "c1").updatedAt, "sella updatedAt");

const l1 = store.getLeadCalls("L1");
ok(l1.length === 2 && l1[0].id === "c2", "getLeadCalls filtra por lead y ordena por fecha desc");
ok(store.getLeadCalls("nadie").length === 0, "lead sin llamadas → vacío");

ok(store.removeCall("c1") === true && store.getCalls().length === 2, "removeCall borra");
ok(store.removeCall("inexistente") === false, "removeCall de id raro → false");

// --- upsert por id NO duplica (la garantía del follow-up determinista) ---
store.upsertTask({ id: "fu_c2", leadId: "L1", type: "follow_up", dueDate: "2026-06-10", status: "todo" });
store.upsertTask({ id: "fu_c2", leadId: "L1", type: "follow_up", dueDate: "2026-06-11", status: "todo" });
const fus = store.getTasks().filter((t) => t.id === "fu_c2");
ok(fus.length === 1, "guardar/editar la misma tarea (mismo id) no duplica");
ok(fus[0].dueDate === "2026-06-11", "el upsert actualiza los campos");

// --- export incluye las llamadas ---
const exported = JSON.parse(store.exportState());
ok(Array.isArray(exported.calls) && exported.calls.length === 2, "exportState serializa la colección calls");

// --- import: merge por id, gana el updatedAt más reciente (no pisa a ciegas) ---
store.importState({ _format: "opportunity-intel/state", calls: [{ id: "c2", leadId: "L1", at: "2026-06-05", updatedAt: "2030-01-01", note: "newer" }] });
ok(store.getCalls().find((c) => c.id === "c2").note === "newer", "import más reciente gana");
store.importState({ _format: "opportunity-intel/state", calls: [{ id: "c2", leadId: "L1", updatedAt: "2000-01-01", note: "older" }] });
ok(store.getCalls().find((c) => c.id === "c2").note === "newer", "import más antiguo NO pisa lo nuevo");
ok(store.getCalls().find((c) => c.id === "c4") === undefined, "no aparecen llamadas fantasma");
store.importState({ _format: "opportunity-intel/state", calls: [{ id: "c4", leadId: "L3", updatedAt: "2026-06-09" }] });
ok(!!store.getCalls().find((c) => c.id === "c4"), "import añade llamadas nuevas");

// --- compatibilidad: estado viejo sin `calls` no rompe ni borra lo existente ---
const before = store.getCalls().length;
store.importState({ _format: "opportunity-intel/state", tracking: { L1: { status: "interested" } } });
ok(store.getCalls().length === before, "import de estado viejo (sin calls) no toca las llamadas");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
