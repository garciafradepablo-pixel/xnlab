// =============================================================================
// verdict.test.mjs — El Veredicto del Reactor. Comprueba que recompone datos
// reales en una dirección honesta: empresa + por qué + riesgo + acción. Y que
// NUNCA inventa (sin datos de objeción, no afirma objeción).
// =============================================================================

import { buildVerdict } from "../src/verdict.js";

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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
