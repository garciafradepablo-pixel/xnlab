// =============================================================================
// presence — Presencia del equipo (Supabase).
//
// Una fila por persona en `connect_presence` (name_lower único): su último
// estado declarado, en qué anda y cuándo latió por última vez. Dos acciones:
//   - 'beat'   → upsert de mi presencia (estado + actividad + updated_at=now).
//   - 'roster' → todas las filas; el cliente calcula la frescura (quién sigue ahí).
//
// No guarda historial ni mensajes: es un estado vivo, no un log. La frescura la
// decide el cliente con updated_at (una pestaña cerrada deja de latir y cae sola).
//
// Seguridad: igual que `chat`. service_role SOLO en el servidor; la tabla tiene
// RLS sin políticas, así que el único camino es esta función. La sesión se
// resuelve por token (el mismo opaco que emite `users`), nunca por la apikey.
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

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días (igual que `users`/`chat`)
const STATUSES = new Set(["online", "away", "busy", "meeting", "offline"]);

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, token, status, activity } = await req.json().catch(() => ({}));
    const me = await userByToken(String(token || ""));
    if (!me) return json({ ok: false, error: "Sesión no válida." }, 401);

    // beat: upsert de mi presencia. El estado se valida; la actividad se recorta.
    if (action === "beat") {
      const st = STATUSES.has(String(status)) ? String(status) : "online";
      const act = String(activity || "").trim().slice(0, 120);
      const row = {
        name_lower: me.name_lower,
        name: me.name,
        status: st,
        activity: act,
        updated_at: new Date().toISOString(),
      };
      // Upsert por clave única name_lower (merge-duplicates resuelve el conflicto).
      const r = await rest(`connect_presence?on_conflict=name_lower`, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(row),
      });
      if (!r.ok) return json({ ok: false, error: "No se pudo actualizar la presencia." }, 500);
      return json({ ok: true });
    }

    // roster: todas las filas. El cliente decide quién sigue ahí por updated_at.
    if (action === "roster") {
      const res = await rest(`connect_presence?select=name,name_lower,status,activity,updated_at&order=updated_at.desc&limit=200`);
      const rows = await res.json();
      return json({ ok: true, roster: Array.isArray(rows) ? rows : [] });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
