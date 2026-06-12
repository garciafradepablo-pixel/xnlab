// feed.test.mjs — Opportunity Feed: buckets + Command Bar (lógica pura).

const { bucketize, parseCommand, applyCommand, operatorToday, BUCKETS } = await import("../src/operator.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("feed.test.mjs");

// Decididos sintéticos: lo que importa aquí es el código de decisión y el OCI.
const mk = (id, decision, oci, classification = "01") => ({
  opp: { id, company: id, scores: { classification } },
  decision: { decision, oci, evidenceQuality: { score: decision === "NEEDS_EVIDENCE" ? 10 : 60 }, strategicTag: { code: decision === "STRATEGIC_DOOR" ? "strategic_door" : "cash" } },
});
const decided = [
  mk("A", "ACT_NOW", 80),
  mk("B", "ACT_NOW", 72),
  mk("C", "NEEDS_EVIDENCE", 30),
  mk("D", "ENRICH", 35),
  mk("E", "STRATEGIC_DOOR", 55, "xn"),
  mk("F", "KILL", 12),
  mk("G", "OVER_SERVED", 34),
  mk("H", "WATCH", 44),
  mk("I", "PREPARE", 60),
];

// === Buckets ===
const b = bucketize(decided);
ok(b.actNow.length === 2 && b.actNow.every((x) => x.decision.decision === "ACT_NOW"), "Act Now solo decisiones accionables");
ok(b.needsEvidence.map((x) => x.opp.id).sort().join("") === "CD", "Needs Evidence agrupa NEEDS_EVIDENCE + ENRICH");
ok(b.strategicDoors.length === 1 && b.strategicDoors[0].opp.id === "E", "Strategic Doors agrupa STRATEGIC_DOOR");
ok(b.killedNoise.map((x) => x.opp.id).sort().join("") === "FG", "Killed Noise agrupa KILL + OVER_SERVED");
// 5) killed noise NO se mezcla con act now
const actIds = new Set(b.actNow.map((x) => x.opp.id));
ok(b.killedNoise.every((x) => !actIds.has(x.opp.id)), "Killed Noise nunca se mezcla con Act Now");

// === parseCommand ===
ok(parseCommand("qué hago hoy").decisions.includes("ACT_NOW"), "'qué hago hoy' → accionables");
ok(parseCommand("dame los mejores").kind === "top", "'dame los mejores' → top por OCI");
ok(parseCommand("mata ruido").decisions.includes("KILL"), "'mata ruido' → KILL/OVER_SERVED");
ok(parseCommand("strategic doors").decisions.includes("STRATEGIC_DOOR"), "'strategic doors' → puertas");
ok(parseCommand("needs evidence").decisions.includes("NEEDS_EVIDENCE"), "'needs evidence' → faltan datos");
ok(parseCommand("leads para XN").value === "xn", "'leads para XN' → clasificación xn");
ok(parseCommand("leads para 01").value === "01", "'leads para 01' → clasificación 01");
ok(parseCommand("").kind === "clear", "vacío → limpiar");
ok(parseCommand("haz un café").kind === "unknown" && parseCommand("haz un café").suggestions.length > 0, "comando raro → unknown con sugerencias (no rompe)");

// === applyCommand ===
ok(applyCommand(decided, parseCommand("qué hago hoy")).every((x) => ["ACT_NOW", "PREPARE"].includes(x.decision.decision)), "2) Act Now/Hoy devuelve accionables");
ok(applyCommand(decided, parseCommand("qué hago hoy"))[0].opp.id === "A", "Hoy ordena por OCI (80 primero)");
ok(applyCommand(decided, parseCommand("needs evidence")).map((x) => x.opp.id).sort().join("") === "CD", "3) Needs Evidence devuelve baja evidencia");
ok(applyCommand(decided, parseCommand("strategic doors")).length === 1, "4) Strategic Doors filtra por tag estratégico");
ok(applyCommand(decided, parseCommand("dame los mejores"))[0].decision.oci === 80, "Mejores ordena por OCI desc");
ok(applyCommand(decided, parseCommand("leads para XN")).every((x) => x.opp.scores.classification === "xn"), "leads para XN filtra por clasificación");
ok(applyCommand(decided, parseCommand("")).length === decided.length, "limpiar → devuelve todo");
ok(applyCommand(decided, parseCommand("haz un café")).length === decided.length, "6) comando desconocido no filtra (no rompe el feed)");

// 7) estado vacío útil: un filtro sin resultados devuelve []
const onlyKill = [mk("Z", "KILL", 8)];
ok(applyCommand(onlyKill, parseCommand("qué hago hoy")).length === 0, "7) sin resultados → lista vacía (la UI muestra estado vacío)");

// 1) operatorToday no inventa
ok(operatorToday([]).length === 0, "1) today sin datos → vacío (no inventa)");
ok(operatorToday(decided).length === 3 && operatorToday(decided)[0].opp.id === "A", "today = ACT_NOW+PREPARE ordenado por OCI");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
