// =============================================================================
// sectorinfer.test.mjs — El captador detecta el sector o crea uno nuevo limpio.
// =============================================================================
import { inferSector } from "../src/sectorinfer.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("sectorinfer.test.mjs");

const base = [
  { key: "health", label: "Salud y Clínicas", custom: false },
  { key: "hospitality", label: "Hostelería Premium", custom: false },
];

// 1) Mapea a sector base existente por palabra clave.
ok(inferSector("clínicas dentales en Valencia", base).key === "health", "clínicas → salud (existente)");
ok(inferSector("restaurante premium Madrid", base).key === "hospitality", "restaurante → hostelería");
ok(inferSector("promotora de branded residences", base).key === "realestate", "promotora → inmobiliario");
ok(inferSector("marca DTC de moda", base).key === "growth", "marca DTC → growth");
ok(inferSector("clínicas dentales", base).isNew === false, "sector conocido no se marca como nuevo");

// 2) Nicho nuevo → crea etiqueta LIMPIA (sin ciudad ni relleno).
const tattoo = inferSector("estudios de tatuaje en Barcelona", base);
ok(tattoo.isNew === true && tattoo.key === null, "nicho desconocido se marca para crear");
ok(/tatuaje/i.test(tattoo.label) && !/barcelona/i.test(tattoo.label) && !/\bde\b/i.test(tattoo.label),
   "la etiqueta del sector es la categoría, sin ciudad ni relleno");

// 3) Reusa un custom ya existente en vez de duplicar.
const withCustom = [...base, { key: "tatuaje", label: "Tatuaje", custom: true }];
ok(inferSector("estudio de tatuaje fino", withCustom).key === "tatuaje", "reusa el custom existente");

// 4) Vacío.
ok(inferSector("   ", base).empty === true, "consulta vacía se detecta");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
