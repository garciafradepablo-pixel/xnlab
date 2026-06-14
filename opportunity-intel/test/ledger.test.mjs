// =============================================================================
// ledger.test.mjs — El activo principal: el log append-only ORDEN→OBEDIENCIA→
// RESULTADO. Comprueba el id determinista, el plegado de eventos en órdenes, el
// Order Edge inicial, y que el store añade eventos sin sobrescribir (idempotente).
// =============================================================================

import { orderIdFor, makeEvent, foldOrders, computeOrderEdge, OUTCOME_STATUS } from "../src/ledger.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("ledger.test.mjs");

const NOW = Date.parse("2026-06-14T10:00:00Z");
const H = 3600000;
const iso = (ms) => new Date(ms).toISOString();

// ── 1. orderIdFor: determinista y único por lead+instante ─────────────────────
{
  const a = orderIdFor("L1", iso(NOW));
  const b = orderIdFor("L1", iso(NOW));
  const c = orderIdFor("L1", iso(NOW + H));
  ok(a === b, "orderIdFor es determinista (mismo lead+instante → mismo id)");
  ok(a !== c, "orderIdFor cambia con el instante de emisión");
  ok(a.startsWith("ord_L1_"), "orderIdFor incluye el leadId");
}

// ── 2. makeEvent: construye eventos válidos, rechaza tipos raros ───────────────
{
  const e = makeEvent("issued", "ord_x", { leadId: "L1", at: NOW, oci: 84 });
  ok(e && e.type === "issued" && e.oci === 84, "makeEvent(issued) lleva oci");
  ok(makeEvent("issued", null) === null, "makeEvent sin orderId → null");
  ok(makeEvent("inventado", "ord_x") === null, "makeEvent con tipo inválido → null");
  const r = makeEvent("resolved", "ord_x", { at: NOW, outcome: "avance" });
  ok(r.outcome === "avance", "makeEvent(resolved) lleva outcome");
  ok(makeEvent("issued", "ord_x", { at: NOW, outcome: "avance" }).outcome === null, "outcome solo en resolved");
}

// ── 3. foldOrders: pliega el ciclo completo issued→obeyed→resolved ────────────
{
  const oid = orderIdFor("L1", iso(NOW));
  const events = [
    makeEvent("issued", oid, { leadId: "L1", at: NOW, oci: 84 }),
    makeEvent("obeyed", oid, { at: NOW + 30 * 60000 }), // 30 min después
    makeEvent("resolved", oid, { at: NOW + H, outcome: "avance" }),
  ];
  const [o] = foldOrders(events);
  ok(o.leadId === "L1" && o.oci === 84, "fold conserva leadId y oci de issued");
  ok(o.state === "resolved", "ciclo completo → state resolved");
  ok(o.outcome === "avance", "fold conserva el outcome");
  ok(o.latencyMinutes === 30, "latencyMinutes = obeyed - issued (30)");
}

// ── 4. foldOrders: orden solo emitida → state issued, sin latencia ────────────
{
  const oid = orderIdFor("L2", iso(NOW));
  const [o] = foldOrders([makeEvent("issued", oid, { leadId: "L2", at: NOW })]);
  ok(o.state === "issued" && o.latencyMinutes === null, "solo emitida → issued, sin latencia");
  ok(o.overrideRegret === false, "sin evento regret → overrideRegret false");
}

// ── 5. foldOrders: append-only — el primer evento de cada tipo gana ───────────
{
  const oid = orderIdFor("L3", iso(NOW));
  const events = [
    makeEvent("issued", oid, { leadId: "L3", at: NOW, oci: 70 }),
    makeEvent("obeyed", oid, { at: NOW + 10 * 60000 }),
    makeEvent("obeyed", oid, { at: NOW + 99 * 60000 }), // duplicado posterior: se ignora
  ];
  const [o] = foldOrders(events);
  ok(o.latencyMinutes === 10, "obeyed duplicado no reescribe la historia (gana el primero)");
}

// ── 6. foldOrders: evento regret marca overrideRegret ─────────────────────────
{
  const oid = orderIdFor("L4", iso(NOW));
  const events = [
    makeEvent("issued", oid, { leadId: "L4", at: NOW }),
    makeEvent("regret", oid, { at: NOW + 50 * H }),
  ];
  const [o] = foldOrders(events);
  ok(o.overrideRegret === true, "evento regret → overrideRegret true");
}

// ── 7. computeOrderEdge: avance entre obedecidas ──────────────────────────────
{
  const mk = (lead, t, obeyed, outcome) => {
    const oid = orderIdFor(lead, iso(t));
    const evs = [makeEvent("issued", oid, { leadId: lead, at: t })];
    if (obeyed) evs.push(makeEvent("obeyed", oid, { at: t + 5 * 60000 }));
    if (outcome) evs.push(makeEvent("resolved", oid, { at: t + H, outcome }));
    return evs;
  };
  const events = [
    ...mk("a", NOW, true, "avance"),
    ...mk("b", NOW + H, true, "propuesta"),
    ...mk("c", NOW + 2 * H, true, "perdido"),
  ];
  const edge = computeOrderEdge(foldOrders(events), NOW + 3 * H);
  ok(edge.obeyed === 3, "3 órdenes obedecidas");
  ok(edge.advanced === 2 && edge.lost === 1, "2 avances (avance+propuesta), 1 perdido");
  ok(edge.edgePct === 67, "edgePct = 2/3 ≈ 67%");
  ok(/67%/.test(edge.line), "la línea de edge expone el porcentaje");
}

// ── 8. computeOrderEdge: orden ignorada (emitida, no obedecida, vencida) ──────
{
  const oid = orderIdFor("z", iso(NOW));
  const events = [makeEvent("issued", oid, { leadId: "z", at: NOW })];
  const edge = computeOrderEdge(foldOrders(events), NOW + 50 * H); // 50h después > 48h
  ok(edge.ignored === 1, "orden emitida y no obedecida en 48h → ignored");
  ok(edge.obeyed === 0 && edge.line === null, "sin obedecidas → sin línea de edge");
}

// ── 9. OUTCOME_STATUS: mapea los 5 resultados a status del tracking ───────────
{
  ok(OUTCOME_STATUS.avance === "interested", "avance → interested");
  ok(OUTCOME_STATUS.propuesta === "proposal_sent", "propuesta → proposal_sent");
  ok(OUTCOME_STATUS.perdido === "rejected", "perdido → rejected");
  ok(OUTCOME_STATUS.sin_respuesta === "no_answer", "sin_respuesta → no_answer");
  ok(OUTCOME_STATUS.seguimiento === "follow_up", "seguimiento → follow_up");
}

// ── 10. store: el Ledger es append-only e idempotente ─────────────────────────
{
  const store = await import("../src/store.js");
  const oid = orderIdFor("S1", iso(NOW));
  store.ledgerIssue(oid, { leadId: "S1", at: NOW, oci: 80 });
  store.ledgerIssue(oid, { leadId: "S1", at: NOW + H, oci: 90 }); // duplicado: ignorado
  const issued = store.getLedger().filter((e) => e.orderId === oid && e.type === "issued");
  ok(issued.length === 1, "ledgerIssue es idempotente (una sola fila issued por orden)");

  store.ledgerObey(oid, NOW + 60000);
  store.ledgerResolve(oid, "avance", NOW + 2 * H);
  store.ledgerResolve(oid, "perdido", NOW + 3 * H); // duplicado: ignorado
  const folded = foldOrders(store.getLedger()).find((o) => o.orderId === oid);
  ok(folded.state === "resolved" && folded.outcome === "avance", "store pliega el ciclo; el primer resolved gana");

  const before = store.getLedger().length;
  store.ledgerObey(oid, NOW + 5 * H); // ya obedecida: no añade
  ok(store.getLedger().length === before, "ledgerObey no duplica una orden ya obedecida");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
