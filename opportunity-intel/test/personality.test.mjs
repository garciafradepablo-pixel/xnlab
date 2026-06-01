// =============================================================================
// personality.test.mjs — La personalidad de una empresa (animal/aura/elemento/
// símbolo + palabras clave). Cubre: determinismo, mapeo por sector, bandas de
// aura, fallback y forma de las keywords.
// =============================================================================
import { personality, animalEmoji } from "../src/personality.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("personality.test.mjs");

const lead = (over = {}) => ({ company: "Hotel Aurora", sector: "hospitality", subsector: "Boutique luxury hotel", scores: { confidence: 72 }, ...over });

// 1) Determinista: misma empresa → misma personalidad.
const a = personality(lead());
const b = personality(lead());
ok(a.animal.name === b.animal.name && a.aura.label === b.aura.label, "misma empresa da misma personalidad");

// 2) Mapeo por sector: animal del pool correcto + elemento + etiqueta.
for (const [sector, label] of [["hospitality", "Hostelería"], ["health", "Salud y clínicas"], ["realestate", "Inmobiliario"], ["growth", "Crecimiento"]]) {
  const p = personality(lead({ sector, company: `Empresa ${sector}` }));
  ok(p.sectorLabel === label, `sector ${sector} → etiqueta "${label}"`);
  ok(typeof p.animal.emoji === "string" && p.animal.emoji.length > 0, `sector ${sector} trae emoji de animal`);
  ok(typeof p.element === "string" && p.element.length > 0, `sector ${sector} trae elemento`);
  ok(typeof p.animal.symbol === "string", `sector ${sector} trae símbolo`);
}

// 3) Bandas de aura por encaje (coinciden con los umbrales del negocio).
ok(personality(lead({ scores: { confidence: 85 } })).aura.tone === "hot", "≥80 → aura magnética (hot)");
ok(personality(lead({ scores: { confidence: 70 } })).aura.tone === "warm", "60-79 → aura firme (warm)");
ok(personality(lead({ scores: { confidence: 40 } })).aura.tone === "cool", "<60 → aura latente (cool)");
ok(personality(lead({ scores: { confidence: 80 } })).aura.tone === "hot", "el corte de 80 es inclusivo");
ok(personality(lead({ scores: { confidence: 60 } })).aura.tone === "warm", "el corte de 60 es inclusivo");

// 4) Keywords: esquema adaptable — incluye el subsector real, ≤6, únicas, sin vacíos.
const kw = personality(lead({ subsector: "Clínica dental en expansión", sector: "health" })).keywords;
ok(kw.length > 0 && kw.length <= 6, "keywords entre 1 y 6 (esquema, no parrafada)");
ok(kw.includes("Clínica dental en expansión"), "keywords incluyen el subsector real");
ok(kw.every((k) => typeof k === "string" && k.trim().length), "ninguna keyword vacía");
ok(new Set(kw).size === kw.length, "keywords sin duplicados");

// 5) Fallback: sector desconocido → personalidad general (no rompe).
const f = personality(lead({ sector: "no-existe", company: "Rara SL" }));
ok(f.sectorLabel === "General" && f.animal.name === "Mariposa", "sector desconocido → fallback Mariposa/General");

// 6) Robustez: objeto vacío no lanza.
let threw = false;
try { personality(); personality({}); } catch { threw = true; }
ok(!threw, "personality() sin datos no lanza");

// 7) animalEmoji coincide con personality().animal.emoji.
const l = lead({ company: "Coherencia SA" });
ok(animalEmoji(l) === personality(l).animal.emoji, "animalEmoji coincide con la personalidad completa");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
