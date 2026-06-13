// =============================================================================
// verdict.test.mjs — El Veredicto del Reactor. Comprueba que recompone datos
// reales en una dirección honesta: empresa + por qué + riesgo + acción. Y que
// NUNCA inventa (sin datos de objeción, no afirma objeción).
// =============================================================================

import { buildVerdict, buildPriorityList } from "../src/verdict.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("verdict.test.mjs");

const NOW = Date.parse("2026-06-13T09:00:00Z");
const DAY = 86400000;

// Lead de prueba: act_now con OCI alto.
const colom = { id: "c1", company: "Clínica Colom", city: "Valencia", sector: "health" };
const actNow = [{ opp: colom, decision: { oci: 84, decision: "ACT_NOW", dimensions: { fit: 70, pain: 65, timing: 60, access: 55 } } }];

// ── 1. Sin oportunidades accionables → no hay veredicto (honesto) ─────────────
{
  const v = buildVerdict({ actNow: [], now: NOW });
  ok(v.has === false, "sin act_now, el veredicto declara has:false (no inventa)");
}

// ── 2. Lead sin contactar: primer contacto, sin objeción inventada ────────────
{
  const v = buildVerdict({ actNow, tracking: {}, calls: [], tasks: [], now: NOW, today: "2026-06-13" });
  ok(v.has === true, "con act_now hay veredicto");
  ok(v.company === "Clínica Colom", "nombra la empresa real");
  ok(v.leadId === "c1", "expone el leadId para abrir el caso");
  ok(/primer contacto/i.test(v.lastContact), "lead nuevo → marca primer contacto");
  ok(v.objection === null, "sin llamadas en el sector, NO inventa objeción");
  ok(v.lines.every((l) => !/objeción/i.test(l)), "ninguna línea menciona objeción sin datos");
  ok(v.lines[0] === "Tu mejor oportunidad es Clínica Colom.", "abre con la mejor oportunidad");
  ok(v.lines[v.lines.length - 1] === "Empieza por aquí.", "cierra con la orden de arranque");
  ok(v.confidence === "alta", "OCI 84 → confianza alta");
}

// ── 3. Lead contactado hace 9 días → riesgo de enfriamiento real ──────────────
{
  const tracking = { c1: { status: "follow_up", updatedAt: new Date(NOW - 9 * DAY).toISOString() } };
  const v = buildVerdict({ actNow, tracking, calls: [], tasks: [], now: NOW, today: "2026-06-13" });
  ok(/9 días/.test(v.lastContact), "calcula 9 días desde el último contacto");
  ok(typeof v.risk === "string" && v.risk.length > 0, "expone un riesgo concreto de no actuar");
  ok(/enfría|temperatura|toque/i.test(v.risk), "el riesgo habla de perder el hilo, no de un KPI");
}

// ── 4. Con historial de sector → objeción dominante REAL en el veredicto ──────
{
  const calls = [
    { leadId: "x", leadSector: "health", analysis: { objections: ["ya tenemos proveedor"] } },
    { leadId: "y", leadSector: "health", analysis: { objections: ["ya tenemos proveedor"] } },
    { leadId: "z", leadSector: "health", analysis: { objections: ["precio"] } },
  ];
  const v = buildVerdict({ actNow, tracking: {}, calls, tasks: [], now: NOW, today: "2026-06-13" });
  ok(v.objection === "ya tenemos proveedor", "extrae la objeción dominante del sector (la más frecuente)");
  ok(v.lines.some((l) => /ya tenemos proveedor/.test(l)), "el veredicto nombra la objeción real del perfil");
}

// ── 5. Timing bajo → la ventana se está cerrando ──────────────────────────────
{
  const lowTiming = [{ opp: colom, decision: { oci: 72, decision: "ACT_NOW", dimensions: { fit: 70, pain: 65, timing: 10, access: 55 } } }];
  const v = buildVerdict({ actNow: lowTiming, now: NOW, today: "2026-06-13" });
  ok(v.windowOpen === false, "timing 10 → ventana cerrándose");
  ok(v.lines.some((l) => /cerrando/.test(l)), "lo refleja en el veredicto");
}

// ── buildPriorityList ──────────────────────────────────────────────────────────

const lead1 = { id: "p1", company: "Empresa Alpha", city: "Madrid", sector: "tech" };
const lead2 = { id: "p2", company: "Beta Clínica", city: "Barcelona", sector: "health" };
const lead3 = { id: "p3", company: "Gamma Retail", city: "Sevilla", sector: "retail" };

const actNow3 = [
  { opp: lead1, decision: { oci: 84, decision: "ACT_NOW", dimensions: { fit: 80, pain: 60, timing: 50, access: 40 } } },
  { opp: lead2, decision: { oci: 71, decision: "ACT_NOW", dimensions: { fit: 40, pain: 75, timing: 30, access: 50 } } },
  { opp: lead3, decision: { oci: 62, decision: "ACT_NOW", dimensions: { fit: 30, pain: 30, timing: 25, access: 35 } } },
];

// ── 6. Lista vacía cuando no hay actNow ───────────────────────────────────────
{
  const list = buildPriorityList({ actNow: [], tracking: {}, now: NOW });
  ok(list.length === 0, "sin actNow, buildPriorityList devuelve [] (no inventa)");
}

// ── 7. Máximo 3 items incluso con más leads ────────────────────────────────────
{
  const extra = [...actNow3, ...actNow3]; // 6 items
  const list = buildPriorityList({ actNow: extra, tracking: {}, now: NOW });
  ok(list.length === 3, "buildPriorityList limita a 3 prioridades siempre");
}

// ── 8. Rank, company, OCI correctos ───────────────────────────────────────────
{
  const list = buildPriorityList({ actNow: actNow3, tracking: {}, now: NOW });
  ok(list[0].rank === 1, "primer item tiene rank 1");
  ok(list[1].rank === 2, "segundo item tiene rank 2");
  ok(list[2].rank === 3, "tercer item tiene rank 3");
  ok(list[0].company === "Empresa Alpha", "company del #1 correcto");
  ok(list[0].oci === 84, "OCI del #1 correcto (84)");
  ok(list[0].leadId === "p1", "leadId del #1 correcto");
}

// ── 9. Motive derivado de la dimensión más fuerte ─────────────────────────────
{
  const list = buildPriorityList({ actNow: actNow3, tracking: {}, now: NOW });
  ok(list[0].motive === "Perfil de cliente ideal", "#1: fit=80 → motive correcto");
  ok(list[1].motive === "Dolor activo sin resolver", "#2: pain=75 → motive correcto");
  ok(list[2].motive === null, "#3: todas dimensiones <50 → motive null (no inventa)");
}

// ── 10. ctaType: not_called → 'call', recently tracked (no followup due) → 'case'
{
  const tracking = {
    p1: { status: "called", updatedAt: new Date(NOW - 12 * 3600000).toISOString() }, // 12h ago < 48h threshold → not due
  };
  const list = buildPriorityList({ actNow: actNow3.slice(0, 2), tracking, now: NOW });
  ok(list[0].ctaType === "case", "lead contactado (sin followup vencido) → ctaType 'case'");
  ok(list[1].ctaType === "call", "lead sin contactar → ctaType 'call'");
}

// ── 11. riskLine: seguimiento vencido > sin movimiento > ventana cerrándose ───
{
  const stale = { p1: { status: "follow_up", updatedAt: new Date(NOW - 10 * DAY).toISOString(), followUpAt: new Date(NOW - 3 * DAY).toISOString() } };
  const list = buildPriorityList({ actNow: actNow3.slice(0, 1), tracking: stale, now: NOW });
  ok(typeof list[0].riskLine === "string" && list[0].riskLine.length > 0, "lead con seguimiento vencido → riskLine no vacío");
}

// ── 12. riskLine null cuando no hay riesgo ────────────────────────────────────
{
  const fresh = { p1: { status: "called", updatedAt: new Date(NOW - 1 * DAY).toISOString() } };
  const safeActNow = [{ opp: lead1, decision: { oci: 84, decision: "ACT_NOW", dimensions: { fit: 80, pain: 60, timing: 70, access: 40 } } }];
  const list = buildPriorityList({ actNow: safeActNow, tracking: fresh, now: NOW });
  ok(list[0].riskLine === null, "lead recién contactado sin vencimiento → riskLine null");
}

// ── 13. timing <30 → riskLine "Ventana cerrándose" ───────────────────────────
{
  const lowTiming = [{ opp: lead2, decision: { oci: 71, decision: "ACT_NOW", dimensions: { fit: 40, pain: 50, timing: 15, access: 30 } } }];
  const list = buildPriorityList({ actNow: lowTiming, tracking: {}, now: NOW });
  ok(/cerrándose/i.test(list[0].riskLine || ""), "timing 15 → riskLine menciona 'cerrándose'");
}

// ── 14. access máxima → motive "Contacto directo identificado" ────────────────
{
  const accessLead = [{ opp: lead3, decision: { oci: 65, decision: "ACT_NOW", dimensions: { fit: 40, pain: 50, timing: 30, access: 80 } } }];
  const list = buildPriorityList({ actNow: accessLead, tracking: {}, now: NOW });
  ok(list[0].motive === "Contacto directo identificado", "access=80 → motive 'Contacto directo identificado'");
}

// ── 15. timing máxima → motive "Ventana de compra activa" ────────────────────
{
  const timingLead = [{ opp: lead1, decision: { oci: 75, decision: "ACT_NOW", dimensions: { fit: 30, pain: 40, timing: 85, access: 20 } } }];
  const list = buildPriorityList({ actNow: timingLead, tracking: {}, now: NOW });
  ok(list[0].motive === "Ventana de compra activa", "timing=85 → motive 'Ventana de compra activa'");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
