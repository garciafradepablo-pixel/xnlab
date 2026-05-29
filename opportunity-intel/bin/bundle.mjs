#!/usr/bin/env node
// =============================================================================
// bin/bundle.mjs — Empaqueta TODA la app en un único HTML funcional.
//
// A diferencia del snapshot (foto estática, sin lógica), esto produce la app
// REAL interactiva en un solo archivo: tabs (Oportunidades, Buscar leads,
// Ranking, CRM, Embudo, Aprendizaje), filtros, verificación, alta de leads,
// export/import... todo funciona al abrir el archivo en el móvil, sin servidor.
//
// Cómo: inline el CSS, y mete cada módulo ES como un data: URL en un <importmap>
// con specifiers "oi:<ruta>". Los imports relativos de cada módulo se reescriben
// a esos specifiers, que el navegador resuelve globalmente vía el importmap.
//
// Uso:  node bin/bundle.mjs [--out app.html]
// =============================================================================

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const srcDir = resolve(root, "src");

// --- recolectar todos los .js bajo src/ --------------------------------------
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

// id canónico de un módulo: "oi:<ruta relativa a src, posix>"
const idOf = (absPath) => "oi:" + relative(srcDir, absPath).split(/[\\/]/).join("/");

// reescribe los imports relativos de un módulo a specifiers "oi:..."
function rewriteImports(filePath, code) {
  const dir = dirname(filePath);
  return code.replace(/from\s*(["'])(\.\.?\/[^"']+)\1/g, (_m, _q, rel) => {
    const target = resolve(dir, rel);
    return `from "${idOf(target)}"`;
  });
}

const files = walk(srcDir).filter((f) => !f.endsWith("styles.css"));
const imports = {};
let leftover = 0;
for (const f of files) {
  const id = idOf(f);
  const rewritten = rewriteImports(f, readFileSync(f, "utf8"));
  if (/from\s*["']\.\.?\//.test(rewritten)) leftover++; // sanity: no debe quedar ninguno
  const b64 = Buffer.from(rewritten, "utf8").toString("base64");
  imports[id] = `data:text/javascript;base64,${b64}`;
}
if (leftover) {
  console.error(`ERROR: ${leftover} módulo(s) con imports relativos sin reescribir.`);
  process.exit(1);
}

const css = readFileSync(resolve(srcDir, "ui/styles.css"), "utf8");
const importmap = JSON.stringify({ imports }, null, 0);

const args = process.argv.slice(2);
const outArg = args.indexOf("--out");
const outPath = resolve(outArg >= 0 ? args[outArg + 1] : join(root, "app.html"));

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0e0f12">
<title>01 · XN LAB — Inteligencia de Oportunidades</title>
<style>${css}</style>
</head>
<body>
<div id="app" class="app"></div>
<noscript>Esta herramienta requiere JavaScript.</noscript>
<script type="importmap">${importmap}</script>
<script type="module">
  import { mount } from "oi:ui/app.js";
  mount(document.getElementById("app"));
</script>
</body>
</html>`;

writeFileSync(outPath, html, "utf8");
console.log(`App funcional (1 archivo, ${(html.length / 1024).toFixed(0)} KB) → ${outPath}`);
console.log(`Módulos embebidos: ${Object.keys(imports).length}`);
