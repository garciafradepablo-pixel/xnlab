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
//
// Concurrencia (control optimista por `rev`):
//   - save → si tu `rev` == rev del servidor: escribe y devuelve { ok, rev+1 }.
//            si no: { ok:false, conflict:true, data, rev } para que el cliente
//            re-fusione (newest-per-entity) y reintente. Nunca pisa a ciegas.
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

// Capacidad de escritura por rol (copia de roles.js; el servidor manda).
const CAN_WRITE = new Set(["admin", "editor"]);

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
  const res = await rest(`connect_users?select=name,role&token=eq.${encodeURIComponent(token)}`);
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, workspace, data, rev, token } = await req.json().catch(() => ({}));
    const ws = String(workspace || "default").slice(0, 64);

    // load: cualquier sesión válida puede LEER (viewer incluido).
    if (action === "load") {
      const user = await userByToken(String(token || ""));
      if (!user) return json({ ok: false, error: "Sesión no válida." }, 401);
      const res = await rest(`connect_state?select=data,rev&workspace=eq.${encodeURIComponent(ws)}`);
      const rows = await res.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row) return json({ ok: true, data: null, rev: 0 });
      return json({ ok: true, data: row.data, rev: row.rev });
    }

    // save: exige sesión válida Y rol con permiso de escritura. Refuerzo REAL:
    // aunque el cliente oculte botones, un viewer/analyst recibe 403 aquí.
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
