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
// Concurrencia (control optimista por `rev`):
//   - load → { ok, data, rev }
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, workspace, data, rev, by } = await req.json().catch(() => ({}));
    const ws = String(workspace || "default").slice(0, 64);

    if (action === "load") {
      const res = await rest(`connect_state?select=data,rev&workspace=eq.${encodeURIComponent(ws)}`);
      const rows = await res.json();
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row) return json({ ok: true, data: null, rev: 0 });
      return json({ ok: true, data: row.data, rev: row.rev });
    }

    if (action === "save") {
      if (data == null || typeof data !== "object") return json({ ok: false, error: "data inválida" }, 400);
      const baseRev = Number(rev) || 0;
      const cur = await rest(`connect_state?select=data,rev&workspace=eq.${encodeURIComponent(ws)}`);
      const curRows = await cur.json();
      const curRow = Array.isArray(curRows) ? curRows[0] : null;
      const curRev = curRow ? Number(curRow.rev) || 0 : 0;
      // Conflicto: el servidor avanzó desde tu última lectura.
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
          updated_by: by || null,
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
