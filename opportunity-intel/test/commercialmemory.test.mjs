// commercialmemory.test.mjs — Memoria Comercial + dashboard (lógica pura).

const { buildMemory, buildDashboard, objectionsByResult, objectionsByStatus, objectionAdvanceRate, winLossPatterns, nextCallRecommendation, actionableMemory, MIN_SAMPLE } = await import("../src/commercialmemory.js");

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

// --- Prioridad 3: memoria accionable -----------------------------------------
const acalls = [
  { id: "a1", leadId: "L1", result: "closed_won", analysis: { objections: ["Precio / presupuesto"], buySignals: ["me interesa"], lossSignals: [] } },
  { id: "a2", leadId: "L2", result: "closed_lost", analysis: { objections: ["Precio / presupuesto"], buySignals: [], lossSignals: ["muy caro"] } },
  { id: "a3", leadId: "L3", result: "not_interested", analysis: { objections: ["Precio / presupuesto"], buySignals: [], lossSignals: ["no me interesa"] } },
  { id: "a4", leadId: "L4", result: "interested", analysis: { objections: ["No es el momento"], buySignals: ["me encaja"], lossSignals: [] } },
];
const atrack = {
  L1: { status: "won" }, L2: { status: "rejected" }, L3: { status: "wrong_fit" }, L4: { status: "interested" },
};

// objeciones por resultado
const obr = objectionsByResult(acalls);
ok(obr.find((r) => r.result === "closed_won").objections[0].label === "Precio / presupuesto", "objeciones por resultado de llamada");

// objeciones por estado del CRM
const obs = objectionsByStatus(acalls, atrack);
ok(obs.find((r) => r.status === "won").objections[0].label === "Precio / presupuesto", "objeciones por estado del CRM");

// ratio de avance por objeción: 'Precio' aparece en 3 (L1 won avanza, L2/L3 no) → 33%
const adv = objectionAdvanceRate(acalls, atrack);
const precio = adv.find((o) => o.label === "Precio / presupuesto");
ok(precio.total === 3 && precio.advanced === 1 && precio.rate === 33, "ratio de avance por objeción");
ok(precio.enough === true, "3 muestras = suficiente");
const momento = adv.find((o) => o.label === "No es el momento");
ok(momento.enough === false, "1 muestra = datos insuficientes");

// patrones ganados/perdidos
const wl = winLossPatterns(acalls, atrack);
ok(wl.wonSample === 1 && wl.lostSample === 2, "cuenta muestras ganadas/perdidas");
ok(wl.lossPhrases.some((p) => p.label === "muy caro"), "frases de las perdidas");

// recomendación práctica: 'Precio' frena (33% en 3) → debe señalarla
const rec = nextCallRecommendation({ calls: acalls, tracking: atrack });
ok(rec.enough === true && rec.focus === "Precio / presupuesto", "recomendación apunta a la objeción que más frena");

// honestidad: pocos datos → insuficiente, sin inventar
const poor = nextCallRecommendation({ calls: acalls.slice(0, 2), tracking: atrack });
ok(poor.enough === false && /insuficiente/i.test(poor.text), "datos insuficientes se dicen, no se inventan");

// wrapper
const am = actionableMemory({ calls: acalls, tracking: atrack });
ok(am.enough === true && am.objectionAdvance.length > 0 && !!am.recommendation, "actionableMemory compone todo");
ok(MIN_SAMPLE === 3, "umbral de muestra mínima expuesto");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
