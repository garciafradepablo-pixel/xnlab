// =============================================================================
// signals.test.mjs — La capa de señales REALES. Comprueba que detecta huecos
// con base verificable y su cita, y que NUNCA inventa: sin base real, [].
// =============================================================================

import { detectSignals, primarySignal, hasRealSignal, signalLever } from "../src/signals.js";

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("signals.test.mjs");

const YEAR = 2026;

// === no_web: hueco fuerte y observable, sin red ===
const nameOnly = detectSignals({ company: "Bar Paco" }, { year: YEAR });
ok(nameOnly.length === 1 && nameOnly[0].key === "no_web", "lead solo-nombre → señal 'no_web'");
ok(nameOnly[0].strength === "strong" && nameOnly[0].verified === true, "no_web es fuerte y verificable (observable)");
ok(nameOnly[0].source === "presencia web", "no_web cita su fuente");

// Web válida → no dispara no_web
ok(detectSignals({ company: "X", website: "https://barpaco.com" }, { year: YEAR }).length === 0,
  "con web real y sin lectura de frescura → sin señales (silencio honesto, no inventa)");
ok(detectSignals({ company: "X", web: "tienda.example.es" }, { year: YEAR }).every((s) => s.key !== "no_web"),
  "el campo 'web' también cuenta como presencia web");

// === web_stale: derivado de una lectura REAL (enrich-web), citado ===
const stale = detectSignals({
  company: "Clínica Vieja", website: "https://clinicavieja.com",
  webFreshness: { readable: true, copyright_year: 2017, has_viewport: false },
}, { year: YEAR });
const ws = stale.find((s) => s.key === "web_stale");
ok(ws != null, "web con copyright 2017 + sin viewport → señal 'web_stale'");
ok(ws && /2017/.test(ws.label), "la etiqueta de web_stale incluye el año real leído");
ok(ws && ws.url === "https://clinicavieja.com" && ws.source === "su web", "web_stale lleva la URL como cita");
ok(ws && ws.strength === "indicative", "web_stale es indicio (el pie de copyright no es prueba férrea)");

// web_stale también sale de la EVIDENCIA persistida por un enrich real (camino app):
// store.applyVerifications deja source "Lectura de su web" + url. Es lo que vive
// tras el recompute, así que es de donde sale web_stale en la app de verdad.
const fromEvidence = detectSignals({
  company: "Vieja2", website: "https://vieja2.com",
  evidence: [{ source: "Lectura de su web", type: "web", url: "https://vieja2.com",
    note: "Palanca de rediseño: web sin actualizar desde 2019 (7 años)." }],
}, { year: YEAR });
const we = fromEvidence.find((s) => s.key === "web_stale");
ok(we != null && /2019/.test(we.label), "web_stale sale de la evidencia citada del enrich (camino real de la app)");
ok(we && we.url === "https://vieja2.com", "web_stale desde evidencia conserva la url como cita");

// Una nota tecleada a mano SIN lectura real (otra fuente, sin url http) NO dispara web_stale.
ok(detectSignals({
  company: "NoReal", website: "https://noreal.com",
  evidence: [{ source: "Verificado por analista", note: "web antigua", url: "verificación-manual" }],
}, { year: YEAR }).length === 0, "evidencia NO derivada de lectura web real → no inventa web_stale");

// Web fresca y responsive → sin web_stale
ok(detectSignals({
  company: "Y", website: "https://moderna.com",
  webFreshness: { readable: true, copyright_year: 2026, has_viewport: true },
}, { year: YEAR }).length === 0, "web actual y responsive → sin señal (no se fuerza un hueco)");

// Frescura no legible → no se usa (no inventa sobre datos no leídos)
ok(detectSignals({
  company: "Z", website: "https://z.com", webFreshness: { readable: false },
}, { year: YEAR }).length === 0, "lectura no legible → no genera señal");

// === primarySignal: lo fuerte (observable) antes que el indicio ===
const both = { company: "Sin Web SL", webFreshness: { readable: true, copyright_year: 2015, has_viewport: false } };
// sin web real → no_web (fuerte); web_stale no aplica porque no hay web válida
ok(primarySignal(both, { year: YEAR }).key === "no_web", "primarySignal prioriza la señal fuerte (no_web)");
ok(hasRealSignal({ company: "Bar Paco" }, { year: YEAR }) === true, "hasRealSignal true cuando hay base real");
ok(hasRealSignal({ company: "X", website: "https://ok.com" }, { year: YEAR }) === false, "hasRealSignal false sin base real");

// === Detectores web observables (offline, leídos de la propia URL) ===
const social = detectSignals({ company: "Bar", website: "https://facebook.com/barpaco" }, { year: YEAR });
ok(social.some((s) => s.key === "social_only" && s.strength === "strong"), "URL de Facebook → 'social_only' (sin web propia)");
ok(detectSignals({ company: "X", website: "https://barpaco.wixsite.com/home" }, { year: YEAR }).some((s) => s.key === "free_host"),
  "wixsite.com → 'free_host' (constructor gratuito)");
ok(detectSignals({ company: "X", website: "http://insegura.com" }, { year: YEAR }).some((s) => s.key === "no_https"),
  "http:// (sin TLS) → 'no_https'");
ok(detectSignals({ company: "X", website: "https://buena.com" }, { year: YEAR }).length === 0,
  "https propia y normal → sin señales (no se fuerza un hueco)");
// no_https + free no se confunden con una web buena
ok(detectSignals({ company: "X", website: "https://wixsite.com/x" }, { year: YEAR }).every((s) => s.key !== "no_https"),
  "una web en https no dispara no_https aunque sea gratuita");

// === Falsos positivos: el anclaje al host evita confundir dominios legítimos ===
ok(detectSignals({ company: "Sitio", website: "https://my-business.site" }, { year: YEAR }).length === 0,
  "un .site legítimo (my-business.site) NO se confunde con red/gratuito");
ok(detectSignals({ company: "Net", website: "https://netflix.com" }, { year: YEAR }).length === 0,
  "netflix.com NO trip social_only por contener 'x.com'");
ok(detectSignals({ company: "Path", website: "https://mishop.com/x.com/promo" }, { year: YEAR }).length === 0,
  "una red en la RUTA (no en el host) no dispara social_only");
ok(detectSignals({ company: "CoUk", website: "https://carrd.co.uk-tienda.com" }, { year: YEAR }).every((s) => s.key !== "free_host"),
  "carrd.co.uk-tienda.com (host distinto) NO se marca free_host");
ok(detectSignals({ company: "Real", website: "https://joesbar.business.site" }, { year: YEAR }).some((s) => s.key === "free_host"),
  "un subdominio real de business.site SÍ es free_host");

// === signalLever: alimenta la puntuación solo donde hay hueco real ===
ok(signalLever({ company: "Solo nombre" }, { year: YEAR }).level === "green", "no_web → palanca 'green' (fuerte)");
ok(signalLever({ company: "X", website: "http://tienda-local.com" }, { year: YEAR }).level === "yellow", "no_https (web propia sin TLS) → palanca 'yellow' (indicio)");
ok(signalLever({ company: "X", website: "https://buena.com" }, { year: YEAR }) === null, "web buena → SIN palanca (cero efecto en el score)");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
