// decision.test.mjs — Opportunity Decision Layer (OCI). Honestidad estructural.

const { scoreOpportunity } = await import("../src/scoring.js");
const { decide, evidenceQuality, strategicLens } = await import("../src/decision.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("decision.test.mjs");

// Helper: construye una oportunidad con niveles de señal y filtros citados.
function opp(levels, { sector = "growth", cited = [] } = {}) {
  const signals = {};
  for (const [k, l] of Object.entries(levels)) signals[k] = { level: l, note: "" };
  const evidence = cited.map((f) => ({ filter: f, tier: 3, url: "https://x", type: "web", source: "s", note: "n" }));
  return { id: "x", company: "X", sector, signals, evidence };
}
const D = (o) => decide(o, scoreOpportunity(o));

const ALL = ["transitionSignal", "economicCapacity", "visibleTension", "actionableLever", "activePainSignal", "whyNow", "reachableDecisionMaker", "budgetPriority", "strategicFit", "brutalFinalFilter"];
const allGreen = Object.fromEntries(ALL.map((k) => [k, "green"]));

// === 1) Web bonita / muchos servicios (Fit alto) SIN dolor ni timing NO sube ===
const pretty = opp({ strategicFit: "green", economicCapacity: "green", brutalFinalFilter: "green" }); // resto gris
const dPretty = D(pretty);
ok(dPretty.dimensions.fit >= 60, "fit alto cuando encaja/paga");
ok(dPretty.dimensions.pain < 35 && dPretty.dimensions.timing < 35, "pain/timing bajos sin señales");
ok(dPretty.decision === "OVER_SERVED", "buena empresa sin hueco → OVER_SERVED, no top");
ok(dPretty.oci <= 40, "OCI no se infla por fit solo");

// === 2) Dolor + timing + acceso GANA a bonito-pero-sin-timing ===
const strong = opp(allGreen, { cited: ALL });
const dStrong = D(strong);
ok(dStrong.decision === "ACT_NOW", "opening real + acceso + evidencia → ACT_NOW");
ok(dStrong.oci > dPretty.oci + 30, "el lead con opening supera de largo al bonito sin timing");

// === 3) Señales grises/desconocidas NO cuentan como confirmadas ===
const greyAll = opp({}); // todo gris
const eqGrey = evidenceQuality(greyAll, scoreOpportunity(greyAll));
ok(eqGrey.confirmed === 0 && eqGrey.score === 0, "todo gris → cero confirmado, evidence quality 0");
ok(eqGrey.unknown === 10, "diez filtros desconocidos contados como tales");

// === 4) Amarillo pesa MENOS que verde ===
const greenOne = opp({ strategicFit: "green" }, { cited: ["strategicFit"] });
const yellowOne = opp({ strategicFit: "yellow" }, { cited: ["strategicFit"] });
const eqG = evidenceQuality(greenOne, scoreOpportunity(greenOne));
const eqY = evidenceQuality(yellowOne, scoreOpportunity(yellowOne));
ok(eqG.score > eqY.score, "evidence quality: verde citado > amarillo citado");
ok(D(greenOne).dimensions.fit > D(yellowOne).dimensions.fit, "dimensión: verde mueve más que amarillo");

// === 5) Kill Reasons detecta over-served y sin dolor ===
ok(dPretty.killReasons.some((k) => k.code === "over_served"), "detecta 'demasiado servido'");
ok(dPretty.killReasons.some((k) => k.code === "no_visible_pain"), "detecta 'sin dolor visible'");
ok(dStrong.killReasons.length === 0, "un lead fuerte no acumula razones de descarte");

// === 6) La acción recomendada cambia según lo que falta ===
// falta evidencia: todo es indicio (amarillo) sin una sola cita → enriquecer antes
const allYellow = Object.fromEntries(ALL.map((k) => [k, "yellow"]));
const noEvidence = opp(allYellow); // sin cited
ok(["NEEDS_EVIDENCE", "ENRICH"].includes(D(noEvidence).decision), "todo indicio sin confirmar → NEEDS_EVIDENCE/ENRICH");
// falta acceso: opening y evidencia ok, pero decisor inalcanzable
const noAccess = opp({ activePainSignal: "green", visibleTension: "green", actionableLever: "green", whyNow: "green", transitionSignal: "green", economicCapacity: "green", strategicFit: "green" }, { cited: ["activePainSignal", "whyNow", "strategicFit"] }); // reachable/budget gris
ok(D(noAccess).decision === "NO_ACCESS", "sin decisor alcanzable → NO_ACCESS");
// falta timing: dolor + acceso + encaje medio, sin 'por qué ahora'
const noTiming = opp({ activePainSignal: "green", visibleTension: "green", actionableLever: "green", reachableDecisionMaker: "green", budgetPriority: "green", strategicFit: "yellow", economicCapacity: "yellow", brutalFinalFilter: "green" }, { cited: ["activePainSignal", "reachableDecisionMaker"] }); // whyNow/transition gris
ok(["NO_TIMING", "STRATEGIC_DOOR"].includes(D(noTiming).decision), "sin momento → NO_TIMING / puerta estratégica");
// fuerte → ACT_NOW (ya cubierto), distinto de todo lo anterior
ok(dStrong.decision !== D(noAccess).decision && D(noAccess).decision !== D(noTiming).decision, "la acción discrimina según lo que falta");

// === 7) Evidence Quality refleja confirmado/indicio/desconocido ===
const mixed = opp({ strategicFit: "green", economicCapacity: "yellow", activePainSignal: "yellow" }, { cited: ["strategicFit", "economicCapacity"] });
const eqMixed = evidenceQuality(mixed, scoreOpportunity(mixed));
ok(eqMixed.confirmed === 2, "verde/amarillo citados cuentan como confirmados");
ok(eqMixed.indicative === 1, "amarillo sin cita cuenta como indicio");
ok(eqMixed.unknown === 7, "el resto gris cuenta como desconocido");

// === 8) Tag estratégico y decisión coherentes; nada inventado ===
ok(dStrong.strategicTag.code === "cash", "lead fuerte y monetizable → Cash Lead");
ok(dPretty.strategicTag.code === "strategic_door" || dPretty.strategicTag.code === "noise", "encaje sin caja → puerta o ruido, no Cash");
ok(typeof dStrong.decisionWhy === "string" && dStrong.decisionWhy.length > 0, "la decisión trae su porqué");

// === Lentes estratégicas: mapean desde datos reales, sin inventar ===
ok(strategicLens({ company: "Longevity Clinic Madrid" }).code === "longevity", "longevity desde el nombre");
ok(strategicLens({ subsector: "web3 / smart contracts" }).code === "web3", "web3 desde subsector");
ok(strategicLens({ company: "Zuzalu pop-up city" }).code === "frontier_communities", "frontier communities");
ok(strategicLens({ subsector: "spa & wellness retreat" }).code === "wellness", "wellness");
ok(strategicLens({ thesis: "plataforma de automatización con IA" }).code === "ai_automation", "ai automation desde la tesis");
ok(strategicLens({ company: "Boutique Hotel", sector: "hospitality" }).code === "hospitality", "hospitality");
ok(strategicLens({ company: "Estudio creativo y productora" }).code === "creative_ip", "creative/ip");
ok(strategicLens({ subsector: "family office / venture" }).code === "capital_investors", "capital/investors");
ok(strategicLens({ company: "Clínica dental Pérez", sector: "health" }) === null, "sin señal de mundo → null (no inventa lente)");
ok(strategicLens({ sector: "hospitality" }).code === "hospitality", "respaldo por sector real (hospitality)");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
