// =============================================================================
// autopilot.test.mjs — El piloto cuenta cualificadas por marca y sabe cuándo parar.
// =============================================================================
import { autoProgress, AUTO_BAR } from "../src/autopilot.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("autopilot.test.mjs");

const lead = (cls, conf) => ({ scores: { classification: cls, confidence: conf } });
const set = [
  lead("01", 82), lead("01", 75), lead("01", 60), // 01: 2 cualificadas (60 no llega)
  lead("xn", 90),                                   // xn: 1 cualificada
  lead("unqualified", 95),                          // no es 01/xn → no cuenta
];

const p = autoProgress(set, { target: 2 });
ok(p.q01 === 2, "cuenta 2 cualificadas en 01 (descarta la de 60)");
ok(p.qxn === 1, "cuenta 1 cualificada en XN");
ok(AUTO_BAR === 70, "el listón es 70");
ok(p.done === false, "no termina hasta llegar al objetivo en AMBAS marcas");

const p2 = autoProgress([lead("01", 80), lead("01", 81), lead("xn", 80), lead("xn", 99)], { target: 2 });
ok(p2.done === true, "termina cuando 01 y XN alcanzan el objetivo");
ok(p2.pct01 === 100 && p2.pctxn === 100, "porcentajes al 100% en el objetivo");

const p3 = autoProgress([lead("01", 80)], { target: 100 });
ok(p3.pct01 === 1, "porcentaje proporcional al objetivo grande");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
