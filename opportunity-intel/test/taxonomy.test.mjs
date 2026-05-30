// =============================================================================
// taxonomy.test.mjs — El mapa de captación: árbol de categorías desde un prompt.
// Cubre la lógica pura (merge sin duplicar, hojas, conteo por ruta, borrado).
// La generación con IA vive en la Edge Function y no se prueba aquí.
// =============================================================================
import {
  getForest, mergeForest, clearForest, removePath,
  childrenAt, isLeaf, leavesUnder, leadsUnder, pathQuery, countUnder,
} from "../src/taxonomy.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("taxonomy.test.mjs");

clearForest();

// 1) Merge inicial de un árbol anidado.
mergeForest([{ name: "Clínicas", children: [
  { name: "Ortopedia", children: [{ name: "Brackets", children: [] }, { name: "Dermatólogo", children: [] }] },
] }]);
ok(getForest().map((n) => n.name).join() === "Clínicas", "una sola raíz tras el primer merge");
ok(childrenAt(["Clínicas", "Ortopedia"]).length === 2, "Ortopedia tiene 2 hojas");

// 2) Re-merge no duplica y añade hermanos nuevos.
mergeForest([{ name: "clínicas", children: [
  { name: "Ortopedia", children: [{ name: "Brackets", children: [] }] },
  { name: "Fisioterapia", children: [] },
] }]);
ok(getForest().length === 1, "el re-merge (distinta capitalización) no duplica la raíz");
ok(childrenAt(["Clínicas"]).map((n) => n.name).sort().join() === "Fisioterapia,Ortopedia",
   "añade Fisioterapia como hermana sin duplicar Ortopedia");
ok(childrenAt(["Clínicas", "Ortopedia"]).length === 2, "Brackets no se duplica en Ortopedia");

// 3) Hojas y pathQuery.
const leaves = leavesUnder(["Clínicas"]).map((l) => l.path.join("/")).sort();
ok(leaves.length === 3, "3 hojas bajo Clínicas");
ok(isLeaf(["Clínicas", "Ortopedia", "Brackets"]) === true, "Brackets es hoja");
ok(isLeaf(["Clínicas", "Ortopedia"]) === false, "Ortopedia no es hoja");
ok(pathQuery(["Clínicas", "Ortopedia", "Brackets"]) === "Brackets Clínicas", "consulta = hoja + raíz");
ok(pathQuery(["Clínicas"]) === "Clínicas", "ruta de un nivel = la propia raíz");

// 4) Conteo de leads por prefijo de ruta.
const leads = [
  { company: "A", categoryPath: ["Clínicas", "Ortopedia", "Brackets"] },
  { company: "B", categoryPath: ["Clínicas", "Fisioterapia"] },
  { company: "C", categoryPath: null },
  { company: "D", categoryPath: ["Otra", "Cosa"] },
];
ok(countUnder(["Clínicas"], leads) === 2, "2 leads bajo Clínicas");
ok(countUnder(["Clínicas", "Ortopedia"], leads) === 1, "1 lead bajo Ortopedia");
ok(leadsUnder(["Clínicas", "Ortopedia"], leads).map((l) => l.company).join() === "A", "leadsUnder devuelve el lead correcto");
ok(countUnder([], leads) === 3, "prefijo vacío cuenta todos los que tienen ruta (los sin ruta no entran)");

// 5) Borrado de una hoja.
removePath(["Clínicas", "Ortopedia", "Brackets"]);
ok(isLeaf(["Clínicas", "Ortopedia", "Brackets"]) === false || childrenAt(["Clínicas", "Ortopedia"]).length === 1,
   "Brackets desaparece tras removePath");
ok(childrenAt(["Clínicas", "Ortopedia"]).map((n) => n.name).join() === "Dermatólogo", "queda solo Dermatólogo");

// 6) Vaciar.
clearForest();
ok(getForest().length === 0, "clearForest deja el bosque vacío");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
