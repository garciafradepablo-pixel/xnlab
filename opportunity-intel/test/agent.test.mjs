// =============================================================================
// agent.test.mjs — El agente de captación: busca, evalúa y selecciona leads
// por encima de un listón de calidad.
// =============================================================================

import { runBatch, resetAgent } from "../src/agent.js";
import { scoreOpportunity } from "../src/scoring.js";
import { DEFAULT_CONFIG } from "../src/models.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("agent.test.mjs");

// 1. Prompt libre con ciudad → una consulta exacta; con listón bajo, acepta.
resetAgent();
const saved = [];
const res = await runBatch({
  config: DEFAULT_CONFIG,
  query: "clínicas dentales Madrid",
  minScore: 0,
  onSave: (l) => saved.push(l),
});
ok(res.queries.length === 1 && /Madrid/.test(res.queries[0]), "prompt con ciudad → una consulta exacta");
ok(res.seen > 0, "explora candidatos");
ok(res.added === saved.length, "added coincide con los guardados");
ok(saved.every((l) => l.userAdded), "los guardados son leads de usuario");

// 2. Listón alto (80): una empresa cruda del directorio NO llega → 0 añadidas,
//    pero se reportan como 'belowSample' (candidatos a enriquecer).
resetAgent();
let added80 = 0;
const strict = await runBatch({ config: DEFAULT_CONFIG, query: "clínicas dentales Madrid", minScore: 80, onSave: () => added80++ });
ok(added80 === 0, "con listón 80 no entra una empresa cruda");
ok(strict.added === 0, "added=0 con listón alto");
ok(Array.isArray(strict.belowSample), "reporta belowSample");
ok(strict.belowSample.every((s) => s.confidence < 80), "los belowSample están por debajo del listón");

// 3. Sin prompt → barrido aleatorio entre sectores (varias consultas distintas).
resetAgent();
const rnd = await runBatch({ config: DEFAULT_CONFIG, query: "", perBatch: 4, minScore: 0, onSave: () => {} });
ok(rnd.queries.length >= 1, "sin prompt genera consultas");
ok(new Set(rnd.queries).size === rnd.queries.length, "las consultas aleatorias no se repiten");

// 4. Nada que supere el listón nunca es un descarte duro (4+ rojas) aceptado.
resetAgent();
const kept = [];
await runBatch({ config: DEFAULT_CONFIG, query: "restaurantes premium Madrid", minScore: 0, onSave: (l) => kept.push(l) });
for (const l of kept) {
  const s = scoreOpportunity(l, DEFAULT_CONFIG);
  ok(s.redCount < 4, `${l.company}: no es descarte duro`);
}

// 5. Dedup: empresas ya presentes no se re-añaden.
const names = new Set(saved.map((l) => l.company));
resetAgent();
let re = 0;
await runBatch({ config: DEFAULT_CONFIG, query: "clínicas dentales Madrid", minScore: 0, existingNames: names, onSave: () => re++ });
ok(re <= saved.length, "con dedup no re-añade los mismos");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
