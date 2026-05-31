// Tests del Muelle (posits.js + store de posits). Sin DOM: solo la capa de datos
// y la lógica de obsesión (racha). Igual que statesync, montamos sesión y users
// en localStorage ANTES de importar, porque store.js/auth.js capturan al cargar.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();
globalThis.localStorage.setItem("oi:users", JSON.stringify([
  { name: "Pablo", color: "#cba24a", role: "admin", token: "t1" },
  { name: "Javi", color: "#5c7cfa", role: "editor", token: "t2" },
]));
globalThis.localStorage.setItem("oi:session", JSON.stringify({ name: "Javi", role: "editor", token: "t2" }));

const store = await import("../src/store.js");
const posits = await import("../src/ui/posits.js");

let passed = 0, failed = 0;
function ok(cond, msg) { if (cond) passed++; else { failed++; console.error("FAIL:", msg); } }

// —— Lanzar y recibir —————————————————————————————————————————————————————————
posits.fling({ glyph: "🔥", label: "Ciérralo", tone: "hot", to: "Pablo", leadId: "lead-9" }, "Javi");
const all = store.getPosits();
ok(all.length === 1, "savePosit guarda el posit");
ok(all[0].from === "Javi" && all[0].to === "Pablo", "from/to correctos");
ok(all[0].seenAt === null && all[0].archivedAt === null, "nace sin ver ni archivar");

// —— Destinatarios: todos menos yo ————————————————————————————————————————————
ok(posits.recipients("Javi").join() === "Pablo", "recipients excluye al emisor");

// —— Bandeja y sin-ver desde la óptica de Pablo ———————————————————————————————
ok(posits.inbox("Pablo").length === 1, "Pablo ve el posit en su bandeja");
ok(posits.unread("Pablo") === 1, "cuenta 1 sin ver");
ok(posits.inbox("Javi").length === 0, "el emisor no se ve a sí mismo en bandeja");

// —— Visto / archivado mutan el estado ————————————————————————————————————————
const id = all[0].id;
store.markPosit(id, { seenAt: new Date().toISOString() });
ok(posits.unread("Pablo") === 0, "tras marcar visto, 0 sin ver");
ok(posits.inbox("Pablo").length === 1, "visto sigue vivo en la bandeja");
store.markPosit(id, { archivedAt: new Date().toISOString() });
ok(posits.inbox("Pablo").length === 0, "archivado sale de la bandeja");

// —— Invariante de sync: gana la mutación más reciente (visto/archivado) ———————
// Simula el documento de otro dispositivo: mismo posit SIN archivar (más viejo).
const exported = JSON.parse(store.exportState());
ok(Array.isArray(exported.posits) && exported.posits.length === 1, "exportState incluye posits");

const stale = JSON.parse(JSON.stringify(exported));
stale.posits[0].archivedAt = null; // versión ajena, anterior al archivado
stale.posits[0].seenAt = null;
store.importState(JSON.stringify(stale), { replace: false });
ok(store.getPosits()[0].archivedAt, "merge conserva el archivado (mutación más reciente gana)");

// Y al revés: un archivado entrante MÁS nuevo sí debe ganar a un local sin archivar.
store.savePosit({ id: "p_x", kind: "sello", from: "Pablo", to: "Javi", glyph: "👀", label: "Míralo", createdAt: "2026-01-01T00:00:00.000Z" });
const incoming = { _format: "opportunity-intel/state", posits: [
  { id: "p_x", kind: "sello", from: "Pablo", to: "Javi", glyph: "👀", label: "Míralo",
    createdAt: "2026-01-01T00:00:00.000Z", archivedAt: "2026-02-01T00:00:00.000Z" },
] };
store.importState(JSON.stringify(incoming), { replace: false });
ok(store.getPosits().find((p) => p.id === "p_x").archivedAt === "2026-02-01T00:00:00.000Z",
  "un archivado entrante más nuevo gana al local sin archivar");

// —— Racha (obsesión): días consecutivos con actividad propia ——————————————————
const day = (d) => new Date(Date.now() - d * 86400000).toISOString();
// Limpia y siembra actividad de Javi hoy, ayer y anteayer (racha de 3).
globalThis.localStorage.setItem("oi:posits", JSON.stringify([
  { id: "a", from: "Javi", to: "Pablo", createdAt: day(0) },
  { id: "b", from: "Javi", to: "Pablo", createdAt: day(1) },
  { id: "c", from: "Javi", to: "Pablo", createdAt: day(2) },
  { id: "d", from: "Javi", to: "Pablo", createdAt: day(5) }, // hueco: no extiende
]));
ok(posits.streak("Javi") === 3, "racha de 3 días consecutivos terminando hoy");
ok(posits.streak("Pablo") === 0, "sin actividad reciente, racha 0");

// —— Acciones de hoy: solo cuentan las mías y de hoy ——————————————————————————
ok(posits.actionsToday("Javi") === 1, "actionsToday cuenta solo los gestos de hoy (1 de los 4 sembrados)");
ok(posits.actionsToday("Pablo") === 0, "actionsToday de otro = 0");

// —— Reconocimiento del CEO: persiste y es el más reciente ————————————————————
ok(posits.lastRecognition("Javi") === null, "sin potencia previa, no hay reconocimiento");
posits.fling({ kind: "potencia", glyph: "🚀", label: "Te potencio", to: "Javi" }, "Pablo");
const rec = posits.lastRecognition("Javi");
ok(rec && rec.from === "Pablo" && rec.kind === "potencia", "lastRecognition devuelve la potencia del CEO");
store.markPosit(rec.id, { archivedAt: new Date().toISOString() });
ok(posits.lastRecognition("Javi"), "el reconocimiento persiste aunque se archive (deja huella)");

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
