// =============================================================================
// discovery.test.mjs — Descubrimiento interno de candidatos. Run con node.
// =============================================================================

import { searchCandidates, discover, CANDIDATES } from "../src/discovery.js";
import { buildLead } from "../src/newlead.js";
import { scoreOpportunity } from "../src/scoring.js";
import { DEFAULT_CONFIG } from "../src/models.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));

console.log("discovery.test.mjs");

// 1. El directorio tiene candidatos reales con sector y nombre.
ok(CANDIDATES.length >= 10, "el directorio tiene candidatos");
ok(CANDIDATES.every((c) => c.company && c.sector && c.city), "cada candidato tiene nombre, sector y ciudad");

// 2. Filtro por sector.
const health = searchCandidates({ sector: "health" });
ok(health.length > 0 && health.every((c) => c.sector === "health"), "filtra por sector salud");

// 3. Búsqueda por texto (sin acentos / case-insensitive).
const dental = searchCandidates({ query: "clinicas dentales madrid" });
ok(dental.length > 0, "encuentra clínicas dentales en Madrid");
ok(dental.every((c) => /madrid/i.test(c.city)), "los resultados son de Madrid");

// 4. Búsqueda combinada sector + texto.
const r = searchCandidates({ sector: "health", query: "madrid" });
ok(r.length > 0 && r.every((c) => c.sector === "health"), "combina sector + texto");

// 5. Texto sin coincidencias = vacío (no inventa).
ok(searchCandidates({ query: "xyz-no-existe-123" }).length === 0, "sin coincidencias devuelve vacío");

// 6. discover() async devuelve lo mismo que el directorio en modo demo.
const d = await discover({ sector: "health" });
ok(d.length === health.length, "discover() async coincide con el directorio");
ok(d.every((c) => c.source === "directorio"), "marca el origen como directorio");

// 7. Un candidato descubierto se convierte en lead puntuable (sin inventar).
const cand = dental[0];
const lead = buildLead({ company: cand.company, sector: cand.sector, subsector: cand.subsector, city: cand.city, website: cand.website });
const s = scoreOpportunity(lead, DEFAULT_CONFIG);
ok(typeof s.confidence === "number" && s.confidence >= 0, "el candidato añadido se puntúa");
ok(s.classification === "discard" || s.classification === "01" || s.classification === "xn", "recibe una clasificación válida");
// Conservador: un candidato crudo (sin momento ni evidencia) NO debe salir alto.
ok(s.confidence < 60, "un candidato crudo puntúa bajo hasta enriquecerlo (conservador)");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
