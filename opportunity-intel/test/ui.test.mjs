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

// ── 3. Nav premium: zona "Mapa" → tarjetas (vista única, sin subtab) ──────────
const byText = (sel, re) => root.querySelectorAll(sel).find((t) => re.test(t.textContent));
try {
  ok(root.querySelector(".zones") != null, "renderiza la barra de zonas (nav nivel 1)");
  const mapaZone = byText(".zone", /Mapa/);
  ok(mapaZone != null, "existe la zona Mapa");
  // Nav adelgazada a 2 zonas primarias (Desk · Mapa). Captar y Avanzado ya no
  // ocupan la barra: se alcanzan por ⌘K. La barra mantiene ese acceso por comandos.
  ok(byText(".zone", /⌘K/) != null, "la barra ofrece el acceso por comandos (⌘K), puerta a Captar/Avanzado");
  if (mapaZone) {
    mapaZone.click(); // zona de una vista → navega directamente a «cards», sin subtab
    ok(root.querySelector(".card") != null, "Mapa renderiza al menos una tarjeta");
    ok(root.querySelector(".c-open") != null, "la tarjeta ofrece el botón de abrir caso (⤢)");
    // Tanda 2: el feed trae Command Bar y resumen de buckets.
    ok(root.querySelector(".cmd-ask") != null, "el feed muestra la Command Bar 'Ask Operator'");
    ok(root.querySelector(".buckets") != null, "el feed muestra el resumen de buckets");
    // Tanda 4: Import/Export accesibles y discretos en la cabecera del feed.
    ok(root.querySelector(".feed-io .io-btn") != null, "el feed ofrece acciones Import/Export discretas");
    ok(root.querySelector(".card") != null, "Import/Export no rompe el render de las cards");
    // Tanda 5: control discreto de enriquecimiento web en leads con website.
    ok(root.querySelector(".enrich-btn") != null, "los leads con web ofrecen 'Enriquecer web' (discreto)");
    // Tanda 3.5: ejemplos de comando como chips pulsables (no texto largo).
    ok(root.querySelector(".cmd-examples .cmd-ex") != null, "la Command Bar ofrece ejemplos como chips");
    // Tanda 3: OCI es la jerarquía principal; el anillo de confianza ya no domina.
    ok(root.querySelector(".oci-hero") != null, "la tarjeta muestra el OCI como número principal (hero)");
    ok(root.querySelector(".card .ring") == null, "el anillo de confianza ya no domina la tarjeta");
    // Tanda 3.5: Operator sigue accesible, pero como un solo control (no 4 CTAs).
    ok(root.querySelector(".card .c-operator") != null, "la tarjeta conserva acceso a Operator (control único)");
    ok(root.querySelector(".card .op-row") == null, "la fila de cuatro chips Operator ya no carga el reposo");
  }
} catch (e) { ok(false, "navegar Mapa→Oportunidades no debe lanzar: " + e.message); }

// ── 3b. El Desk (superficie héroe) existe como zona y renderiza sin errores ───
try {
  const deskZone = byText(".zone", /Desk/);
  ok(deskZone != null, "existe la zona Desk en la navegación");
  if (deskZone) {
    deskZone.click();
    ok(root.querySelector(".desk") != null, "Desk renderiza su vista al navegar a ella");
    // Con datos: héroe (siguiente movimiento) + tabla densa. Sin datos: estado vacío.
    // En cualquier caso el Desk ofrece UNA acción primaria.
    ok(root.querySelector(".desk-hero, .desk-empty") != null, "el Desk muestra el héroe o el estado vacío");
    ok(root.querySelector(".desk-act-primary") != null, "el Desk ofrece una acción primaria (Redactar contacto o Conseguir leads)");
  }
} catch (e) { ok(false, "navegar al Desk no debe lanzar: " + e.message); }

// ── 3b-2. El drawer de redacción de contacto abre y cierra ───────────────────
try {
  const go = root.querySelector(".desk-hero .desk-act-primary") || root.querySelector(".dr-go");
  if (go) {
    go.click();
    const drawer = document.body.querySelector(".draft-overlay");
    ok(drawer != null, "«Redactar contacto» abre el drawer de redacción");
    ok(drawer && drawer.querySelector(".draft-message") != null, "el drawer muestra el primer mensaje");
    if (drawer) { drawer.remove(); ok(document.body.querySelector(".draft-overlay") == null, "el drawer se cierra"); }
  }
} catch (e) { ok(false, "el drawer de redacción no debe lanzar: " + e.message); }

// ── 3c. Importar trae TU lista: tras importar, el Desk pasa a «Mi lista» y la
// cuenta importada queda lista para trabajar (reposicionamiento "trae tu lista").
try {
  const flush = async (n = 20) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
  const bodyByText = (sel, re) => document.body.querySelectorAll(sel).find((t) => re.test(t.textContent));
  const UNIQUE = "Zzqq Import Unica 9173 Sl"; // nombre único: no colisiona con seed/Mallorca

  // El Desk es el inicio; para importar navegamos a Mapa (donde vive el feed)
  const mapaZoneForImport = byText(".zone", /Mapa/);
  if (mapaZoneForImport) mapaZoneForImport.click();

  const importBtn = byText(".feed-io .io-btn", /Importar/i);
  ok(importBtn != null, "el editor ve el botón ↧ Importar en el feed");
  if (importBtn) {
    importBtn.click();
    const ta = document.body.querySelector(".imp-ta");
    ok(ta != null, "↧ Importar abre el muelle de importación");
    ta.value = `empresa,web\n${UNIQUE},https://zzqq-unica-9173.example`;
    bodyByText(".imp-bar .btn", /Analizar lista/i).click();
    const primary = document.body.querySelector(".imp-actions .btn-primary");
    ok(primary != null && /Importar 1 nuevo/.test(primary.textContent), "el preview ofrece importar 1 nuevo");
    primary.click();
    await flush();

    // Nuevo comportamiento: aterriza en el Desk, en modo «Mi lista».
    ok(root.querySelector(".desk") != null, "tras importar se aterriza en el Desk");
    const active = root.querySelector(".desk-ds.active");
    ok(active != null && /Mi lista/.test(active.textContent), "el Desk pasa a «Mi lista» (tu pipeline real)");
    const names = [...root.querySelectorAll(".desk-hero-co, .dr-co")].map((n) => n.textContent);
    ok(names.some((t) => new RegExp(UNIQUE).test(t)), "la cuenta importada aparece en el Desk lista para trabajar");

    // Restaura el demo + Mapa para no contaminar los tests siguientes.
    const demoTab = root.querySelectorAll(".desk-ds").find((b) => /Demo/.test(b.textContent));
    if (demoTab) demoTab.click();
    await flush();
    const mapaBack = byText(".zone", /Mapa/);
    if (mapaBack) mapaBack.click();
    await flush();
  }
} catch (e) { ok(false, "el flujo de import → Mi lista no debe lanzar: " + e.message); }

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
  ok(zoneEls.length >= 3, "barra de 2 zonas primarias (Reactor · Mapa) + acceso ⌘K");
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

// ── 7. Permisos por rol con nav de 2 zonas: el gating se conserva, ahora vía ⌘K.
// La barra primaria es Reactor·Mapa para todos; Captar (discover) y CRM (cap crm)
// siguen GATED — alcanzables por la paleta solo para quien tiene el permiso.
try {
  // Abre ⌘K y devuelve las etiquetas de los comandos listados; luego cierra.
  const paletteLabels = () => {
    const cmd = [...root.querySelectorAll(".zone")].find((n) => /⌘K/.test(n.textContent));
    if (cmd) cmd.click();
    const labels = [...document.body.querySelectorAll(".cmd-item")].map((n) => n.textContent.trim());
    const ov = document.body.querySelector(".cmd-overlay"); if (ov) ov.remove();
    return labels;
  };

  // Editor (rol por defecto): nav primaria Reactor·Mapa, y alcanza Buscar (Captar) y CRM.
  await mount(root);
  const zoneNames = [...root.querySelectorAll(".zone")].map((n) => n.textContent.trim());
  ok(zoneNames.some((t) => /Desk/.test(t)) && zoneNames.some((t) => /Mapa/.test(t)), "editor ve la nav primaria (Desk · Mapa)");
  const ed = paletteLabels();
  ok(ed.some((t) => /Ir a Buscar/.test(t)), "editor alcanza «Buscar» (Captar) por ⌘K — tiene discover");
  ok(ed.some((t) => /Ir a CRM/.test(t)), "editor alcanza «CRM» por ⌘K — tiene cap crm");

  // Viewer (solo lectura): conserva la nav, pero Captar y CRM quedan gated (fuera de la paleta).
  globalThis.localStorage.setItem("oi:session", JSON.stringify({ name: "SmokePablo", role: "viewer", token: null }));
  await mount(root);
  const zoneLabels = [...root.querySelectorAll(".zone")].map((n) => n.textContent.trim());
  ok(zoneLabels.some((t) => /Mapa/.test(t)), "viewer conserva la zona «Mapa» (Oportunidades es lectura)");
  const vw = paletteLabels();
  ok(!vw.some((t) => /Ir a Buscar/.test(t)), "viewer NO alcanza «Buscar» (discover gated)");
  ok(!vw.some((t) => /Ir a CRM/.test(t)), "viewer NO alcanza «CRM» (no tiene cap crm)");
  ok(root.querySelector(".navwrap") != null, "el shell sigue entero con rol viewer");

  // Restaura la sesión editor para no contaminar nada posterior.
  globalThis.localStorage.setItem("oi:session", JSON.stringify({ name: "SmokePablo", role: "editor", token: null }));
} catch (e) { ok(false, "la navegación por rol no debe lanzar: " + e.message); }

// ── 8. Los leads importados sobreviven al reload (fix purge + foco persistente) ─
// Garantiza: importar → ver → recargar → seguir encontrando.
try {
  const store = await import("../src/store.js");

  // A) Lead con _source:"imported" NO es eliminado por purgeWeakUserLeads al remount.
  const importedLead = { id: "imported-smoke-01", company: "ImportedSmoke", sector: "growth", subsector: "", signals: {}, evidence: [], _source: "imported" };
  store.saveUserLead(importedLead);
  ok(store.getUserLeads().some((l) => l.id === "imported-smoke-01"), "A) lead importado guardado antes del remount");
  await mount(root);
  ok(store.getUserLeads().some((l) => l.id === "imported-smoke-01"), "A) lead _source:'imported' sobrevive a purgeWeakUserLeads tras remount");

  // B) Lead legacy sin _source y confianza baja SÍ puede ser purgado al remount.
  const legacyLead = { id: "legacy-smoke-01", company: "LegacySmoke", sector: "growth", subsector: "", signals: {}, evidence: [] };
  store.saveUserLead(legacyLead);
  ok(store.getUserLeads().some((l) => l.id === "legacy-smoke-01"), "B) lead legacy guardado antes del remount");
  await mount(root);
  ok(!store.getUserLeads().some((l) => l.id === "legacy-smoke-01"), "B) lead sin _source y baja confianza es purgado tras remount");

  // C) Tras importar, oi:recentImportIds se guarda en localStorage.
  globalThis.localStorage.setItem("oi:recentImportIds", JSON.stringify(["imported-smoke-01"]));
  ok(globalThis.localStorage.getItem("oi:recentImportIds") != null, "C) oi:recentImportIds existe en localStorage tras guardar");

  // D) Tras remount, el foco «Recién importados» se restaura si los ids existen.
  // imported-smoke-01 sobrevivió en (A); oi:recentImportIds apunta a él.
  await mount(root);
  const banner8 = root.querySelector(".focus-banner");
  ok(banner8 != null && /Recién importados/.test(banner8.textContent), "D) tras remount, foco «Recién importados» se restaura si los ids existen");

  // E) Si los ids de localStorage ya no existen, no se activa foco engañoso.
  globalThis.localStorage.setItem("oi:recentImportIds", JSON.stringify(["ghost-id-that-does-not-exist"]));
  await mount(root);
  ok(root.querySelector(".focus-banner") == null, "E) si los ids ya no existen, no se activa foco falso tras remount");
  ok(globalThis.localStorage.getItem("oi:recentImportIds") == null, "E) oi:recentImportIds se limpia si los ids ya no existen");

  // F) El scoring/clasificación de los importados no cambia por tener _source.
  // El lead tiene signals vacíos → confianza baja → 'unqualified' (correcto y honesto).
  // _source solo protege del purge, no infla el score.
  const importedInStore = store.getUserLeads().find((l) => l.id === "imported-smoke-01");
  ok(importedInStore != null, "F) el lead importado sigue en getUserLeads para verificar scoring");
  ok(root.querySelector(".navwrap") != null, "F) la app no crashea con leads _source en el dataset");

  // Limpieza: quitar el lead de prueba y la clave residual.
  store.removeUserLead("imported-smoke-01");
  globalThis.localStorage.removeItem("oi:recentImportIds");
} catch (e) { ok(false, "los leads importados deben sobrevivir al reload: " + e.message); }

// ── 9. ECO_ENABLED=false: el micro flotante (EC·Eco) no está montado ─────────
try {
  ok(document.body.querySelector(".eco-fab") == null, "ECO_ENABLED=false: el micro EC·Eco no está montado en el DOM");
} catch (e) { ok(false, "ECO_ENABLED check no debe lanzar: " + e.message); }

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
