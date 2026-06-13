// =============================================================================
// orders.test.mjs — El loop de órdenes. Una orden deja de ser una recomendación
// visual: tiene ancla temporal (`orderIssuedAt`) y un estado vivo derivado.
// Comprueba deriveOrderStatus (puro) y stampOrderIssued (emisión sin duplicar).
// =============================================================================

import { deriveOrderStatus } from "../src/orders.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("orders.test.mjs");

const NOW = Date.parse("2026-06-13T12:00:00Z");
const H = 3600000;
const iso = (ms) => new Date(ms).toISOString();

// ── 1. Sin orderIssuedAt → none (no hay orden, no se inventa) ─────────────────
{
  const r = deriveOrderStatus({ status: "not_called", updatedAt: null }, NOW);
  ok(r.status === "none", "sin orderIssuedAt → status none");
  ok(r.issuedAt === null && r.dueAt === null, "none no expone fechas");
}

// ── 2. Recién emitida (dentro de 48h, sin tocar) → pending ────────────────────
{
  const r = deriveOrderStatus({ status: "not_called", updatedAt: null, orderIssuedAt: iso(NOW - 2 * H) }, NOW);
  ok(r.status === "pending", "emitida hace 2h sin ejecutar → pending");
  ok(r.dueAt === iso(NOW - 2 * H + 48 * H), "dueAt = issuedAt + 48h");
}

// ── 3. updatedAt posterior a issuedAt → executed (el fundador actuó) ──────────
{
  const issuedAt = iso(NOW - 5 * H);
  const r = deriveOrderStatus({ status: "called", updatedAt: iso(NOW - 1 * H), orderIssuedAt: issuedAt }, NOW);
  ok(r.status === "executed", "tracking tocado después de emitir → executed");
}

// ── 3b. updatedAt ANTERIOR a issuedAt no cuenta como ejecución ────────────────
{
  // Lead contactado hace tiempo; la orden se emite DESPUÉS. No es ejecución.
  const r = deriveOrderStatus({ status: "follow_up", updatedAt: iso(NOW - 10 * H), orderIssuedAt: iso(NOW - 2 * H) }, NOW);
  ok(r.status === "pending", "updatedAt previo a la emisión NO cuenta como executed");
}

// ── 4. 49h sin actualización → ignored ────────────────────────────────────────
{
  const r = deriveOrderStatus({ status: "not_called", updatedAt: null, orderIssuedAt: iso(NOW - 49 * H) }, NOW);
  ok(r.status === "ignored", "49h sin ejecutar y sin cadencia → ignored");
}

// ── 5. ignored + seguimiento vencido → escalated (doble señal) ────────────────
{
  // status follow_up tiene cadencia (48h, 120h). updatedAt hace 49h → 1er toque
  // (48h) ya venció. La orden se emitió hace 49h y no se ejecutó → escalated.
  const r = deriveOrderStatus({ status: "follow_up", updatedAt: iso(NOW - 49 * H), orderIssuedAt: iso(NOW - 49 * H) }, NOW);
  ok(r.status === "escalated", "ignored + followup vencido → escalated");
}

// ── 5b. ignored sin cadencia (not_called) NO escala ───────────────────────────
{
  const r = deriveOrderStatus({ status: "not_called", updatedAt: null, orderIssuedAt: iso(NOW - 60 * H) }, NOW);
  ok(r.status === "ignored", "not_called no tiene cadencia → se queda en ignored, no escala");
}

// ── stampOrderIssued: emisión idempotente (corre sobre el store en memoria) ───

const store = await import("../src/store.js");

// ── 6. Emite cuando no hay orden (none) → pending ─────────────────────────────
{
  const rec = store.stampOrderIssued("ord_lead_a", NOW);
  ok(!!rec.orderIssuedAt, "stampOrderIssued estampa orderIssuedAt en un lead nuevo");
  ok(deriveOrderStatus(rec, NOW).status === "pending", "tras estampar, la orden está pending");
}

// ── 7. No sobreescribe si la orden está pending ───────────────────────────────
{
  const first = store.getRecord("ord_lead_a").orderIssuedAt;
  store.stampOrderIssued("ord_lead_a", NOW + 1 * H); // sigue dentro de 48h → pending
  const second = store.getRecord("ord_lead_a").orderIssuedAt;
  ok(first === second, "orden pending: stampOrderIssued NO re-emite (mismo orderIssuedAt)");
}

// ── 8. Re-emite cuando la orden está ignored ──────────────────────────────────
{
  // Emitida hace 49h sin tocar → ignored. Re-emitir debe mover el ancla a ahora.
  const oldNow = NOW - 49 * H;
  store.stampOrderIssued("ord_lead_b", oldNow);
  const before = store.getRecord("ord_lead_b").orderIssuedAt;
  ok(deriveOrderStatus(store.getRecord("ord_lead_b"), NOW).status === "ignored", "lead_b está ignored a NOW");
  store.stampOrderIssued("ord_lead_b", NOW); // ignored → re-emite
  const after = store.getRecord("ord_lead_b").orderIssuedAt;
  ok(after !== before && after === iso(NOW), "orden ignored: stampOrderIssued re-emite (orderIssuedAt actualizado)");
}

// ── 9. stamp no toca status ni updatedAt del lead ─────────────────────────────
{
  store.stampOrderIssued("ord_lead_c", NOW);
  const rec = store.getRecord("ord_lead_c");
  ok(rec.status === "not_called", "stampOrderIssued no inventa status (sigue not_called)");
  ok(rec.updatedAt == null, "stampOrderIssued no toca updatedAt");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
