// =============================================================================
// users — Cuentas durables + RBAC (Supabase).
//
// Acciones: register, login, me, list, setPassword, setRole.
// - Contraseñas: SHA-256(salt + "::" + password), sal por usuario. El cliente
//   nunca ve los hashes.
// - Sesión: al register/login se emite un TOKEN opaco (no es la service_role
//   key) que el cliente guarda y envía en las llamadas que mutan datos. El
//   servidor resuelve token → usuario/rol y decide permisos.
// - Roles: admin/editor/viewer/analyst. El primer usuario del workspace nace
//   admin; el resto editor. setRole es solo-admin y protege al último admin.
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
  const res = await rest(`connect_users?select=id,name,name_lower,color,role,avatar,token_at&token=eq.${encodeURIComponent(token)}`);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, name, password, color, token, targetName, role, avatar, invite } = await req.json().catch(() => ({}));
    const nm = String(name || "").trim();
    const nameLower = nm.toLowerCase();

    // list: nombres + colores + roles + avatar (no sensible).
    if (action === "list") {
      const res = await rest(`connect_users?select=name,color,role,avatar`);
      const rows = await res.json();
      return json({ ok: true, users: Array.isArray(rows) ? rows : [] });
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

    // createInvite: SOLO admin. Genera un código de invitación de un solo uso.
    if (action === "createInvite") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN puede invitar." }, 403);
      const code = randHex(10);
      const expires_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const inv = await rest(`connect_invites`, {
        method: "POST", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ code, created_by: caller.name || null, role: normRole(String(role || "editor")), expires_at }),
      });
      if (!inv.ok) return json({ ok: false, error: "No se pudo crear la invitación." }, 500);
      return json({ ok: true, code, expires_at });
    }

    // register: crea cuenta, emite token, devuelve rol. CERRADO: salvo el primer
    // usuario del workspace, exige una invitación válida (registro privado).
    if (action === "register") {
      if (nm.length < 2) return json({ ok: false, error: "El nombre debe tener al menos 2 caracteres." });
      if (String(password || "").length < 4) return json({ ok: false, error: "La contraseña debe tener al menos 4 caracteres." });
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
      const ins = await rest(`connect_users`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name: nm, name_lower: nameLower, color: color || "#4a9eff", pass_hash, salt, role: newRole }),
      });
      if (!ins.ok) {
        const t = await ins.text();
        if (ins.status === 409 || t.includes("duplicate")) return json({ ok: false, error: "Ya existe un usuario con ese nombre." });
        return json({ ok: false, error: "No se pudo crear el usuario." }, 500);
      }
      if (!firstUser && inviteCode) {
        await rest(`connect_invites?code=eq.${encodeURIComponent(inviteCode)}`, {
          method: "PATCH", body: JSON.stringify({ used_by: nm, used_at: new Date().toISOString() }),
        });
      }
      const row = (await ins.json())[0];
      const tok = await issueToken(row.id);
      return json({ ok: true, user: { name: row.name, color: row.color, role: row.role, avatar: null, token: tok } });
    }

    // login: verifica, emite token, devuelve rol.
    if (action === "login") {
      const res = await rest(`connect_users?select=id,name,color,role,avatar,pass_hash,salt&name_lower=eq.${encodeURIComponent(nameLower)}`);
      const rows = await res.json();
      const u = Array.isArray(rows) ? rows[0] : null;
      if (!u) return json({ ok: false, error: "Usuario no encontrado." });
      const h = await sha256(`${u.salt}::${password}`);
      if (h !== u.pass_hash) return json({ ok: false, error: "Contraseña incorrecta." });
      const tok = await issueToken(u.id);
      return json({ ok: true, user: { name: u.name, color: u.color, role: u.role, avatar: u.avatar || null, token: tok } });
    }

    // me: valida un token y devuelve el usuario+rol (fuente de verdad del rol).
    if (action === "me") {
      const u = await userByToken(String(token || ""));
      if (!u) return json({ ok: false, error: "Sesión no válida." }, 401);
      return json({ ok: true, user: { name: u.name, color: u.color, role: u.role, avatar: u.avatar || null } });
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

    // deleteUser: SOLO admin. Elimina la cuenta de un trabajador. Protege al
    // último admin y a ti mismo (no te borras y te quedas sin acceso).
    if (action === "deleteUser") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (caller.role !== "admin") return json({ ok: false, error: "Solo un ADMIN puede eliminar trabajadores." }, 403);
      const tgt = String(targetName || "").trim().toLowerCase();
      if (!tgt) return json({ ok: false, error: "Falta el usuario objetivo." }, 400);
      if (tgt === String(caller.name_lower || caller.name || "").toLowerCase()) {
        return json({ ok: false, error: "No puedes eliminar tu propia cuenta." }, 400);
      }
      // Carga el objetivo para comprobar si es admin (y proteger al último).
      const tr = await (await rest(`connect_users?select=id,role&name_lower=eq.${encodeURIComponent(tgt)}`)).json();
      const target = Array.isArray(tr) ? tr[0] : null;
      if (!target) return json({ ok: false, error: "Usuario objetivo no encontrado." }, 404);
      if (target.role === "admin") {
        const admins = await (await rest(`connect_users?select=id&role=eq.admin`)).json();
        if (Array.isArray(admins) && admins.length <= 1) {
          return json({ ok: false, error: "No puedes eliminar al último ADMIN." }, 400);
        }
      }
      const del = await rest(`connect_users?id=eq.${encodeURIComponent(target.id)}`, {
        method: "DELETE", headers: { Prefer: "return=minimal" },
      });
      if (!del.ok) return json({ ok: false, error: "No se pudo eliminar al trabajador." }, 500);
      return json({ ok: true });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
