// =============================================================================
// connect-state — Documento de estado operativo compartido (Supabase).
//
// La mesa de trabajo común de Pablo y Javi: CRM, notas, verificaciones,
// follow-ups y leads añadidos viven aquí de forma durable, no solo en el
// localStorage de cada navegador.
//
// Seguridad: usa la service_role key SOLO en el servidor. La tabla tiene RLS
// activado sin políticas, así que la clave publishable/anon NO puede acceder
// directamente por REST; el único camino es esta función.
//
// RBAC (refuerzo real, no solo ocultar botones en el cliente):
//   - load: exige una sesión válida (token). Cualquier rol puede LEER.
//   - save: exige que el ROL detrás del token pueda escribir (admin/editor).
//           viewer/analyst → 403, aunque manipulen el cliente.
//   - createShare: un rol con escritura genera un enlace de PRUEBA solo-lectura.
//   - loadShare: SIN sesión; valida el enlace y devuelve el estado en lectura.
//
// Concurrencia (control optimista por `rev`):
//   - save → si tu `rev` == rev del servidor: escribe y devuelve { ok, rev+1 }.
//            si no: { ok:false, conflict:true, data, rev } para re-fusionar.
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

const CAN_WRITE = new Set(["admin", "editor", "vendedor"]);
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

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
  const res = await rest(`connect_users?select=name,role,token_at&token=eq.${encodeURIComponent(token)}`);
  const rows = await res.json();
  const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!u || (u.token_at && Date.now() - new Date(u.token_at).getTime() > TOKEN_TTL_MS)) return null;
  return u;
}

function randHex(n: number): string {
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, workspace, data, rev, token, scope, company, companyName, share } = await req.json().catch(() => ({}));
    const ws = String(workspace || "default").slice(0, 64);

    if (action === "createShare") {
      const user = await userByToken(String(token || ""));
      if (!user) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (!CAN_WRITE.has(user.role)) {
        return json({ ok: false, error: "Tu rol no permite compartir vistas de prueba." }, 403);
      }
      const sc = scope === "company" ? "company" : "workspace";
      const tok = randHex(16);
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const ins = await rest(`connect_shares`, {
        method: "POST", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          token: tok, scope: sc, workspace: ws,
          company: sc === "company" ? String(company || "").slice(0, 120) || null : null,
          company_name: sc === "company" ? String(companyName || "").slice(0, 160) || null : null,
          created_by: user.name || null, expires_at,
        }),
      });
      if (!ins.ok) {
        const detail = await ins.text();
        return json({ ok: false, error: "No se pudo crear el enlace.", detail }, 500);
      }
      return json({ ok: true, token: tok, scope: sc, expires_at });
    }

    if (action === "loadShare") {
      const sh = String(share || "").trim();
      if (!sh) return json({ ok: false, error: "Falta el enlace." }, 400);
      const sr = await rest(`connect_shares?select=scope,company,company_name,workspace,expires_at&token=eq.${encodeURIComponent(sh)}`);
      const srows = await sr.json();
      const srow = Array.isArray(srows) ? srows[0] : null;
      if (!srow) return json({ ok: false, error: "Enlace no válido." }, 404);
      if (srow.expires_at && new Date(srow.expires_at) < new Date()) return json({ ok: false, error: "El enlace ha caducado." }, 410);
      const sws = String(srow.workspace || "default").slice(0, 64);
      const res = await rest(`connect_state?select=data,rev&workspace=eq.${encodeURIComponent(sws)}`);
      const rows = await res.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      return json({
        ok: true, readOnly: true,
        scope: srow.scope || "workspace",
        company: srow.company || null,
        companyName: srow.company_name || null,
        data: row ? row.data : null,
        rev: row ? row.rev : 0,
      });
    }

    if (action === "load") {
      const user = await userByToken(String(token || ""));
      if (!user) return json({ ok: false, error: "Sesión no válida." }, 401);
      const res = await rest(`connect_state?select=data,rev&workspace=eq.${encodeURIComponent(ws)}`);
      const rows = await res.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row) return json({ ok: true, data: null, rev: 0 });
      return json({ ok: true, data: row.data, rev: row.rev });
    }

    if (action === "save") {
      const user = await userByToken(String(token || ""));
      if (!user) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (!CAN_WRITE.has(user.role)) {
        return json({ ok: false, error: "Tu rol no permite modificar la mesa de trabajo." }, 403);
      }
      if (data == null || typeof data !== "object") return json({ ok: false, error: "data inválida" }, 400);
      const baseRev = Number(rev) || 0;
      const cur = await rest(`connect_state?select=data,rev&workspace=eq.${encodeURIComponent(ws)}`);
      const curRows = await cur.json();
      const curRow = Array.isArray(curRows) ? curRows[0] : null;
      const curRev = curRow ? Number(curRow.rev) || 0 : 0;
      if (curRow && curRev !== baseRev) {
        return json({ ok: false, conflict: true, data: curRow.data, rev: curRev });
      }
      const newRev = curRev + 1;
      const up = await rest(`connect_state?on_conflict=workspace`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          workspace: ws,
          data,
          rev: newRev,
          updated_by: user.name || null,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!up.ok) {
        const detail = await up.text();
        return json({ ok: false, error: "No se pudo guardar.", detail }, 500);
      }
      return json({ ok: true, rev: newRev });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
