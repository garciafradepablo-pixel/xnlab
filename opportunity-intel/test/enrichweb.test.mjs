// =============================================================================
// enrichweb.test.mjs — La lectura de la web sube la nota, pero solo con motivo.
// =============================================================================
import { webLeverFromFreshness } from "../src/enrichweb.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("enrichweb.test.mjs");

// Web vieja → indicio amarillo en actionableLever, citando el año.
const old = webLeverFromFreshness({ readable: true, copyright_year: 2018, has_viewport: true }, 2026);
ok(old && old.filter === "actionableLever" && old.level === "yellow", "web vieja → actionableLever amarillo");
ok(/2018/.test(old.note), "la nota cita el año (indicio citado, no inventado)");

// Sin viewport móvil → también palanca.
const nomob = webLeverFromFreshness({ readable: true, copyright_year: 2025, has_viewport: false }, 2026);
ok(nomob && nomob.level === "yellow" && /responsive|viewport/i.test(nomob.note), "sin móvil → palanca amarilla");

// Web al día y responsive → NO inventa indicio.
ok(webLeverFromFreshness({ readable: true, copyright_year: 2025, has_viewport: true }, 2026) === null, "web al día no genera indicio falso");

// No legible → nada.
ok(webLeverFromFreshness({ readable: false }) === null, "web ilegible no genera indicio");
ok(webLeverFromFreshness(null) === null, "sin datos no genera indicio");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
