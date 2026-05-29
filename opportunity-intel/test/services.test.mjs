// =============================================================================
// services.test.mjs — Motor de encaje de servicios + diagnóstico (lectura de
// señales, motivo de fallo, viabilidad, camino) + aprendizaje desde el CRM.
// Run: node test/services.test.mjs
// =============================================================================

import { matchServices, SERVICE_BY_ID, ticketLabel } from "../src/services.js";
import { failureReason, viability, recommendedPath, FAILURE_STATUSES } from "../src/diagnosis.js";
import { scoreOpportunity } from "../src/scoring.js";
import { FILTER_KEYS, DEFAULT_CONFIG } from "../src/models.js";
import * as store from "../src/store.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("services.test.mjs");

function lead(sig, { tensions = [], offer = "01-funnel", evidence = [] } = {}) {
  const signals = {};
  const codes = { G: "green", Y: "yellow", R: "red", X: "grey" };
  FILTER_KEYS.forEach((k, i) => (signals[k] = { level: codes[sig[i]] || "grey" }));
  return { id: "t", signals, tensions, suggestedOfferKey: offer, evidence };
}

// 1. matchServices propone servicios cuando hay necesidad (señales débiles).
const weak = lead("GGRRYGGRGY", { tensions: ["visibility_conversion"] });
weak.scores = scoreOpportunity(weak, DEFAULT_CONFIG);
const m = matchServices(weak, { max: 4 });
ok(m.length > 0, "propone servicios cuando hay necesidad");
ok(m.length <= 4, "respeta el máximo");
ok(m.every((x) => x.reasons.length > 0), "cada servicio trae su motivo");
ok(m[0].score >= m[m.length - 1].score, "ordenado por relevancia");

// 2. Un lead casi perfecto (todo verde) tiene MENOS necesidad → menos motivos débiles.
const strong = lead("GGGGGGGGGG");
strong.scores = scoreOpportunity(strong, DEFAULT_CONFIG);
const ms = matchServices(strong);
// los servicios habilitados por capacidad/encaje (verde) sí pueden aparecer
ok(Array.isArray(ms), "lead fuerte devuelve lista (puede proponer servicios premium habilitados)");

// 3. Sesgo por casa: un lead clasificado XN prioriza servicios XN.
const xnLead = lead("GGGGGGGGGG", { offer: "xn_transformation" });
xnLead.scores = scoreOpportunity(xnLead, DEFAULT_CONFIG);
if (xnLead.scores.classification === "xn") {
  const top = matchServices(xnLead, { max: 3 });
  ok(top.some((x) => x.house === "xn"), "lead XN incluye servicios XN en el top");
}

// 4. ticketLabel formatea rangos.
ok(/€/.test(ticketLabel(SERVICE_BY_ID["01-funnel"])), "ticketLabel incluye €");

// 5. failureReason lee causas de las señales débiles.
const fr = failureReason(weak);
ok(fr.causes.length > 0, "failureReason detecta causas en un lead con rojos/grises");
ok(fr.causes.every((c) => c.cause && c.mitigate), "cada causa trae explicación y mitigación");
const frStrong = failureReason(strong);
ok(frStrong.causes.length === 0, "lead sin huecos no arroja causas estructurales");

// 6. viability calcula cobertura y veredicto coherentes.
const vi = viability(strong);
ok(vi.coverage >= 0 && vi.coverage <= 100, "cobertura en rango");
ok(["hot", "warm", "cool"].includes(vi.tone), "tono válido");
ok(viability(weak).coverage <= vi.coverage, "lead fuerte cubre más que lead débil");

// 7. recommendedPath devuelve pasos accionables.
const path = recommendedPath(weak);
ok(path.length >= 3 && path.length <= 5, "el camino tiene 3-5 pasos");

// 8. FAILURE_STATUSES marca los estados de fallo.
ok(FAILURE_STATUSES.has("rejected") && FAILURE_STATUSES.has("no_answer"), "estados de fallo correctos");

// 9. Aprender del CRM: recordStatusOutcome hace upsert (sin duplicados).
store.resetAll();
store.recordStatusOutcome("c1", "rejected", { classification: "01", signals: weak.signals });
ok(store.getLearning().length === 1, "un estado decisivo registra un resultado");
store.recordStatusOutcome("c1", "meeting_booked", { classification: "01", signals: weak.signals });
ok(store.getLearning().length === 1, "cambiar el estado del mismo lead NO duplica (upsert)");
ok(store.getLearning()[0].outcome === "meeting_booked", "el upsert refleja el último estado");
store.recordStatusOutcome("c1", "called", {});
ok(store.getLearning().length === 0, "un estado no decisivo retira el resultado automático");
store.resetAll();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
