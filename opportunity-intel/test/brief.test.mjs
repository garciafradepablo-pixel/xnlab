// brief.test.mjs — Opportunity Brief + Operator v1 (puros, sin inventar datos).

const { scoreOpportunity } = await import("../src/scoring.js");
const { decide } = await import("../src/decision.js");
const { buildBrief, briefToText } = await import("../src/brief.js");
const { operatorAnswer, operatorToday, operatorFilter, OPERATOR_INTENTS } = await import("../src/operator.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("brief.test.mjs");

const ALL = ["transitionSignal", "economicCapacity", "visibleTension", "actionableLever", "activePainSignal", "whyNow", "reachableDecisionMaker", "budgetPriority", "strategicFit", "brutalFinalFilter"];
function opp(levels, extra = {}) {
  const signals = {};
  for (const [k, l] of Object.entries(levels)) signals[k] = { level: l, note: "" };
  return { id: "x", company: "Clínica Norte", sector: "health", signals, evidence: [], ...extra };
}
function brief(o) { const s = scoreOpportunity(o); return buildBrief(o, s, decide(o, s)); }

// === Brief no inventa: placeholders del lead → desconocido ===
const bare = opp({ strategicFit: "green" }, {
  thesis: "Por confirmar.", whyNow: "Por confirmar.", firstLever: "Por definir tras revisar la web.",
  reasonsNotToCall: ["Lead sin verificar — confirmar antes."],
});
const bb = brief(bare);
ok(bb.thesis === null && bb.whyNow === null, "placeholders ('Por confirmar') → null, no se presentan como hechos");
ok(Array.isArray(bb.unknowns) && bb.unknowns.length > 0, "lista 'qué no sabemos' a partir de los huecos del motor");
// Motor estricto: un lead con buen encaje pero sin dolor/hueco queda 'demasiado
// servido' → el primer mensaje FRENA ("no hay hueco") en vez de inventar gancho.
// Si hubiera hueco pero faltara ángulo, pediría "confirmar". Ambos: no inventa.
ok(/confirmar|no hay hueco/.test(bb.firstMessage), "sin hueco/ángulo real, el primer mensaje no inventa: frena o pide confirmar");

// === Brief rico cuando hay narrativa + evidencia ===
const rich = opp(Object.fromEntries(ALL.map((k) => [k, "green"])), {
  thesis: "Crecen pero su web no acompaña.",
  whyNow: "Acaban de abrir una segunda sede.",
  firstLever: "rehacer la landing de captación de pacientes",
  decisionMaker: { name: "Marta Ruiz", role: "Directora", linkedin: "in/marta" },
  evidence: [{ filter: "whyNow", tier: 3, url: "https://news/x", source: "Prensa local", note: "Apertura confirmada" }],
});
const rb = brief(rich);
ok(rb.thesis === "Crecen pero su web no acompaña.", "tesis real se conserva");
ok(rb.channel.includes("LinkedIn"), "canal recomendado a partir del decisor");
ok(rb.firstMessage.includes("Marta"), "primer mensaje usa el nombre del decisor");
ok(rb.evidence[0].confirmed === true, "evidencia con url marcada como confirmada");

// === El primer mensaje arranca de una señal REAL observada en la URL ===
const social = opp(Object.fromEntries(ALL.map((k) => [k, "green"])), {
  website: "https://facebook.com/clinicanorte", decisionMaker: { name: "Marta Ruiz", role: "Directora" },
});
const sm = brief(social).firstMessage;
ok(/redes/.test(sm) && /web propia/.test(sm), "el primer mensaje arranca de la señal observada (solo redes, sin web)");
// no_web es AUSENCIA → no se afirma en frío (riesgo si sí tienen web sin registrar)
const noWeb = opp(Object.fromEntries(ALL.map((k) => [k, "green"])), { decisionMaker: { name: "Ana" } });
ok(!/no tenéis web|sin web propia/.test(brief(noWeb).firstMessage), "no_web (ausencia) NO se afirma en el primer mensaje");

// === briefToText serializa sin romper ===
const txt = briefToText(rb);
ok(txt.includes("OPPORTUNITY BRIEF — Clínica Norte") && txt.includes("OCI"), "texto del brief legible");

// === Operator v1 ===
const s = scoreOpportunity(rich);
const dec = decide(rich, s);
const ctx = { opp: rich, scored: s, decision: dec, brief: rb };
for (const intent of OPERATOR_INTENTS) {
  const r = operatorAnswer(intent, ctx);
  ok(r && r.title && Array.isArray(r.lines) && r.lines.length > 0, `operator '${intent}' responde con líneas`);
}
ok(operatorAnswer("kill", ctx).lines.join(" ").match(/no hay una razón fuerte/i), "kill honesto: lead fuerte no tiene razones");
// defensa honesta de un lead débil
const weak = opp({}); // todo gris
const ws = scoreOpportunity(weak); const wd = decide(weak, ws);
ok(operatorAnswer("defend", { opp: weak, scored: ws, decision: wd, brief: buildBrief(weak, ws, wd) }).lines.join(" ").match(/poco que defender/i), "defensa honesta: nada que confirmar → lo dice");
ok(operatorAnswer("zzz", ctx).lines.length > 0, "intención desconocida no rompe");

// === operatorToday / filter ===
const decided = [
  { opp: rich, decision: dec },
  { opp: weak, decision: wd },
];
ok(operatorToday(decided).length === 1 && operatorToday(decided)[0].opp === rich, "today: solo lo accionable (ACT_NOW/PREPARE)");
ok(operatorFilter(decided, dec.decision).some((x) => x.opp === rich), "filter por decisión");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
