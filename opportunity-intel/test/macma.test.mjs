// Tests de MACMA CORE — capa de datos (macma.js) y motor de lectura
// (macma-engine.js). Sin DOM. Igual que posits/statesync, montamos localStorage
// en memoria ANTES de importar, porque los módulos capturan el storage al cargar.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const macma = await import("../src/macma.js");
const engine = await import("../src/macma-engine.js");

let passed = 0, failed = 0;
function ok(cond, msg) { if (cond) passed++; else { failed++; console.error("FAIL:", msg); } }

const ME = "Pablo";

// —— Perfil: se crea idempotente, registra el enlace de voz ———————————————————
const p = macma.ensureProfile(ME);
ok(p && p.voiceLinked === false, "ensureProfile nace sin voz enlazada");
ok(macma.ensureProfile(ME).createdAt === p.createdAt, "ensureProfile es idempotente");
macma.setVoiceLinked(ME, true);
ok(macma.getProfile(ME).voiceLinked === true, "setVoiceLinked enlaza la voz");

// —— Biografía: añadir, listar (recientes primero), eliminar ———————————————————
ok(macma.addBio(ME, { kind: "free", text: "" }) === null, "no guarda biografía vacía");
const b1 = macma.addBio(ME, { kind: "leadership", text: "Tuve que liderar al equipo bajo mucha presión y decidí rápido." });
const b2 = macma.addBio(ME, { kind: "failure", text: "Un fracaso del que aprendí: lancé sin escuchar al cliente." });
ok(macma.getBios(ME).length === 2, "guarda dos entradas de biografía");
ok(macma.getBios(ME)[0].id === b2.id, "la más reciente va primero");
ok(macma.getBios(ME)[0].source === "text", "source por defecto es text");
macma.removeBio(ME, b1.id);
ok(macma.getBios(ME).length === 1, "removeBio elimina la entrada");

// —— Aislamiento por usuario: la biografía de uno no es la de otro ————————————
macma.addBio("Javi", { kind: "free", text: "Mi historia es distinta." });
ok(macma.getBios(ME).length === 1 && macma.getBios("Javi").length === 1, "cada usuario tiene su propio relato");

// —— Motor: puntuación sobre base neutra, sube con evidencia ——————————————————
const empty = engine.scoreBiography([]);
ok(Object.keys(empty.scores).length === 10, "diez dimensiones puntuadas");
ok(empty.scores.vision === empty.scores.conflict, "sin biografía, todo en la misma base neutra");
ok(empty.level === "baja", "sin materia prima, confianza baja");

const richLeadership = engine.scoreBiography([
  { kind: "leadership", text: "Lideré el equipo, dirigí, delegué y decidí. Liderar bajo presión es mi terreno: guié al equipo." },
]);
ok(richLeadership.scores.leadership > empty.scores.leadership, "el léxico de liderazgo eleva su dimensión");
ok(richLeadership.evidence > 0, "registra evidencia léxica");

// —— Confianza crece con palabras ————————————————————————————————————————————
const longBio = engine.scoreBiography([{ kind: "free", text: Array(200).fill("palabra").join(" ") }]);
ok(longBio.confidence > empty.confidence, "más palabras, más confianza");

// —— Patrones: forma estable, fortalezas != cuello de botella —————————————————
const pat = engine.analyzePatterns(richLeadership, []);
ok(Array.isArray(pat.strengths) && pat.strengths.length === 2, "dos fortalezas dominantes");
ok(pat.bottleneck && pat.nextSkill && pat.blindSpot && pat.risk && pat.opportunity, "lámina de patrones completa");
ok(pat.strengths[0].key !== pat.bottleneck.key, "la fortaleza no es el cuello de botella");

// —— Conflicto: separa hechos de supuestos, detecta motores ———————————————————
const shortCf = engine.analyzeConflict("Discutimos.");
ok(shortCf.tooShort === true, "texto demasiado corto pide más detalle");

const cf = engine.analyzeConflict(
  "Mi socio me dijo el lunes que cerraría la ronda. Creo que nunca tuvo intención de hacerlo. Siento frustración y el reparto de equity sigue sin decidir."
);
ok(cf.tooShort === false, "texto suficiente se analiza");
ok(cf.facts.length >= 1, "detecta al menos un hecho (dijo / el lunes)");
ok(cf.assumptions.length >= 1, "detecta al menos un supuesto (creo / nunca)");
ok(cf.emotional.includes("frustración"), "detecta el motor emocional");
ok(cf.operational.length >= 1, "detecta un motor operativo (equity)");
ok(typeof cf.action === "string" && cf.action.length > 0, "propone una acción medible");
ok(Array.isArray(cf.conversation) && cf.conversation.length >= 3, "propone una conversación");

// —— Reto diario: determinista por usuario+día ————————————————————————————————
const score = engine.scoreBiography(macma.getBios(ME));
const d1 = engine.dailyChallenge(ME, score, "2026-05-31");
const d1b = engine.dailyChallenge(ME, score, "2026-05-31");
ok(d1.text === d1b.text, "el reto del día es estable para el mismo usuario y fecha");

// —— Registro y racha de evolución ————————————————————————————————————————————
const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
macma.recordChallenge(ME, yesterday, { text: "ayer", dimension: "vision" });
macma.recordChallenge(ME, today, { text: "hoy", dimension: "vision" });
macma.setChallengeDone(ME, yesterday, true);
macma.setChallengeDone(ME, today, true);
ok(macma.challengeStreak(ME) === 2, "racha de dos días consecutivos cumplidos");
macma.setChallengeDone(ME, today, false);
ok(macma.challengeStreak(ME) === 1, "deshacer hoy deja la racha en ayer (1)");

// —— recordChallenge es idempotente por día ——————————————————————————————————
const before = macma.getChallengeLog(ME).length;
macma.recordChallenge(ME, today, { text: "otro", dimension: "vision" });
ok(macma.getChallengeLog(ME).length === before, "no duplica el reto de un mismo día");

console.log(`\nMACMA CORE: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
