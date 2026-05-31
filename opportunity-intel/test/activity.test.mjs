// activity.test.mjs — Feed de actividad: lógica pura (verbos, descripción,
// orden, agrupado por día, tiempo relativo). Sin red.
// Shim mínimo de localStorage por la cadena de imports (auth.js).
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const { VERBS, verbMeta, makeEvent, describe, sortEvents, dayLabel, groupByDay, relativeTime } =
  await import("../src/activity.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("activity.test.mjs");

const NOW = Date.parse("2026-05-31T18:00:00.000Z");
const ago = (secs) => new Date(NOW - secs * 1000).toISOString();

// --- catálogo de verbos ---
ok(VERBS.task_done.glyph === "✓" && VERBS.file_up.glyph === "📎", "glifos de verbos");
ok(verbMeta("task_new").text === "creó la tarea", "frase de verbo conocido");
ok(verbMeta("zzz").glyph === "•", "verbo desconocido → respaldo neutro");

// --- makeEvent ---
ok(makeEvent({ verb: "" }) === null && makeEvent({}) === null, "sin verbo no hay evento");
const e1 = makeEvent({ actor: "  Pablo ", verb: "task_done", object: "  Llamar a Bodega X  " });
ok(e1.actor === "Pablo" && e1.verb === "task_done", "actor y verbo normalizados");
ok(e1.object === "Llamar a Bodega X" && !!e1.id && !!e1.at, "objeto recortado, id y fecha");
ok(makeEvent({ verb: "note", object: "   " }).object === null, "objeto vacío → null");
ok(makeEvent({ verb: "ai_run" }).object === null, "sin objeto → null, pero el evento existe");
ok(makeEvent({ verb: "note", object: "x".repeat(300) }).object.length === 160, "objeto se trunca a 160");

// --- describe ---
ok(describe({ actor: "Pablo", verb: "task_done", object: "Llamar a Bodega X" }) === "Pablo completó «Llamar a Bodega X»", "describe con objeto");
ok(describe({ actor: "Javi", verb: "file_up", object: "foto.png", meta: { folder: "Marketing" } }) === "Javi subió «foto.png» en Marketing", "describe con carpeta");
ok(describe({ actor: "Dani", verb: "ai_run" }) === "Dani el piloto capturó leads", "describe sin objeto");
ok(describe({ verb: "note", object: "algo" }).startsWith("Alguien anotó"), "actor ausente → 'Alguien'");
ok(describe(null) === "", "evento nulo → cadena vacía");

// --- sortEvents (acepta at o created_at) ---
const evs = [
  { verb: "note", object: "viejo", created_at: ago(7200) },
  { verb: "note", object: "nuevo", created_at: ago(60) },
  { verb: "note", object: "medio", created_at: ago(1800) },
];
const s = sortEvents(evs).map((e) => e.object);
ok(s[0] === "nuevo" && s[2] === "viejo", "más reciente primero (por created_at)");

// --- dayLabel ---
ok(dayLabel(ago(3600), NOW) === "Hoy", "hace una hora: Hoy");
ok(dayLabel(NOW - 26 * 3600 * 1000, NOW) === "Ayer", "ayer");
const old = dayLabel(NOW - 5 * 86400 * 1000, NOW);
ok(old !== "Hoy" && old !== "Ayer" && old.length > 0, "días atrás: fecha corta");
ok(dayLabel("no-fecha", NOW) === "—", "fecha inválida → guion");

// --- groupByDay ---
const groups = groupByDay([
  { verb: "note", object: "a", created_at: ago(30) },
  { verb: "note", object: "b", created_at: ago(120) },
  { verb: "note", object: "c", created_at: NOW - 26 * 3600 * 1000 }, // ayer
], NOW);
ok(groups.length === 2, "dos días distintos → dos grupos");
ok(groups[0].label === "Hoy" && groups[1].label === "Ayer", "día más reciente primero");
ok(groups[0].events.length === 2 && groups[0].events[0].object === "a", "dentro del día, más reciente arriba");
ok(groupByDay([{ verb: "note", created_at: "basura" }], NOW).length === 0, "eventos sin fecha válida se descartan");

// --- relativeTime ---
ok(relativeTime(ago(30), NOW) === "ahora mismo", "menos de un minuto");
ok(relativeTime(ago(600), NOW) === "hace 10 min", "minutos");
ok(relativeTime(ago(7200), NOW) === "hace 2 h", "pocas horas");
ok(/\d{1,2}[:.]\d{2}/.test(relativeTime(ago(36000), NOW)), "muchas horas → hora del reloj");

console.log(`  ${passed} ok, ${failed} fallos`);
if (failed) process.exit(1);
