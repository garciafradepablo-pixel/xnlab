// commercialmemory.test.mjs — Memoria Comercial + dashboard (lógica pura).

const { buildMemory, buildDashboard } = await import("../src/commercialmemory.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("commercialmemory.test.mjs");

const calls = [
  {
    id: "c1", leadId: "l1", result: "closed_won", leadSector: "health",
    transcript: "texto",
    analysis: { objections: ["Precio / presupuesto"], pains: ["Marca / web desfasada"], services: ["Web / Landing"], buySignals: ["me interesa"], lossSignals: [], budget: "5000 €", closeProbability: 80 },
  },
  {
    id: "c2", leadId: "l2", result: "closed_lost", leadSector: "hospitality",
    transcript: "texto",
    analysis: { objections: ["Precio / presupuesto"], pains: ["Captación floja"], services: [], buySignals: [], lossSignals: ["no me interesa"], closeProbability: 20 },
  },
  {
    id: "c3", leadId: "l3", result: "interested", leadSector: "health",
    transcript: "",
    analysis: { objections: ["No es el momento"], pains: ["Marca / web desfasada"], services: ["Web / Landing"], buySignals: ["me encaja"], lossSignals: [], closeProbability: 60 },
  },
];

// --- buildMemory ---
const m = buildMemory(calls);
ok(m.sampleSize === 3, "cuenta todas las llamadas");
ok(m.callsWithTranscript === 2, "cuenta solo las que tienen transcripción");
ok(m.objections[0].label === "Precio / presupuesto" && m.objections[0].count === 2, "objeción más repetida agregada");
ok(m.pains[0].label === "Marca / web desfasada" && m.pains[0].count === 2, "dolor más repetido agregado");
ok(m.services[0].label === "Web / Landing" && m.services[0].count === 2, "servicio más demandado");
ok(m.prices.includes("5000 €"), "recoge precios mencionados");
ok(m.avgCloseProbability === Math.round((80 + 20 + 60) / 3), "promedio de probabilidad de cierre");

// salud convierte mejor (2 llamadas, ambas won/interested) que hostelería (1, lost)
const health = m.sectors.find((s) => s.sector === "health");
const hosp = m.sectors.find((s) => s.sector === "hospitality");
ok(health.rate === 100 && hosp.rate === 0, "tasa de respuesta por sector");
ok(m.sectors[0].sector === "health", "sectores ordenados por tasa");

// razones de ganar / perder
ok(m.winReasons.length > 0, "extrae razones de cierre");
ok(m.lossReasons.some((r) => r.label === "Precio / presupuesto"), "razón de pérdida = objeción dominante");

// vacío
const z = buildMemory([]);
ok(z.sampleSize === 0 && z.avgCloseProbability === null && z.objections.length === 0, "memoria vacía es honesta");

// --- buildDashboard ---
const leads = [
  { id: "l1", company: "A", sector: "health" },
  { id: "l2", company: "B", sector: "hospitality" },
  { id: "l3", company: "C", sector: "health" },
  { id: "l4", company: "D", sector: "growth" },
];
const tracking = {
  l1: { status: "won" },
  l2: { status: "rejected" },
  l3: { status: "interested" },
  // l4 sin tracking → not_called
};
const d = buildDashboard({ leads, tracking, calls });
ok(d.totalLeads === 4, "total de leads");
ok(d.won === 1 && d.lost === 1, "cierres ganados y perdidos");
ok(d.callsMade === 3, "llamadas realizadas = registros de llamada");
ok(d.hot.length === 1 && d.hot[0].id === "l3", "leads calientes (interesado)");
ok(d.byStatus.not_called === 1, "leads sin contactar contados");
ok(d.funnel[0].stage === "Contactados" && d.funnel[d.funnel.length - 1].stage === "Cerrados", "embudo por fases");
ok(d.memory.sampleSize === 3, "el dashboard incluye la memoria comercial");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
