// =============================================================================
// drive — Almacenamiento de archivos del equipo (Supabase Storage).
//
// Un bucket privado ("connect-drive") con tres carpetas fijas (prefijos):
//   - marketing   → material para vender (imágenes, creatividades).
//   - propuestas  → propuestas y dosieres.
//   - recursos    → recursos internos a mano.
//
// Cualquier usuario autenticado de Connect puede operar (no exige admin). La
// sesión se resuelve por token (el mismo opaco que emite `users`). El cliente
// nunca ve la service_role key: la función firma URLs y el navegador sube/baja
// directo contra Storage, así las imágenes grandes no pasan por aquí.
// =============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días (igual que `users`)
const BUCKET = "connect-drive";
const FOLDERS = new Set(["marketing", "propuestas", "recursos"]);

async function rest(path: string, init: RequestInit = {}) {
  return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function userByToken(token: string) {
  if (!token) return null;
  const res = await rest(`connect_users?select=name,name_lower,role,token_at&token=eq.${encodeURIComponent(token)}`);
  const rows = await res.json();
  const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!u || (u.token_at && Date.now() - new Date(u.token_at).getTime() > TOKEN_TTL_MS)) return null;
  return u;
}

// Llamada al Storage REST con la service_role key (solo en el servidor).
async function storage(path: string, init: RequestInit = {}) {
  return await fetch(`${SUPABASE_URL}/storage/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

// Tipo grueso por extensión, para que el cliente elija el icono.
function fileKind(name: string): string {
  const ext = String(name || "").toLowerCase().split(".").pop() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "heic"].includes(ext)) return "image";
  if (["mp4", "mov", "webm", "avi", "mkv", "m4v"].includes(ext)) return "video";
  if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "key", "pages", "txt", "md"].includes(ext)) return "doc";
  return "file";
}

// La carpeta de una ruta "carpeta/archivo" debe estar en el catálogo.
function folderOfPath(path: string): string {
  return String(path || "").split("/")[0] || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, token, folder, filename, contentType, path } = await req.json().catch(() => ({}));
    const me = await userByToken(String(token || ""));
    if (!me) return json({ ok: false, error: "Sesión no válida." }, 401);

    // list: objetos bajo el prefijo de una carpeta. Oculta el marcador de carpeta.
    if (action === "list") {
      if (!FOLDERS.has(String(folder || ""))) return json({ ok: false, error: "Carpeta no válida." }, 400);
      const res = await storage(`object/list/${BUCKET}`, {
        method: "POST",
        body: JSON.stringify({ prefix: `${folder}/`, limit: 1000, sortBy: { column: "updated_at", order: "desc" } }),
      });
      if (!res.ok) return json({ ok: false, error: "No se pudo listar." }, 500);
      const rows = await res.json();
      const files = (Array.isArray(rows) ? rows : [])
        .filter((o: any) => o && o.name && !o.name.startsWith(".")) // sin placeholder de carpeta
        .map((o: any) => ({
          name: o.name,
          path: `${folder}/${o.name}`,
          size: o.metadata?.size ?? null,
          updated_at: o.updated_at ?? o.created_at ?? null,
          kind: fileKind(o.name),
        }));
      return json({ ok: true, files });
    }

    // signUpload: URL firmada para que el cliente suba directo (PUT) a Storage.
    if (action === "signUpload") {
      if (!FOLDERS.has(String(folder || ""))) return json({ ok: false, error: "Carpeta no válida." }, 400);
      const clean = String(filename || "").trim().split(/[\\/]/).pop() || "";
      if (!clean || clean === "." || clean === "..") return json({ ok: false, error: "Nombre de archivo no válido." }, 400);
      const objPath = `${folder}/${clean}`;
      const res = await storage(`object/upload/sign/${BUCKET}/${objPath}`, { method: "POST", body: JSON.stringify({}) });
      if (!res.ok) return json({ ok: false, error: "No se pudo preparar la subida." }, 500);
      const data = await res.json(); // { url: "/object/upload/sign/...?token=…", token }
      const signed = data.url || data.signedUrl || "";
      return json({
        ok: true,
        path: objPath,
        token: data.token,
        url: `${SUPABASE_URL}/storage/v1${signed}`,
        contentType: contentType || "application/octet-stream",
      });
    }

    // signDownload: URL firmada de descarga (absoluta), válida 1 hora.
    if (action === "signDownload") {
      if (!FOLDERS.has(folderOfPath(path))) return json({ ok: false, error: "Ruta no válida." }, 400);
      const res = await storage(`object/sign/${BUCKET}/${path}`, { method: "POST", body: JSON.stringify({ expiresIn: 3600 }) });
      if (!res.ok) return json({ ok: false, error: "No se pudo firmar la descarga." }, 500);
      const data = await res.json(); // { signedURL: "/object/sign/...?token=…" }
      const signed = data.signedURL || data.signedUrl || data.url || "";
      return json({ ok: true, url: `${SUPABASE_URL}/storage/v1${signed}` });
    }

    // delete: borra un archivo por su ruta (la carpeta debe estar en el catálogo).
    if (action === "delete") {
      if (!FOLDERS.has(folderOfPath(path))) return json({ ok: false, error: "Ruta no válida." }, 400);
      const res = await storage(`object/${BUCKET}/${path}`, { method: "DELETE" });
      if (!res.ok) return json({ ok: false, error: "No se pudo eliminar." }, 500);
      return json({ ok: true });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
