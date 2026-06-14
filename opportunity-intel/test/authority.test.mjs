// =============================================================================
// authority.test.mjs — La prueba de autoridad. El Ledger convertido en
// evidencia: obediencia, lift, accuracy, Authority Score, y la frase honesta
// del Reactor. Comprueba que NUNCA inventa: sin muestra, no afirma.
// =============================================================================

import {
  computeObedienceRate, computeOutcomeLift, computeOrderAccuracy,
  computeAuthorityScore, authorityLine, hasOverrideRegret,
} from "../src/authority.js";
import { orderIdFor, makeEvent, foldOrders } from "../src/ledger.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("authority.test.mjs");

const NOW = Date.parse("2026-06-14T12:00:00Z");
const H = 3600000;
const iso = (ms) => new Date(ms).toISOString();

// Helper: construye el log de eventos de una orden con ciclo opcional.
function order(lead, t, { obeyed = false, outcome = null } = {}) {
  const oid = orderIdFor(lead, iso(t));
  const evs = [makeEvent("issued", oid, { leadId: lead, at: t, oci: 80, expectedOutcome: "avance", confidence: 80 })];
  if (obeyed) evs.push(makeEvent("obeyed", oid, { at: t + 5 * 60000 }));
  if (outcome) evs.push(makeEvent("resolved", oid, { at: t + H, outcome }));
  return evs;
}

// ── 0. Los campos de predicción fluyen al plegar ──────────────────────────────
{
  const [o] = foldOrders(order("p", NOW, { obeyed: true, outcome: "avance" }));
  ok(o.expectedOutcome === "avance", "fold conserva expectedOutcome de issued");
  ok(o.confidence === 80, "fold conserva confidence de issued");
  ok(o.actualOutcome === "avance", "fold expone actualOutcome de resolved");
}

// ── 1. computeObedienceRate ───────────────────────────────────────────────────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true }),
    ...order("c", NOW + 2 * H), // emitida, no obedecida
  ]);
  const r = computeObedienceRate(orders);
  ok(r.issued === 3 && r.obeyed === 2, "obediencia: 3 emitidas, 2 obedecidas");
  ok(Math.abs(r.rate - 2 / 3) < 1e-9, "rate = 2/3");
}

// ── 2. computeOrderAccuracy ───────────────────────────────────────────────────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true, outcome: "propuesta" }),
    ...order("c", NOW + 2 * H, { obeyed: true, outcome: "perdido" }),
  ]);
  const a = computeOrderAccuracy(orders);
  ok(a.resolved === 3 && a.correct === 2 && a.wrong === 1, "accuracy: 2 correctas, 1 fallida");
  ok(a.accuracyPct === 67, "accuracyPct = 2/3 ≈ 67%");
}

// ── 3. computeAuthorityScore (métrica suprema) ────────────────────────────────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true, outcome: "perdido" }),
    ...order("c", NOW + 2 * H), // ignorada
    ...order("d", NOW + 3 * H, { obeyed: true, outcome: "propuesta" }),
  ]);
  const s = computeAuthorityScore(orders);
  ok(s.issued === 4 && s.correct === 2, "score: 4 emitidas, 2 obedecidas-correctas");
  ok(s.score === 50, "Authority Score = 2/4 × 100 = 50");
}

// ── 4. computeOutcomeLift: avance entre obedecidas vs ignoradas ───────────────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true, outcome: "avance" }),
    ...order("c", NOW + 2 * H, { obeyed: true, outcome: "perdido" }),
    ...order("z", NOW, {}), // ignorada (no obedecida)
  ]);
  const lift = computeOutcomeLift(orders, NOW + 60 * H); // 60h después → la 'z' es ignorada
  ok(lift.obeyedResolved === 3, "3 órdenes obedecidas y resueltas");
  ok(lift.ignored === 1, "1 orden ignorada (emitida, no obedecida, vencida)");
  ok(lift.enough === true, "3 resueltas ≥ muestra mínima");
  ok(lift.liftPct === 67, "liftPct = 2/3 ≈ 67%");
}

// ── 5. authorityLine: sin órdenes → declara falta de evidencia ────────────────
{
  ok(authorityLine([], NOW) === "Sin evidencia suficiente todavía.", "sin órdenes → sin evidencia");
}

// ── 6. authorityLine: con datos pero sin muestra → recuento honesto, sin % ────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true }),
  ]);
  const line = authorityLine(orders, NOW + 2 * H);
  ok(/2 órdenes emitidas · 2 obedecidas/.test(line), "sin muestra → recuento, sin afirmar %");
  ok(!/%/.test(line), "sin muestra suficiente NO aparece ningún porcentaje (no inventa)");
}

// ── 7. authorityLine: con muestra suficiente e ignoradas → afirma el lift ─────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true, outcome: "avance" }),
    ...order("c", NOW + 2 * H, { obeyed: true, outcome: "propuesta" }),
    ...order("z", NOW, {}), // ignorada
  ]);
  const line = authorityLine(orders, NOW + 60 * H);
  ok(/100% más que las ignoradas/.test(line), "muestra + ignoradas → afirma lift vs ignoradas");
}

// ── 8. authorityLine: muestra suficiente sin ignoradas → 'de las veces' ───────
{
  const orders = foldOrders([
    ...order("a", NOW, { obeyed: true, outcome: "avance" }),
    ...order("b", NOW + H, { obeyed: true, outcome: "perdido" }),
    ...order("c", NOW + 2 * H, { obeyed: true, outcome: "avance" }),
  ]);
  const line = authorityLine(orders, NOW + 3 * H);
  ok(/67% de las veces/.test(line), "muestra sin ignoradas → '% de las veces'");
}

// ── 9. hasOverrideRegret ──────────────────────────────────────────────────────
{
  const clean = foldOrders(order("a", NOW, { obeyed: true, outcome: "avance" }));
  ok(hasOverrideRegret(clean) === false, "sin regret → false");
  const oid = orderIdFor("r", iso(NOW));
  const regret = foldOrders([
    makeEvent("issued", oid, { leadId: "r", at: NOW }),
    makeEvent("regret", oid, { at: NOW + 50 * H }),
  ]);
  ok(hasOverrideRegret(regret) === true, "con evento regret → true");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
