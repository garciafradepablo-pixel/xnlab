// =============================================================================
// activity — Feed de actividad del equipo (Supabase).
//
// Traza append-only en `connect_activity`: cada acción que muta algo emite un
// evento (tarea hecha, archivo subido, lead nuevo…). Dos acciones:
//   - 'emit' → inserta un evento. El AUTOR sale del token, no del payload (no se
//              puede firmar en nombre de otro). El verbo se valida.
//   - 'feed' → últimos eventos (desc). El cliente agrupa por día.
//
// Es memoria, no estado: no se edita ni se borra desde el cliente. Por eso vive
// en su tabla y nunca en el doc compartido (crecería sin techo).
//
// Seguridad: igual que `chat`/`presence`. service_role SOLO en el servidor; RLS
// sin políticas; sesión por token opaco.
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

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días (igual que el resto)
// Verbos catalogados (espejo de src/activity.js VERBS). Lo desconocido se rechaza.
const VERBS = new Set(["task_new", "task_done", "file_up", "file_rm", "lead_new", "client_update", "ai_run", "note"]);

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
    const { action, token, verb, object, meta, limit } = await req.json().catch(() => ({}));
    const me = await userByToken(String(token || ""));
    if (!me) return json({ ok: false, error: "Sesión no válida." }, 401);

    // emit: registra un evento. El autor es quien llama (token), nunca el payload.
    if (action === "emit") {
      if (!VERBS.has(String(verb))) return json({ ok: false, error: "Verbo no válido." }, 400);
      const row = {
        actor: me.name,
        actor_lower: me.name_lower,
        verb: String(verb),
        object: object != null ? String(object).slice(0, 160) : null,
        meta: meta && typeof meta === "object" ? meta : null,
        created_at: new Date().toISOString(),
      };
      const ins = await rest(`connect_activity`, {
        method: "POST", headers: { Prefer: "return=minimal" },
        body: JSON.stringify(row),
      });
      if (!ins.ok) return json({ ok: false, error: "No se pudo registrar." }, 500);
      return json({ ok: true });
    }

    // feed: últimos eventos (desc). El cliente agrupa por día y describe.
    if (action === "feed") {
      const lim = Math.min(Math.max(Number(limit) || 200, 1), 500);
      const res = await rest(`connect_activity?select=actor,verb,object,meta,created_at&order=created_at.desc&limit=${lim}`);
      const rows = await res.json();
      return json({ ok: true, feed: Array.isArray(rows) ? rows : [] });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
