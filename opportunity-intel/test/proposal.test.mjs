// =============================================================================
// proposal.test.mjs — La propuesta cierra hacia el diagnóstico, nunca al precio.
// =============================================================================
import { buildProposal, proposalToText } from "../src/proposal.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("proposal.test.mjs");

const leadXN = {
  company: "Grupo Lumen", city: "Madrid",
  whyNow: "Apertura de su buque insignia en 2025.",
  thesis: "Su marca no está a la altura de su nuevo local.",
  tensions: ["brand_dilution"],
  decisionMaker: { name: "Rosa Esteva", role: "Fundadora" },
  scores: { classification: "xn", confidence: 82, successIndex: 71 },
};
const lead01 = { company: "Bar Nuria", city: "Sitges", scores: { classification: "01", confidence: 60 } };

// 1. Estructura y marca correctas.
const pXN = buildProposal(leadXN, { service: { name: "Transformación de marca", solves: "una identidad que no acompaña", produces: "un sistema de marca nuevo" } });
ok(/Grupo Lumen/.test(pXN.title) && /01/.test(pXN.title), "título lleva empresa y la marca paraguas 01");
ok(pXN.sections.length >= 4, "compone varias secciones");
ok(/diagn[oó]stico/i.test(pXN.cta), "el cierre agenda el diagnóstico (métrica norte)");

// 2. REGLA DE MARCA: jamás cita precio.
const txtXN = proposalToText(leadXN, pXN);
ok(!/€|EUR|\beuros?\b|\/mes|desde \d/i.test(txtXN), "la propuesta NUNCA cita precio");
ok(/2025/.test(txtXN) && /Rosa|Lumen/.test(txtXN), "usa el momento/datos investigados, no inventa");

// 3. 01 vs XN tienen forma distinta (ventana/intensidad).
const p01 = buildProposal(lead01);
const txt01 = proposalToText(lead01, p01);
ok(/2–4 semanas/.test(txt01), "01 propone ventana corta");
ok(/8–12 semanas/.test(txtXN), "XN propone ventana de transformación");
ok(!/€/.test(txt01), "01 tampoco cita precio");

// 4. Honestidad: sin momento → hueco a confirmar.
ok(p01.gaps.some((g) => /momento/i.test(g)), "marca el momento como hueco a confirmar si falta");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
