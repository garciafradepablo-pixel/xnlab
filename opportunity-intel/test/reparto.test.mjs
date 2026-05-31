// =============================================================================
// reparto.test.mjs — Economía de proyecto y reparto por contribución (puro).
// Verifica margen, puntuación (aportación×habilidad×importancia), proporciona-
// lidad del reparto, topes (no se reparte una pérdida) y la agregación de
// beneficios por trabajador a lo largo de la cartera.
// =============================================================================

import {
  num, projectMargin, contributionScore, distributeProject, earningsByWorker, portfolioTotals,
} from "../src/reparto.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
console.log("reparto.test.mjs");

// — num —
ok(num("1200", 0) === 1200 && num("x", 7) === 7 && num(undefined, 3) === 3, "num parsea o cae al defecto");

// — Margen —
const m = projectMargin({ revenue: 10000, costs: 4000 });
ok(m.margin === 6000 && near(m.marginPct, 0.6), "margen = importe − costes y % correcto");
ok(projectMargin({ revenue: 0, costs: 100 }).marginPct === 0, "sin importe, margen% = 0 (no divide por cero)");

// — Puntuación de contribución —
ok(contributionScore({ aportacion: 10, skill: 1, importance: 1 }) === 10, "score neutro = aportación");
ok(contributionScore({ aportacion: 10, skill: 1.5, importance: 2 }) === 30, "score = aportación×habilidad×importancia");
ok(contributionScore({ aportacion: 0 }) === 0, "sin aportación, score 0");

// — Reparto proporcional —
const p = {
  revenue: 10000, costs: 2000, poolPct: 0.5, // margen 8000 · pool 50% → 4000 a repartir
  participants: [
    { name: "Pablo", aportacion: 30, skill: 1, importance: 2 }, // 60
    { name: "Javi", aportacion: 20, skill: 1, importance: 1 },  // 20
  ],
};
const d = distributeProject(p);
ok(d.margin === 8000, "margen del proyecto");
ok(near(d.distributable, 4000), "distribuible = margen × pool%");
ok(near(d.agencyKeep, 4000), "lo que retiene la agencia = margen − distribuible");
ok(near(d.totalScore, 80), "puntuación total = suma de contribuciones");
ok(near(d.shares[0].sharePct, 0.75) && near(d.shares[1].sharePct, 0.25), "reparto proporcional a la contribución");
ok(near(d.shares[0].payout, 3000) && near(d.shares[1].payout, 1000), "beneficios reparten el distribuible");
ok(near(d.shares[0].payout + d.shares[1].payout, d.distributable), "la suma de beneficios = distribuible");

// — Topes: una pérdida NO se reparte —
const loss = distributeProject({ revenue: 1000, costs: 4000, poolPct: 0.5, participants: [{ name: "A", aportacion: 1 }] });
ok(loss.margin === -3000 && loss.distributable === 0, "con pérdida no hay nada que repartir");

// — Sin participantes / sin puntuación: nadie cobra (no NaN) —
const empty = distributeProject({ revenue: 5000, costs: 0, poolPct: 0.4, participants: [] });
ok(empty.shares.length === 0 && empty.totalScore === 0, "sin participantes, sin reparto y sin NaN");

// — Beneficios por trabajador a lo largo de la cartera —
const projects = [
  p,
  { name: "Proyecto 2", revenue: 2000, costs: 0, poolPct: 1, participants: [{ name: "Javi", aportacion: 10, skill: 1, importance: 1 }] },
];
const earn = earningsByWorker(projects);
ok(near(earn.get("pablo").total, 3000), "Pablo acumula su parte");
ok(near(earn.get("javi").total, 1000 + 2000), "Javi suma sus partes de los dos proyectos");
ok(earn.get("javi").projects.length === 2, "se listan los proyectos por trabajador");

// — Totales de cartera —
const t = portfolioTotals(projects);
ok(t.revenue === 12000 && t.margin === 10000, "totales de cartera agregan importe y margen");
ok(near(t.distributable, 4000 + 2000), "totales agregan la bolsa a repartir");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
