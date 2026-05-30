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
  ok(root.querySelector(".tabs") != null, "con sesión renderiza la barra de pestañas (shell)");
  ok(root.querySelector(".tab") != null, "hay al menos una pestaña");
  ok(root.querySelector(".app-head") != null, "renderiza la cabecera de la app");
} catch (e) { ok(false, "mount con sesión no debe lanzar: " + e.message); }

// ── 3. Cambiar a "Oportunidades" renderiza tarjetas ──────────────────────────
function tabByText(re) {
  return root.querySelectorAll(".tab").find((t) => re.test(t.textContent));
}
try {
  const oppTab = tabByText(/Oportun/i);
  ok(oppTab != null, "existe la pestaña de Oportunidades");
  if (oppTab) {
    oppTab.click();
    const card = root.querySelector(".card");
    ok(card != null, "la vista de Oportunidades renderiza al menos una tarjeta");
    ok(root.querySelector(".c-open") != null, "la tarjeta ofrece el botón de abrir caso (⤢)");
  }
} catch (e) { ok(false, "cambiar a Oportunidades no debe lanzar: " + e.message); }

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

// ── 5. Recorrer todas las pestañas sin que ninguna lance ─────────────────────
try {
  for (const t of root.querySelectorAll(".tab")) {
    t.click();
    ok(root.querySelector(".tabs") != null, `la pestaña «${t.textContent.trim().slice(0, 18)}» renderiza sin romper el shell`);
  }
} catch (e) { ok(false, "navegar por las pestañas no debe lanzar: " + e.message); }

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
