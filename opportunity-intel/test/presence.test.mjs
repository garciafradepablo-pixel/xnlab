// presence.test.mjs — Presencia del equipo: lógica pura (estado efectivo,
// frescura del latido, mesa fusionada, orden, resumen, tiempo relativo).
// Sin red: solo lo que decide quién sigue ahí y cómo se pinta la mesa.
// Shim mínimo de localStorage por la cadena de imports (auth.js).
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const {
  STATUSES, STATUS_LABELS, STATUS_DOT, ONLINE_TTL_MS,
  validStatus, deriveStatus, isPresent, buildRoster, sortRoster, summarize, relativeSeen,
} = await import("../src/presence.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("presence.test.mjs");

const NOW = Date.parse("2026-05-31T12:00:00.000Z");
const ago = (secs) => new Date(NOW - secs * 1000).toISOString();

// --- catálogo de estados ---
ok(STATUSES.length === 5 && STATUSES.includes("meeting"), "cinco estados, con 'meeting'");
ok(STATUS_LABELS.meeting === "En reunión" && STATUS_LABELS.online === "Disponible", "etiquetas en ES");
ok(STATUS_DOT.online === "on" && STATUS_DOT.offline === "off", "clases del punto");

// --- validStatus ---
ok(validStatus("busy") && validStatus("away"), "estados del catálogo valen");
ok(!validStatus("zzz") && !validStatus("") && !validStatus(null), "inventados/vacío/null no valen");

// --- deriveStatus: lo declarado, degradado por frescura ---
ok(deriveStatus({ status: "online", updated_at: ago(10) }, NOW) === "online", "latido fresco conserva el estado");
ok(deriveStatus({ status: "busy", updated_at: ago(10) }, NOW) === "busy", "ocupado fresco se respeta");
ok(deriveStatus({ status: "online", updated_at: ago(80) }, NOW) === "offline", "latido rancio (>75s) cae a offline");
ok(deriveStatus({ status: "offline", updated_at: ago(1) }, NOW) === "offline", "offline declarado se respeta aunque sea fresco");
ok(deriveStatus(null, NOW) === "offline", "sin registro → offline");
ok(deriveStatus({ status: "zzz", updated_at: ago(1) }, NOW) === "offline", "estado basura → offline");
ok(ONLINE_TTL_MS === 75000, "umbral de frescura es 75s");
// frontera exacta del TTL
ok(deriveStatus({ status: "online", updated_at: ago(74) }, NOW) === "online", "justo dentro del TTL sigue presente");

// --- isPresent ---
ok(isPresent({ status: "meeting", updated_at: ago(5) }, NOW), "en reunión y fresco está presente");
ok(!isPresent({ status: "online", updated_at: ago(200) }, NOW), "fresco caducado no está presente");

// --- buildRoster: siembra el equipo y fusiona registros ---
const users = [{ name: "Pablo" }, { name: "Javi" }, { name: "Dani" }];
const records = [
  { name: "Pablo", name_lower: "pablo", status: "online", activity: "en CRM", updated_at: ago(5) },
  { name: "Javi", name_lower: "javi", status: "busy", activity: "llamando", updated_at: ago(300) }, // rancio
];
const roster = buildRoster(records, users, NOW, "Pablo");
ok(roster.length === 3, "aparecen los tres del equipo aunque Dani no haya latido");
const pablo = roster.find((r) => r.name === "Pablo");
const javi = roster.find((r) => r.name === "Javi");
const dani = roster.find((r) => r.name === "Dani");
ok(pablo.status === "online" && pablo.activity === "en CRM" && pablo.me === true, "Pablo online, su actividad y marcado como yo");
ok(javi.status === "offline" && javi.declared === "busy", "Javi cayó a offline por rancio, pero conserva lo declarado");
ok(dani.status === "offline" && dani.activity === "" && dani.lastSeen === null, "Dani sin latido: offline, sin actividad ni señal");
// no duplica al fusionar registros sueltos
const extra = buildRoster([{ name: "Pablo", name_lower: "pablo", status: "online", updated_at: ago(2) }], [{ name: "Pablo" }], NOW);
ok(extra.length === 1, "no duplica cuando registro y equipo coinciden");
// registro de alguien fuera de la lista del equipo igualmente aparece
const loose = buildRoster([{ name: "Nuevo", name_lower: "nuevo", status: "online", updated_at: ago(2) }], [], NOW);
ok(loose.length === 1 && loose[0].name === "Nuevo", "registro suelto fuera del equipo también aparece");

// --- sortRoster: presentes arriba por prioridad, luego alfabético ---
const mix = [
  { name: "Zoe", status: "online" },
  { name: "Ana", status: "offline" },
  { name: "Leo", status: "online" },
  { name: "Mia", status: "meeting" },
  { name: "Bea", status: "busy" },
];
const sorted = sortRoster(mix).map((r) => r.name);
ok(sorted[0] === "Leo" && sorted[1] === "Zoe", "online primero, alfabético entre iguales");
ok(sorted[2] === "Mia", "en reunión antes que ocupado");
ok(sorted[3] === "Bea", "ocupado después de reunión");
ok(sorted[4] === "Ana", "offline al final");

// --- summarize ---
const sum = summarize(sorted.map((n) => mix.find((m) => m.name === n)));
ok(sum.total === 5 && sum.present === 4 && sum.online === 2, "resumen: 5 total, 4 presentes, 2 disponibles");

// --- relativeSeen ---
ok(relativeSeen(ago(5), NOW) === "ahora mismo", "menos de un minuto: ahora mismo");
ok(relativeSeen(ago(180), NOW) === "hace 3 min", "minutos");
ok(relativeSeen(ago(7200), NOW) === "hace 2 h", "horas");
ok(relativeSeen(ago(172800), NOW) === "hace 2 d", "días");
ok(relativeSeen(null, NOW) === "sin señal", "sin fecha: sin señal");

console.log(`  ${passed} ok, ${failed} fallos`);
if (failed) process.exit(1);
