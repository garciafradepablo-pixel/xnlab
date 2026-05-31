// drive.test.mjs — Drive del equipo: helpers puros (carpeta, nombre, ruta,
// tamaño, tipo). Sin red: solo la lógica que protege el bucket y la vista.
// Shim mínimo de localStorage por si auth.js (importado en cadena) lo toca.
globalThis.localStorage = (() => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
})();

const { FOLDERS, validFolder, safeName, buildPath, formatSize, fileKind } =
  await import("../src/drive.js");

let passed = 0, failed = 0;
const ok = (c, m) => (c ? passed++ : (failed++, console.error("  ✗", m)));
console.log("drive.test.mjs");

// FOLDERS / validFolder
ok(FOLDERS.length === 3, "tres carpetas fijas");
ok(validFolder("marketing") && validFolder("propuestas") && validFolder("recursos"), "las del catálogo valen");
ok(!validFolder("otros") && !validFolder("") && !validFolder(null), "las inventadas/vacías no valen");

// safeName — saneado y rutas maliciosas
ok(safeName("foto.png") === "foto.png", "nombre simple intacto");
ok(safeName("  propuesta final.pdf  ") === "propuesta final.pdf", "recorta extremos");
ok(safeName("a   b.png") === "a b.png", "colapsa espacios");
ok(safeName("../secreto.png") === "secreto.png", "mata el traversal ../");
ok(safeName("../../etc/passwd") === "passwd", "se queda con el último segmento");
ok(safeName("a/b/c.jpg") === "c.jpg", "ignora subcarpetas en el nombre");
ok(safeName("C:\\carpeta\\x.doc") === "x.doc", "mata separadores de Windows");
ok(safeName("") === "" && safeName("   ") === "" && safeName(null) === "", "vacío/espacios/null → ''");
ok(safeName("..") === "" && safeName(".") === "", "'.'/'..' no son nombres");

// buildPath
ok(buildPath("marketing", "foto.png") === "marketing/foto.png", "ruta correcta");
ok(buildPath("recursos", "../x.png") === "recursos/x.png", "sanea el nombre dentro de la ruta");
ok(buildPath("hackeo", "foto.png") === null, "carpeta inválida → null");
ok(buildPath("marketing", "../") === null, "nombre que queda vacío → null");

// formatSize — fronteras
ok(formatSize(0) === "0 B", "cero bytes");
ok(formatSize(512) === "512 B", "por debajo de 1 KB");
ok(formatSize(1024) === "1.0 KB", "1 KB exacto");
ok(formatSize(12 * 1024) === "12 KB", "12 KB sin decimal");
ok(formatSize(Math.round(3.4 * 1024 * 1024)) === "3.4 MB", "3.4 MB con decimal");
ok(formatSize(1024 * 1024 * 1024) === "1.0 GB", "1 GB");
ok(formatSize(-5) === "—" && formatSize("x") === "—", "negativo/no-número → guion");

// fileKind — por extensión
ok(fileKind("foto.PNG") === "image" && fileKind("a.jpg") === "image" && fileKind("logo.svg") === "image", "imágenes");
ok(fileKind("clip.mp4") === "video" && fileKind("reel.mov") === "video", "vídeos");
ok(fileKind("propuesta.pdf") === "doc" && fileKind("hoja.xlsx") === "doc", "documentos");
ok(fileKind("archivo.zip") === "file" && fileKind("sinext") === "file", "el resto → file");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
