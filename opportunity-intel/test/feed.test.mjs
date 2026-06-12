// feed.test.mjs — Opportunity Feed: buckets + Command Bar (lógica pura).

const { bucketize, parseCommand, applyCommand, operatorToday, commandAnswer, BUCKETS } = await import("../src/operator.js");

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

// === Operator one-line answer (Tanda 3): desde datos reales, sin inventar ===
// Le adjuntamos decisionWhy a los decididos sintéticos para la razón ejecutiva.
const withWhy = decided.map((x) => ({ ...x, decision: { ...x.decision, decisionWhy: "opening real, acceso y evidencia." } }));
const todayCmd = parseCommand("qué hago hoy");
const todayFocus = applyCommand(withWhy, todayCmd);
const ansToday = commandAnswer(todayCmd, todayFocus);
ok(/Ataca 3 oportunidades ahora/.test(ansToday), "today → cuenta real de accionables");
ok(ansToday.includes("OCI 80") && ansToday.includes("razón:"), "today → mejor prioridad con OCI y razón reales");

const killCmd = parseCommand("mata ruido");
ok(/Hay 2 oportunidades que conviene matar/.test(commandAnswer(killCmd, applyCommand(decided, killCmd))), "kill → cuenta real de ruido");
const evCmd = parseCommand("needs evidence");
ok(/2 oportunidades necesitan evidencia/.test(commandAnswer(evCmd, applyCommand(decided, evCmd))), "needs evidence → cuenta real");
const doorCmd = parseCommand("strategic doors");
ok(/1 puerta estrategica|1 puerta estratégica/.test(commandAnswer(doorCmd, applyCommand(decided, doorCmd))), "strategic doors → cuenta real");

// No inventa cuando no hay datos
ok(commandAnswer(parseCommand("qué hago hoy"), []).match(/No hay nada que atacar/i), "today sin datos → lo dice, no inventa");
ok(commandAnswer(parseCommand("mata ruido"), []).match(/No hay ruido que matar/i), "kill sin datos → lo dice");
ok(commandAnswer(parseCommand("strategic doors"), []).match(/Ninguna puerta/i), "doors sin datos → lo dice");

// Comando desconocido → sugerencias, no alucinación
const unk = commandAnswer(parseCommand("hazme un sándwich"), []);
ok(/No entendí/.test(unk) && /qué hago hoy/.test(unk), "comando desconocido → sugerencias, sin inventar");

// Sin comando → sin respuesta (no ruido)
ok(commandAnswer(null, decided) === "" && commandAnswer(parseCommand(""), decided) === "", "sin comando → línea vacía");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
