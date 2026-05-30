// =============================================================================
// playbook.test.mjs — Guion + dossier por lead (Fase 10). Lógica pura.
// =============================================================================

import { buildPlaybook, playbookToText } from "../src/playbook.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("playbook.test.mjs");

// ── Lead investigado: trae copia propia (callOpening, objection, firstLever) ──
const researched = {
  company: "La Casa del Limonero", subsector: "Hotel boutique", city: "Sevilla",
  sector: "hospitality",
  decisionMaker: { name: "Martina Cam", role: "Owner / Director" },
  whyNow: "Abrió en primavera de 2025 — primera temporada alta por delante.",
  firstLever: "auditar la reserva directa frente a las OTAs.",
  callOpening: "Martina, enhorabuena por la apertura en Santa Cruz.",
  objection: "Estamos recién abiertos, ahora no es el momento.",
  objectionResponse: "Justo por eso: la primera temporada fija vuestra dependencia de OTAs.",
  tensions: ["quality_perception", "visibility_conversion"],
  scores: { classification: "01", confidence: 73, successIndex: 41, recommendation: "prepare_audit" },
};

const pb = buildPlaybook(researched);
ok(pb.script.opener === researched.callOpening, "usa la apertura investigada tal cual");
ok(pb.script.observation.startsWith("Auditar"), "la observación parte del firstLever (capitalizado)");
ok(pb.objection.line === researched.objection, "usa la objeción investigada");
ok(pb.dossier.find((d) => d.k === "Momento" && !d.weak), "el momento conocido NO es un hueco");
ok(pb.dossier.find((d) => d.k === "Tensión").v.includes("Calidad"), "muestra las tensiones legibles");
ok(pb.gaps.length === 0, "lead completo → sin huecos");

// ── Regla de oro: el guion NUNCA cita un precio ──────────────────────────────
const text = playbookToText(researched, pb).toLowerCase();
ok(!/€|\beur\b|\d{3,}\s*€|precio de \d/.test(text), "el guion no contiene precios");
ok(pb.script.close.includes("diagnóstico"), "el cierre agenda diagnóstico, no vende número");

// ── Lead crudo (descubierto): sin copia propia → composición honesta + huecos ─
const raw = {
  company: "Estudio Tinta Negra", sector: "growth", city: "Madrid",
  scores: { classification: "xn", confidence: 71, successIndex: 33, recommendation: "enrich" },
};
const pb2 = buildPlaybook(raw);
ok(pb2.script.opener.includes("Estudio Tinta Negra") || pb2.script.opener.includes("Hola"), "compone apertura honesta sin inventar momento");
ok(pb2.script.offer.includes("transformación"), "XN → oferta de transformación, sin precio");
ok(pb2.dossier.find((d) => d.k === "Momento").weak, "sin momento conocido → marcado como hueco");
ok(pb2.dossier.find((d) => d.k === "Decisor").weak, "sin decisor → hueco");
ok(pb2.gaps.length === 3, "tres huecos a confirmar (momento, tensión, decisor)");
ok(!pb2.script.opener.includes("undefined"), "nunca filtra 'undefined'");

// ── Servicio encajado se incrusta en la oferta ───────────────────────────────
const pb3 = buildPlaybook(raw, { topService: { name: "XN Transformation", solves: "marca sin sistema de captación" } });
ok(pb3.script.offer.startsWith("XN Transformation"), "incrusta el servicio mejor encajado");
ok(pb3.dossier.find((d) => d.k === "Encaje").v.includes("XN Transformation"), "el encaje cita el servicio");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
