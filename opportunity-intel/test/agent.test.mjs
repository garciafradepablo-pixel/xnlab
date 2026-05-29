// =============================================================================
// agent.test.mjs — El agente de captación: busca, evalúa y selecciona leads.
// =============================================================================

import { runBatch, resetAgent } from "../src/agent.js";
import { DEFAULT_CONFIG } from "../src/models.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("agent.test.mjs");

// 1. Una tanda devuelve un resumen con métricas y guarda leads evaluados.
resetAgent();
const saved = [];
const res = await runBatch({
  config: DEFAULT_CONFIG,
  perBatch: 3,
  minScore: 0,
  onSave: (l) => saved.push(l),
});
ok(res.seen > 0, "el agente explora candidatos");
ok(res.evaluated > 0, "el agente evalúa candidatos");
ok(res.added === saved.length, "added coincide con los leads guardados");
ok(Array.isArray(res.queries) && res.queries.length === 3, "ejecuta las consultas de la tanda");
ok(saved.every((l) => l.userAdded), "los leads guardados son leads de usuario");

// 2. Cada lead guardado está EVALUADO (tiene forma puntuable) y no es descarte.
import { scoreOpportunity } from "../src/scoring.js";
for (const l of saved) {
  const s = scoreOpportunity(l, DEFAULT_CONFIG);
  ok(s.classification !== "discard", `${l.company} no es descarte (entró evaluado)`);
}

// 3. No duplica: con los nombres ya vistos, una segunda pasada no re-añade.
const names = new Set(saved.map((l) => l.company));
resetAgent();
const res2 = await runBatch({ config: DEFAULT_CONFIG, perBatch: 3, existingNames: names, onSave: () => {} });
ok(res2.added <= res.added, "con dedup, la segunda tanda no añade los mismos");

// 4. minScore alto reduce o iguala los aceptados (más exigente = menos pasan).
resetAgent();
let lax = 0; await runBatch({ config: DEFAULT_CONFIG, perBatch: 3, minScore: 0, onSave: () => lax++ });
resetAgent();
let strict = 0; await runBatch({ config: DEFAULT_CONFIG, perBatch: 3, minScore: 95, onSave: () => strict++ });
ok(strict <= lax, "un corte más exigente acepta menos o igual");

// 5. La rotación de semillas avanza entre tandas (no repite las mismas queries).
resetAgent();
const a = await runBatch({ config: DEFAULT_CONFIG, perBatch: 2, onSave: () => {} });
const b = await runBatch({ config: DEFAULT_CONFIG, perBatch: 2, onSave: () => {} });
ok(JSON.stringify(a.queries) !== JSON.stringify(b.queries), "tandas consecutivas barren consultas distintas");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
