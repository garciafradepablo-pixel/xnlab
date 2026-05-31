// =============================================================================
// users — Cuentas durables + RBAC (Supabase). FUNCIÓN UNIÓN.
//
// Reconcilia dos modelos que vivían en ramas distintas:
//   · Privacidad: el nombre real (NOMBRE + APELLIDO) y el email solo los ve el
//     ADMIN. El resto del equipo se ve por APODO (aka) + foto/emoji + color.
//     Cada uno edita su aka/email/foto desde su perfil (setProfile).
//   · Equipo: etiquetas (tags) y nivel jerárquico (tier) por persona, con
//     catálogo de etiquetas y backend de administración.
//
// Acciones: register, login, me, list, setPassword, setRole, setProfile,
// setAvatar, createInvite, setTags, setTier, setUserTags, tagCatalog,
// addTag, removeTag.
// - Contraseñas: SHA-256(salt + "::" + password), sal por usuario. El cliente
//   nunca ve los hashes.
// - Sesión: al register/login se emite un TOKEN opaco (no es la service_role
//   key) que el cliente guarda y envía en las llamadas que mutan datos. El
//   servidor resuelve token → usuario/rol y decide permisos.
// - Roles: admin/editor/viewer/analyst. El primer usuario del workspace nace
//   admin; el resto editor. setRole es solo-admin y protege al último admin.
// - Nombres de equipo: SIEMPRE en MAYÚSCULAS y con NOMBRE + APELLIDO (canónico).
// - Email: OPCIONAL en el alta (no bloquea el registro). Cada uno lo completa
//   luego desde su perfil. Si se manda, se valida.
//
// verify_jwt=false: la publishable no es un JWT; la autenticación es propia.
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

const ROLES = ["admin", "editor", "viewer", "analyst"];
const normRole = (r: string) => (ROLES.includes(r) ? r : "viewer");

// Apodo por defecto = nombre de pila (privacidad: el equipo se ve por aka).
const firstName = (n: string) => {
  const w = String(n || "").trim().split(/\s+/)[0] || "";
  return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : "";
};
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
// Foto de avatar: data URL de imagen. Tope de tamaño para no inflar la fila.
const PHOTO_MAX = 700_000; // ~0.7 MB en base64
const cleanPhoto = (p: unknown) => {
  const s = String(p || "").trim();
  if (!s) return "";
  if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(s)) return null; // inválida
  if (s.length > PHOTO_MAX) return null; // demasiado grande
  return s;
};

// Catálogo de etiquetas de equipo (slugs vivos). Se valida lo que el usuario
// elige contra el catálogo para no guardar etiquetas inventadas.
async function catalogSlugs(): Promise<Set<string>> {
  const res = await rest(`connect_team_tags?select=slug`);
  const rows = await res.json();
  return new Set((Array.isArray(rows) ? rows : []).map((r: any) => String(r.slug)));
}
// Limpia una lista de etiquetas: minúsculas, únicas, presentes en el catálogo,
// tope de 24. Si no se puede leer el catálogo, se acepta tal cual (degradado).
async function sanitizeTags(tags: unknown): Promise<string[]> {
  if (!Array.isArray(tags)) return [];
  const want = [...new Set(tags.map((t) => String(t || "").trim().toLowerCase()).filter(Boolean))].slice(0, 24);
  if (!want.length) return [];
  try {
    const cat = await catalogSlugs();
    return cat.size ? want.filter((t) => cat.has(t)) : want;
  } catch {
    return want;
  }
}
const slugify = (s: string) =>
  String(s || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

// Caducidad de sesión: un token más viejo que esto deja de valer y exige
// re-login. Limita la ventana de un token filtrado.
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const tokenExpired = (tokenAt: string | null) =>
  !!tokenAt && Date.now() - new Date(tokenAt).getTime() > TOKEN_TTL_MS;

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randHex(n: number): string {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
  const res = await rest(`connect_users?select=id,name,name_lower,color,role,avatar,aka,email,photo,tags,tier,token_at&token=eq.${encodeURIComponent(token)}`);
  const rows = await res.json();
  const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!u || tokenExpired(u.token_at)) return null; // sesión caducada → re-login
  return u;
}

async function issueToken(id: string): Promise<string> {
  const token = randHex(24);
  await rest(`connect_users?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ token, token_at: new Date().toISOString() }),
  });
  return token;
}

// Token de sesión que NO rompe sesiones existentes: si el usuario ya tiene un
// token vigente, lo reutiliza (solo refresca caducidad). Solo emite uno nuevo si
// no hay o caducó. Antes el login rotaba el token y dejaba "Solo local" a las
// demás pestañas/dispositivos del mismo usuario.
async function sessionToken(id: string, current: string | null, currentAt: string | null): Promise<string> {
  if (current && !tokenExpired(currentAt)) {
    await rest(`connect_users?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ token_at: new Date().toISOString() }),
    });
    return current;
  }
  return await issueToken(id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, name, password, color, token, targetName, role, avatar, invite, aka, email, photo, tags, label, tier } = await req.json().catch(() => ({}));
    // Nombres de equipo: SIEMPRE en MAYÚSCULAS, espacios colapsados. Canónico.
    const nm = String(name || "").trim().replace(/\s+/g, " ").toUpperCase();
    const nameLower = nm.toLowerCase();

    // list: identidad del equipo. PRIVACIDAD: solo el ADMIN ve nombre real y
    // email; el resto ve a los demás por su APODO (aka) + foto/emoji + color.
    // Las etiquetas (tags) y el nivel (tier) se entregan a todos (no son datos
    // sensibles y la vista de equipo los pinta).
    if (action === "list") {
      const caller = await userByToken(String(token || ""));
      const isAdmin = caller?.role === "admin";
      const res = await rest(`connect_users?select=name,aka,email,color,role,avatar,photo,tags,tier`);
      const rows = await res.json();
      const list = (Array.isArray(rows) ? rows : []).map((u: any) => {
        const display = u.aka || firstName(u.name) || u.name;
        const common = { color: u.color, role: u.role, avatar: u.avatar || null, photo: u.photo || null, tags: u.tags || [], tier: u.tier ?? 2 };
        return isAdmin
          ? { name: u.name, aka: display, email: u.email || null, ...common }
          // No-admin: el "name" que se entrega ya ES el apodo (la app nunca ve el real).
          : { name: display, aka: display, ...common };
      });
      return json({ ok: true, users: list });
    }

    // setProfile: el propio usuario edita su APODO (aka), EMAIL y FOTO. El nombre
    // real no se toca aquí. El email se valida solo si se manda.
    if (action === "setProfile") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      const patch: Record<string, unknown> = {};
      if (aka !== undefined) {
        const a = String(aka || "").trim().replace(/\s+/g, " ").slice(0, 24);
        if (a.length < 2) return json({ ok: false, error: "El apodo debe tener al menos 2 caracteres." });
        patch.aka = a;
      }
      if (email !== undefined) {
        if (!validEmail(email)) return json({ ok: false, error: "Pon un email válido para tenerte localizado." });
        patch.email = String(email).trim().toLowerCase();
      }
      if (photo !== undefined) {
        const p = cleanPhoto(photo);
        if (p === null) return json({ ok: false, error: "La foto no es válida o pesa demasiado (máx ~0,7 MB)." });
        patch.photo = p || null; // "" → quitar foto
      }
      if (!Object.keys(patch).length) return json({ ok: false, error: "Nada que actualizar." }, 400);
      const up = await rest(`connect_users?id=eq.${encodeURIComponent(u.id)}`, {
        method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudo guardar el perfil." }, 500);
      const row = (await up.json())[0] || {};
      return json({ ok: true, user: { aka: row.aka || null, email: row.email || null, photo: row.photo || null } });
    }

    // setAvatar: el propio usuario (sesión válida) fija su emoji/avatar.
    if (action === "setAvatar") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      const av = String(avatar || "").trim().slice(0, 8); // emoji corto; nada de URLs largas
      const up = await rest(`connect_users?id=eq.${encodeURIComponent(u.id)}`, {
        method: "PATCH", body: JSON.stringify({ avatar: av || null }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudo guardar el avatar." }, 500);
      return json({ ok: true, avatar: av || null });
    }

    // setTier: SOLO admin. Fija el nivel jerárquico (organigrama) de alguien.
    if (action === "setTier") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN cambia el nivel." }, 403);
      const tgt = String(targetName || "").trim().toLowerCase();
      const t = Math.max(0, Math.min(9, Math.round(Number(tier))));
      if (!tgt) return json({ ok: false, error: "Falta el usuario objetivo." }, 400);
      if (!Number.isFinite(t)) return json({ ok: false, error: "Nivel no válido." }, 400);
      const up = await rest(`connect_users?name_lower=eq.${encodeURIComponent(tgt)}`, {
        method: "PATCH", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ tier: t }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudo cambiar el nivel." }, 500);
      const updated = await up.json();
      if (!Array.isArray(updated) || !updated.length) return json({ ok: false, error: "Usuario no encontrado." }, 404);
      return json({ ok: true, user: { name: updated[0].name, tier: updated[0].tier } });
    }

    // setUserTags: SOLO admin. Ajusta las etiquetas de otra persona (el admin
    // monta los perfiles del equipo sin esperar a que cada uno se etiquete).
    if (action === "setUserTags") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN edita las etiquetas de otros." }, 403);
      const tgt = String(targetName || "").trim().toLowerCase();
      if (!tgt) return json({ ok: false, error: "Falta el usuario objetivo." }, 400);
      const clean = await sanitizeTags(tags);
      const up = await rest(`connect_users?name_lower=eq.${encodeURIComponent(tgt)}`, {
        method: "PATCH", body: JSON.stringify({ tags: clean }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudieron guardar las etiquetas." }, 500);
      return json({ ok: true, tags: clean });
    }

    // tagCatalog: catálogo de etiquetas de equipo. Cualquier sesión válida lo lee.
    if (action === "tagCatalog") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      const res = await rest(`connect_team_tags?select=slug,label&order=label.asc`);
      const rows = await res.json();
      return json({ ok: true, tags: Array.isArray(rows) ? rows : [] });
    }

    // addTag: SOLO admin. Amplía el catálogo de etiquetas de equipo.
    if (action === "addTag") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN amplía el catálogo." }, 403);
      const lbl = String(label || "").trim().slice(0, 40);
      const slug = slugify(lbl);
      if (!slug) return json({ ok: false, error: "Etiqueta no válida." }, 400);
      const up = await rest(`connect_team_tags?on_conflict=slug`, {
        method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ slug, label: lbl, created_by: caller.aka || caller.name || null }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudo añadir la etiqueta." }, 500);
      return json({ ok: true, tag: { slug, label: lbl } });
    }

    // removeTag: SOLO admin. Quita una etiqueta del catálogo (no toca a quien ya
    // la tuviera; queda como histórico hasta que cada uno revise sus etiquetas).
    if (action === "removeTag") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN edita el catálogo." }, 403);
      const slug = slugify(String(label || ""));
      if (!slug) return json({ ok: false, error: "Etiqueta no válida." }, 400);
      const del = await rest(`connect_team_tags?slug=eq.${encodeURIComponent(slug)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
      if (!del.ok) return json({ ok: false, error: "No se pudo quitar la etiqueta." }, 500);
      return json({ ok: true });
    }

    // setTags: el propio usuario fija las etiquetas que lo definen (multi).
    if (action === "setTags") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      const clean = await sanitizeTags(tags);
      const up = await rest(`connect_users?id=eq.${encodeURIComponent(u.id)}`, {
        method: "PATCH", body: JSON.stringify({ tags: clean }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudieron guardar las etiquetas." }, 500);
      return json({ ok: true, tags: clean });
    }

    // createInvite: SOLO admin. Genera un código de invitación de un solo uso.
    if (action === "createInvite") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN puede invitar." }, 403);
      const code = randHex(10);
      const expires_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const inv = await rest(`connect_invites`, {
        method: "POST", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ code, created_by: caller.aka || caller.name || null, role: normRole(String(role || "editor")), expires_at }),
      });
      if (!inv.ok) return json({ ok: false, error: "No se pudo crear la invitación." }, 500);
      return json({ ok: true, code, expires_at });
    }

    // register: crea cuenta, emite token, devuelve rol. CERRADO: salvo el primer
    // usuario del workspace, exige una invitación válida (registro privado).
    if (action === "register") {
      if (nm.length < 2) return json({ ok: false, error: "El nombre debe tener al menos 2 caracteres." });
      // Regla de equipo: NOMBRE + al menos un APELLIDO (dos palabras). En MAYÚSCULAS.
      if (nm.split(" ").filter(Boolean).length < 2) {
        return json({ ok: false, error: "Escribe tu NOMBRE y un APELLIDO (los dos)." });
      }
      if (String(password || "").length < 4) return json({ ok: false, error: "La contraseña debe tener al menos 4 caracteres." });
      // Email OPCIONAL: no bloquea el alta. Si se manda, se valida.
      const em = String(email || "").trim().toLowerCase();
      if (em && !validEmail(em)) return json({ ok: false, error: "El email no es válido." });
      const chk = await rest(`connect_users?select=id&name_lower=eq.${encodeURIComponent(nameLower)}`);
      const existing = await chk.json();
      if (Array.isArray(existing) && existing.length) return json({ ok: false, error: "Ya existe un usuario con ese nombre." });
      // El PRIMER usuario del workspace nace admin y no necesita invitación.
      const anyRes = await rest(`connect_users?select=id&limit=1`);
      const any = await anyRes.json();
      const firstUser = !(Array.isArray(any) && any.length);
      // Registro cerrado: si ya hay usuarios, exige invitación válida.
      let inviteRole: string | null = null;
      const inviteCode = String(invite || "").trim();
      if (!firstUser) {
        if (!inviteCode) return json({ ok: false, error: "Necesitas una invitación para crear tu usuario. Pide el enlace a un admin." }, 403);
        const ir = await (await rest(`connect_invites?select=code,role,used_by,expires_at&code=eq.${encodeURIComponent(inviteCode)}`)).json();
        const row0 = Array.isArray(ir) ? ir[0] : null;
        if (!row0) return json({ ok: false, error: "Invitación no válida." }, 403);
        if (row0.used_by) return json({ ok: false, error: "Esa invitación ya se usó." }, 403);
        if (row0.expires_at && new Date(row0.expires_at) < new Date()) return json({ ok: false, error: "La invitación ha caducado." }, 403);
        inviteRole = normRole(row0.role || "editor");
      }
      const salt = randHex(16);
      const pass_hash = await sha256(`${salt}::${password}`);
      const newRole = firstUser ? "admin" : (inviteRole || "editor");
      const cleanTags = await sanitizeTags(tags); // ronda de etiquetas al registrarse
      const ins = await rest(`connect_users`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name: nm, name_lower: nameLower, aka: firstName(nm), email: em || null, color: color || "#4a9eff", pass_hash, salt, role: newRole, tags: cleanTags }),
      });
      if (!ins.ok) {
        const t = await ins.text();
        if (ins.status === 409 || t.includes("duplicate")) return json({ ok: false, error: "Ya existe un usuario con ese nombre." });
        return json({ ok: false, error: "No se pudo crear el usuario." }, 500);
      }
      if (!firstUser && inviteCode) {
        await rest(`connect_invites?code=eq.${encodeURIComponent(inviteCode)}`, {
          method: "PATCH", body: JSON.stringify({ used_by: firstName(nm), used_at: new Date().toISOString() }),
        });
      }
      const row = (await ins.json())[0];
      const tok = await issueToken(row.id);
      return json({ ok: true, user: { name: row.name, aka: row.aka || firstName(row.name), email: row.email || null, color: row.color, role: row.role, avatar: null, photo: null, tags: row.tags || [], tier: row.tier ?? 2, token: tok } });
    }

    // login: verifica, emite token, devuelve rol.
    if (action === "login") {
      const res = await rest(`connect_users?select=id,name,aka,email,color,role,avatar,photo,tags,tier,pass_hash,salt,token,token_at&name_lower=eq.${encodeURIComponent(nameLower)}`);
      const rows = await res.json();
      const u = Array.isArray(rows) ? rows[0] : null;
      if (!u) return json({ ok: false, error: "Usuario no encontrado." });
      const h = await sha256(`${u.salt}::${password}`);
      if (h !== u.pass_hash) return json({ ok: false, error: "Contraseña incorrecta." });
      // Reutiliza token vigente (no rota) → sesión estable entre pestañas/dispositivos.
      const tok = await sessionToken(u.id, u.token || null, u.token_at || null);
      return json({ ok: true, user: { name: u.name, aka: u.aka || firstName(u.name), email: u.email || null, color: u.color, role: u.role, avatar: u.avatar || null, photo: u.photo || null, tags: u.tags || [], tier: u.tier ?? 2, token: tok } });
    }

    // me: valida un token y devuelve el usuario+rol (fuente de verdad del rol).
    if (action === "me") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      return json({ ok: true, user: { name: u.name, aka: u.aka || firstName(u.name), email: u.email || null, color: u.color, role: u.role, avatar: u.avatar || null, photo: u.photo || null, tags: u.tags || [], tier: u.tier ?? 2 } });
    }

    // setPassword: el propio usuario (sesión válida) cambia su contraseña. Sal
    // nueva por cambio. No requiere admin: cada uno gestiona la suya.
    if (action === "setPassword") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (String(password || "").length < 4) return json({ ok: false, error: "La contraseña debe tener al menos 4 caracteres." });
      const salt = randHex(16);
      const pass_hash = await sha256(`${salt}::${password}`);
      const up = await rest(`connect_users?id=eq.${encodeURIComponent(u.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ salt, pass_hash }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudo cambiar la contraseña." }, 500);
      return json({ ok: true });
    }

    // setRole: SOLO admin. Protege al último admin de quedarse sin él.
    if (action === "setRole") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN puede cambiar roles." }, 403);
      const tgt = String(targetName || "").trim().toLowerCase();
      const newRole = normRole(String(role || ""));
      if (!tgt) return json({ ok: false, error: "Falta el usuario objetivo." }, 400);
      if (newRole !== "admin") {
        const adminsRes = await rest(`connect_users?select=name_lower&role=eq.admin`);
        const admins = await adminsRes.json();
        const adminSet = new Set((Array.isArray(admins) ? admins : []).map((a: any) => a.name_lower));
        if (adminSet.has(tgt) && adminSet.size <= 1) {
          return json({ ok: false, error: "No puedes degradar al último ADMIN." }, 400);
        }
      }
      const up = await rest(`connect_users?name_lower=eq.${encodeURIComponent(tgt)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!up.ok) return json({ ok: false, error: "No se pudo cambiar el rol." }, 500);
      const updated = await up.json();
      if (!Array.isArray(updated) || !updated.length) return json({ ok: false, error: "Usuario objetivo no encontrado." }, 404);
      return json({ ok: true, user: { name: updated[0].name, role: updated[0].role } });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
