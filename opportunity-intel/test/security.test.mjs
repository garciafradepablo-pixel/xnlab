// =============================================================================
// security.test.mjs — Defensas contra inyección. URL schemes peligrosos en
// href/src, e inyección de fórmulas en CSV (Excel/Sheets). Pruebas puras.
// =============================================================================

import { safeUrl } from "../src/ui/dom.js";
import { toCSV } from "../src/export.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("security.test.mjs");

// --- safeUrl: neutraliza esquemas que ejecutan código, deja pasar navegación real ---
ok(safeUrl("javascript:alert(1)") === "#", "javascript: → neutralizado a #");
ok(safeUrl("  JavaScript:alert(1)") === "#", "javascript: con espacios/mayúsculas → neutralizado");
ok(safeUrl("data:text/html,<script>") === "#", "data: → neutralizado");
ok(safeUrl("vbscript:msgbox") === "#", "vbscript: → neutralizado");
ok(safeUrl("https://acme.com") === "https://acme.com", "https legítimo → intacto");
ok(safeUrl("mailto:hola@acme.com") === "mailto:hola@acme.com", "mailto legítimo → intacto");
ok(safeUrl("/ruta/relativa") === "/ruta/relativa", "ruta relativa → intacta");
ok(safeUrl("tel:+34600000000") === "tel:+34600000000", "tel legítimo → intacto");

// --- CSV: una celda que empieza por =/+/-/@ no debe re-emitirse como fórmula viva ---
const evilOpp = {
  id: "x1", company: "=HYPERLINK(\"http://evil\")", city: "+CMD", website: "https://ok.com",
  scores: {}, decision: { oci: 50 },
};
const csv = toCSV([evilOpp], {});
ok(!/(^|,|\n)=HYPERLINK/.test(csv), "la celda =HYPERLINK se neutraliza (apóstrofo guía), no sale como fórmula");
ok(/'=HYPERLINK/.test(csv) || /"'=HYPERLINK/.test(csv), "la empresa peligrosa lleva apóstrofo guía");
ok(csv.includes("https://ok.com"), "una celda normal (web) no se altera");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
