#!/usr/bin/env node
// =============================================================================
// bin/bundle.mjs — Empaqueta TODA la app en un único HTML funcional.
//
// A diferencia del snapshot (foto estática, sin lógica), esto produce la app
// REAL interactiva en un solo archivo: tabs, filtros, verificación, alta de
// leads, export/import... todo funciona al abrir el archivo, sin servidor.
//
// Cómo: inline el CSS, y mete cada módulo ES como un data: URL en un <importmap>
// con specifiers "oi:<ruta>". Los imports relativos se reescriben a esos
// specifiers, que el navegador resuelve globalmente vía el importmap.
//
// Modos:
//   node bin/bundle.mjs [--out app.html]                 → app de un solo archivo
//   node bin/bundle.mjs --launcher --remote <URL> [--out lanzador.html]
//        → "lanzador": al abrirlo busca la última versión en <URL> (auto-
//          actualización del HTML ya descargado) y, si no hay red, usa la copia
//          offline embebida. Así el archivo que tienes guardado siempre muestra
//          las mejoras nuevas sin volver a descargar nada.
// =============================================================================

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const srcDir = resolve(root, "src");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

const idOf = (absPath) => "oi:" + relative(srcDir, absPath).split(/[\\/]/).join("/");

function rewriteImports(filePath, code) {
  const dir = dirname(filePath);
  return code.replace(/from\s*(["'])(\.\.?\/[^"']+)\1/g, (_m, _q, rel) => {
    const target = resolve(dir, rel);
    return `from "${idOf(target)}"`;
  });
}

/** Construye el importmap (specifier → data:URL) y devuelve {imports, css}. */
export function buildModules() {
  const files = walk(srcDir).filter((f) => !f.endsWith("styles.css"));
  const imports = {};
  let leftover = 0;
  for (const f of files) {
    const id = idOf(f);
    const rewritten = rewriteImports(f, readFileSync(f, "utf8"));
    if (/from\s*["']\.\.?\//.test(rewritten)) leftover++;
    imports[id] = `data:text/javascript;base64,${Buffer.from(rewritten, "utf8").toString("base64")}`;
  }
  if (leftover) throw new Error(`${leftover} módulo(s) con imports relativos sin reescribir.`);
  const css = readFileSync(resolve(srcDir, "ui/styles.css"), "utf8");
  return { imports, css };
}

const HEAD = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#0e0f12">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="CONNECT">
<title>CONNECT — Inteligencia de Oportunidades</title>`;

/** HTML de la app de un solo archivo. */
export function buildAppHtml() {
  const { imports, css } = buildModules();
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
<style>${css}</style>
</head>
<body>
<div id="app" class="app"></div>
<noscript>Esta herramienta requiere JavaScript.</noscript>
<script type="importmap">${JSON.stringify({ imports })}</script>
<script type="module">
  import { mount } from "oi:ui/app.js";
  mount(document.getElementById("app"));
</script>
</body>
</html>`;
}

/**
 * HTML "lanzador" auto-actualizable. Lleva DENTRO una copia offline completa,
 * pero al abrirse intenta cargar la última versión desde `remote` (la URL
 * pública). Si hay red → ves siempre las mejoras nuevas sin re-descargar el
 * archivo. Si no hay red → arranca la copia offline embebida.
 */
export function buildLauncherHtml(remote) {
  const offline = buildAppHtml();
  const offlineB64 = Buffer.from(offline, "utf8").toString("base64");
  const remoteJson = JSON.stringify(remote || "");
  return `<!doctype html>
<html lang="es">
<head>
${HEAD}
<style>
  html,body{margin:0;height:100%;background:#0e0f12;color:#e9ecf1;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
  #boot{display:flex;flex-direction:column;align-items:center;justify-content:center;
    height:100%;gap:14px;text-align:center;padding:24px;}
  #boot .logo{font-weight:800;letter-spacing:2px;color:#c9a227;font-size:18px;}
  #boot .msg{font-size:13px;color:#9aa3b0;}
  #boot .spin{width:26px;height:26px;border:3px solid #2a2e37;border-top-color:#c9a227;
    border-radius:50%;animation:r .8s linear infinite;}
  @keyframes r{to{transform:rotate(360deg)}}
  #boot button{margin-top:8px;background:#16181d;color:#e9ecf1;border:1px solid #2a2e37;
    border-radius:8px;padding:9px 16px;font-size:13px;}
</style>
</head>
<body>
<div id="boot">
  <div class="logo">CONNECT</div>
  <div class="spin"></div>
  <div class="msg" id="bootmsg">Buscando la última versión…</div>
  <button id="useoffline" style="display:none">Usar versión guardada</button>
</div>
<script>
// Lanzador auto-actualizable. Escribe el documento con el HTML que toque
// (remoto si hay red, offline si no) usando document.open/write/close.
(function(){
  var REMOTE = ${remoteJson};
  var OFFLINE_B64 = "${offlineB64}";
  var msg = document.getElementById("bootmsg");
  var btn = document.getElementById("useoffline");
  function decodeB64(b64){
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  function render(html){
    document.open(); document.write(html); document.close();
  }
  function offline(){ render(decodeB64(OFFLINE_B64)); }
  btn.onclick = offline;
  // Si no hay URL remota configurada, arranca offline directamente.
  if (!REMOTE){ offline(); return; }
  // Plazo de seguridad: si la red tarda, ofrece la versión guardada.
  var fellBack = false;
  var t = setTimeout(function(){ btn.style.display="inline-block";
    msg.textContent="La red tarda… puedes usar la versión guardada."; }, 4000);
  // Cache-busting para evitar versiones cacheadas por el navegador.
  var url = REMOTE + (REMOTE.indexOf("?")>=0?"&":"?") + "v=" + Date.now();
  fetch(url, { cache: "no-store" })
    .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.text(); })
    .then(function(html){
      if (fellBack) return;
      clearTimeout(t);
      if (!/id=["']app["']/.test(html)) throw new Error("respuesta no válida");
      render(html);
    })
    .catch(function(){ fellBack=true; clearTimeout(t);
      msg.textContent="Sin conexión — abriendo versión guardada…";
      setTimeout(offline, 300);
    });
})();
</script>
</body>
</html>`;
}

// --- CLI ---------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const outArg = args.indexOf("--out");
  const isLauncher = args.includes("--launcher");
  const remoteArg = args.indexOf("--remote");
  const remote = remoteArg >= 0 ? args[remoteArg + 1] : "";
  const outPath = resolve(outArg >= 0 ? args[outArg + 1] : join(root, isLauncher ? "lanzador.html" : "app.html"));

  const html = isLauncher ? buildLauncherHtml(remote) : buildAppHtml();
  writeFileSync(outPath, html, "utf8");
  const kb = (html.length / 1024).toFixed(0);
  if (isLauncher) {
    console.log(`Lanzador auto-actualizable (${kb} KB) → ${outPath}`);
    console.log(`Remoto: ${remote || "(ninguno — solo offline)"}`);
  } else {
    console.log(`App funcional (1 archivo, ${kb} KB) → ${outPath}`);
  }
}
