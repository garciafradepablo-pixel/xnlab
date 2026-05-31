// =============================================================================
// drive.js — Drive del equipo (cliente): carpetas y archivos para vender.
//
// Helpers puros (validación de carpeta, nombre seguro, ruta, tamaño, tipo) +
// envoltorios finos sobre la Edge Function `drive`. El servidor es la fuente de
// verdad y firma las URLs; aquí solo se prepara y se pide. El token de sesión
// sale de auth (el mismo opaco del resto del cliente).
// =============================================================================

import { getToken } from "./auth.js";
import { remoteDrive } from "./remote.js";

// Carpetas fijas: material de marketing, propuestas y recursos. El slug es la
// clave (prefijo en el bucket); el label es lo que se enseña.
export const FOLDERS = [
  { slug: "marketing", label: "Marketing" },
  { slug: "propuestas", label: "Propuestas" },
  { slug: "recursos", label: "Recursos" },
];

const FOLDER_SLUGS = new Set(FOLDERS.map((f) => f.slug));

/** ¿Es una carpeta del catálogo? Bloquea prefijos inventados. */
export function validFolder(slug) {
  return FOLDER_SLUGS.has(String(slug || ""));
}

/**
 * Limpia el nombre de archivo: quita separadores de ruta y traversal, colapsa
 * espacios y recorta. Conserva la extensión y la legibilidad. "" si queda vacío.
 */
export function safeName(filename) {
  let name = String(filename || "").trim();
  if (!name) return "";
  // Quédate solo con el último segmento: mata "../", "a/b/c" y rutas absolutas.
  name = name.split(/[\\/]/).pop() || "";
  name = name.trim();
  if (!name || name === "." || name === "..") return "";
  // Colapsa espacios y descarta caracteres conflictivos en una clave de objeto.
  name = name.replace(/\s+/g, " ").replace(/[^\w .\-()]+/g, "").trim();
  return name;
}

/** Ruta de objeto `${folder}/${safeName}`. null si la carpeta o el nombre no valen. */
export function buildPath(folderSlug, filename) {
  if (!validFolder(folderSlug)) return null;
  const name = safeName(filename);
  if (!name) return null;
  return `${folderSlug}/${name}`;
}

/** Tamaño legible ("12 KB", "3.4 MB"). */
export function formatSize(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let val = n / 1024, i = 0;
  while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
  // Un decimal por debajo de 10; entero por encima (más limpio a la vista).
  const str = val < 10 ? val.toFixed(1) : String(Math.round(val));
  return `${str} ${units[i]}`;
}

/** Tipo grueso por extensión, para elegir un icono. */
export function fileKind(name) {
  const ext = String(name || "").toLowerCase().split(".").pop();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "heic"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "avi", "mkv", "m4v"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "key", "pages", "txt", "md"].includes(ext)) return "doc";
  return "file";
}

// —— Envoltorios remotos ———————————————————————————————————————————————————————

/** Lista los archivos de una carpeta. {ok, files?, error?} */
export function listFiles(token, folderSlug) {
  return remoteDrive(token || getToken(), { action: "list", folder: folderSlug });
}

/** Pide una URL firmada para subir un archivo a una carpeta. {ok, path, url?, token?} */
export function requestUpload(token, folderSlug, filename, contentType) {
  return remoteDrive(token || getToken(), { action: "signUpload", folder: folderSlug, filename, contentType });
}

/** Pide una URL firmada de descarga para una ruta. {ok, url?, error?} */
export function requestDownload(token, path) {
  return remoteDrive(token || getToken(), { action: "signDownload", path });
}

/** Borra un archivo por su ruta. {ok, error?} */
export function removeFile(token, path) {
  return remoteDrive(token || getToken(), { action: "delete", path });
}
