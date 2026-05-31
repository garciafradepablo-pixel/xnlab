// =============================================================================
// ui.test.mjs — Smoke test de la UI sin cabeza (red de seguridad anti-regresión,
// Fase 2 / hallazgo H2). Monta app.js sobre un shim de DOM propio (cero deps) y
// comprueba que las pantallas críticas RENDERIZAN y que los handlers DISPARAN
// sin lanzar. Caza justo lo que el gate del motor no veía: que un cambio de UI
// rompa el login, el ranking o la ficha en producción (premortem PM4).
// =============================================================================

import { installDOM } from "./_dom.mjs";
installDOM(); // debe ir ANTES de importar la UI (dom.js usa `document`)

const { mount } = await import("../src/ui/app.js");
const auth = await import("../src/auth.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
const root = document.createElement("div");
console.log("ui.test.mjs");

// ── 1. Pantalla de acceso (sin sesión) ───────────────────────────────────────
try {
  await mount(root);
  ok(root.querySelector(".auth-screen") != null, "renderiza la pantalla de acceso sin sesión");
  ok(root.querySelector(".auth-card") != null, "muestra la tarjeta de login");
} catch (e) { ok(false, "mount sin sesión no debe lanzar: " + e.message); }

// ── 2. Crea sesión local y monta la app con sesión ───────────────────────────
auth.createUser("SmokePablo", "clave1234", "#4a9eff"); // cuenta local (sin red)
const lg = auth.login("SmokePablo", "clave1234");
ok(lg.ok, "login local de prueba correcto");

try {
  await mount(root);
  ok(root.querySelector(".navwrap") != null, "con sesión renderiza el shell de navegación");
  ok(root.querySelector(".zones") != null, "renderiza la barra de zonas");
  ok(root.querySelector(".app-head") != null, "renderiza la cabecera de la app");
} catch (e) { ok(false, "mount con sesión no debe lanzar: " + e.message); }

// ── 3. Nav premium: zona "Captar" → subpestaña "Oportunidades" → tarjetas ────
const byText = (sel, re) => root.querySelectorAll(sel).find((t) => re.test(t.textContent));
try {
  ok(root.querySelector(".zones") != null, "renderiza la barra de zonas (nav nivel 1)");
  const capture = byText(".zone", /Captar/i);
  ok(capture != null, "existe la zona Captar");
  if (capture) {
    capture.click();
    const oppTab = byText(".tab", /Oportun/i);
    ok(oppTab != null, "la zona Captar muestra la subpestaña Oportunidades");
    if (oppTab) {
      oppTab.click();
      ok(root.querySelector(".card") != null, "Oportunidades renderiza al menos una tarjeta");
      ok(root.querySelector(".c-open") != null, "la tarjeta ofrece el botón de abrir caso (⤢)");
    }
  }
} catch (e) { ok(false, "navegar Captar→Oportunidades no debe lanzar: " + e.message); }

// ── 4. Abrir un caso a pantalla completa (código nuevo) y cerrarlo ────────────
try {
  const openBtn = root.querySelector(".c-open");
  if (openBtn) {
    openBtn.click();
    const screen = document.body.querySelector(".case-screen");
    ok(screen != null, "abrir un caso monta la vista a pantalla completa");
    ok(screen && screen.querySelector(".case-card") != null, "la vista de caso contiene la tarjeta ancha");
    ok(screen && screen.querySelector(".case-bar") != null, "la vista de caso tiene cabecera de marca (ballena)");
    const back = screen && screen.querySelector(".case-back");
    ok(back != null, "la vista de caso tiene botón Volver");
    if (back) { back.click(); ok(document.body.querySelector(".case-screen") == null, "Volver cierra la vista de caso"); }
  } else {
    ok(false, "no se encontró botón de abrir caso para el smoke de pantalla completa");
  }
} catch (e) { ok(false, "abrir/cerrar caso no debe lanzar: " + e.message); }

// ── 5. Recorrer TODAS las zonas y sus subpestañas sin que nada lance ─────────
try {
  const zoneEls = root.querySelectorAll(".zone");
  ok(zoneEls.length >= 4, "hay al menos 4 zonas (Trabajar/Captar/Cerrar/Memoria)");
  for (const z of zoneEls) {
    if (/⌘K/.test(z.textContent)) continue; // el botón de comandos se prueba aparte
    z.click();
    ok(root.querySelector(".navwrap") != null, `la zona «${z.textContent.trim().slice(0, 14)}» renderiza sin romper el shell`);
    for (const t of root.querySelectorAll(".subtabs .tab")) {
      t.click();
      ok(root.querySelector(".navwrap") != null, `subpestaña «${t.textContent.trim().slice(0, 14)}» ok`);
    }
  }
} catch (e) { ok(false, "navegar zonas/subpestañas no debe lanzar: " + e.message); }

// ── 6. La paleta de comandos (⌘K) abre y cierra ──────────────────────────────
try {
  const cmdBtn = root.querySelectorAll(".zone").find((z) => /⌘K/.test(z.textContent));
  ok(cmdBtn != null, "existe el botón ⌘K");
  if (cmdBtn) {
    cmdBtn.click();
    const palette = document.body.querySelector(".cmd-overlay");
    ok(palette != null, "⌘K abre la paleta de comandos");
    ok(palette && palette.querySelector(".cmd-input") != null, "la paleta tiene campo de búsqueda");
    ok(palette && palette.querySelector(".cmd-item") != null, "la paleta lista comandos");
    if (palette) { palette.remove(); ok(document.body.querySelector(".cmd-overlay") == null, "la paleta se cierra"); }
  }
} catch (e) { ok(false, "la paleta ⌘K no debe lanzar: " + e.message); }

// ── 7. Perfil: estudio de avatar (foto/emoji/símbolo/fondo/efecto) ───────────
try {
  await mount(root); // vuelve al shell con sesión tras la navegación previa
  const chip = root.querySelector(".user-chip");
  ok(chip != null, "la cabecera muestra el chip de usuario");
  if (chip) {
    chip.click();
    const panel = document.body.querySelector(".prof-panel");
    ok(panel != null, "pulsar el chip abre el panel de perfil");
    const studio = panel && panel.querySelector(".av-studio");
    ok(studio != null, "el perfil incluye el estudio de avatar");
    ok(studio && studio.querySelector(".av-tabs") != null, "el estudio tiene pestañas foto/emoji/símbolo");
    // Personalizar (emoji + fondo + efecto) no debe lanzar.
    const em = studio && studio.querySelector(".av-em");
    ok(em != null, "el estudio ofrece emojis/símbolos elegibles");
    if (em) em.click();
    const sw = studio && studio.querySelector(".av-sw");
    if (sw) sw.click();
    const fx = studio && studio.querySelector(".av-fxchip");
    if (fx) fx.click();
    ok(true, "elegir emoji + fondo + efecto no lanza");
    const x = document.body.querySelector(".prof-panel .pb-x");
    if (x) { x.click(); ok(document.body.querySelector(".prof-panel") == null, "cerrar el perfil con ✕ funciona"); }
  }
} catch (e) { ok(false, "abrir/usar el estudio de avatar no debe lanzar: " + e.message); }

// ── 8. La entrada muestra el censo de participantes (no iniciales sueltas) ───
try {
  // Drena cualquier re-render asíncrono pendiente de la personalización previa
  // para que la pantalla de acceso sea lo último que se pinta.
  await new Promise((r) => setTimeout(r, 0));
  auth.logout();
  await mount(root);
  ok(root.querySelector(".auth-roster") != null, "la pantalla de acceso muestra el censo de participantes");
} catch (e) { ok(false, "el censo de participantes no debe lanzar: " + e.message); }

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
