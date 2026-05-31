// =============================================================================
// chat — Mensajería interna del equipo (Supabase).
//
// Tres superficies sobre una misma tabla (connect_messages):
//   - 'general' → chat general de empresa: todos leen y escriben.
//   - 'mejoras' → apuntes / comentarios de mejora interna (board de notas).
//   - 'dm:<a>|<b>' → privado 1:1 entre dos trabajadores (name_lower ordenados).
//
// Supervisión: el ADMIN puede LEER cualquier canal, incluidos los privados
// (lo pidió Pablo). El resto solo ve los suyos: general, mejoras y sus DMs.
//
// Seguridad: service_role SOLO en el servidor; la tabla tiene RLS sin políticas,
// así que el único camino es esta función. La sesión se resuelve por token (el
// mismo opaco que emite `users`), no por la publishable key.
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

const norm = (s: unknown) => String(s || "").trim().toLowerCase();
const FIXED = new Set(["general", "mejoras"]);

// Canal de DM determinista a partir de dos name_lower (ordenados).
function dmChannel(a: string, b: string): string {
  return "dm:" + [norm(a), norm(b)].sort().join("|");
}
// Participantes (name_lower) de un canal de DM, o [] si no lo es.
function dmParts(channel: string): string[] {
  if (!channel.startsWith("dm:")) return [];
  return channel.slice(3).split("|").filter(Boolean);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, token, channel, to, body, kind, since, limit } = await req.json().catch(() => ({}));
    const me = await userByToken(String(token || ""));
    if (!me) return json({ ok: false, error: "Sesión no válida." }, 401);
    const isAdmin = me.role === "admin";

    // Resuelve el canal pedido (general | mejoras | dm con `to`) y comprueba el
    // permiso de LECTURA/ESCRITURA del que llama.
    async function resolveChannel(): Promise<{ ch: string; err?: string; status?: number }> {
      // DM por destinatario: el servidor calcula el canal (no se inyecta crudo).
      if (to) {
        const tgt = await rest(`connect_users?select=name_lower&name_lower=eq.${encodeURIComponent(norm(to))}`);
        const trows = await tgt.json();
        if (!Array.isArray(trows) || !trows[0]) return { ch: "", err: "Destinatario no encontrado.", status: 404 };
        return { ch: dmChannel(me.name_lower, norm(to)) };
      }
      const ch = String(channel || "").trim();
      if (FIXED.has(ch)) return { ch };
      const parts = dmParts(ch);
      if (parts.length === 2) {
        // Canal de DM explícito: solo un participante o el admin (supervisión).
        if (!isAdmin && !parts.includes(me.name_lower)) return { ch: "", err: "No puedes acceder a esta conversación.", status: 403 };
        return { ch };
      }
      return { ch: "", err: "Canal no válido.", status: 400 };
    }

    // send: publica un mensaje. En 'mejoras' el tipo por defecto es 'note'.
    if (action === "send") {
      const text = String(body || "").trim().slice(0, 4000);
      if (!text) return json({ ok: false, error: "Mensaje vacío." }, 400);
      const r = await resolveChannel();
      if (r.err) return json({ ok: false, error: r.err }, r.status || 400);
      // En DM no te escribes a ti mismo.
      const parts = dmParts(r.ch);
      if (parts.length === 2 && parts[0] === parts[1]) return json({ ok: false, error: "No puedes enviarte un privado a ti mismo." }, 400);
      const k = r.ch === "mejoras" ? (kind === "chat" ? "chat" : "note") : "chat";
      const ins = await rest(`connect_messages`, {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ channel: r.ch, kind: k, from_name: me.name, from_lower: me.name_lower, body: text }),
      });
      if (!ins.ok) return json({ ok: false, error: "No se pudo enviar." }, 500);
      const row = (await ins.json())[0];
      return json({ ok: true, message: row });
    }

    // list: mensajes de un canal (asc). DM ajeno → solo admin. `since` (ISO)
    // permite el sondeo incremental sin recargar todo el hilo.
    if (action === "list") {
      const r = await resolveChannel();
      if (r.err) return json({ ok: false, error: r.err }, r.status || 400);
      const lim = Math.min(Math.max(Number(limit) || 200, 1), 500);
      let q = `connect_messages?select=id,channel,kind,from_name,from_lower,body,created_at&channel=eq.${encodeURIComponent(r.ch)}&order=created_at.asc&limit=${lim}`;
      if (since) q += `&created_at=gt.${encodeURIComponent(String(since))}`;
      const res = await rest(q);
      const rows = await res.json();
      return json({ ok: true, channel: r.ch, messages: Array.isArray(rows) ? rows : [] });
    }

    // threads: mis hilos de DM (último mensaje por interlocutor). El equipo es
    // pequeño: traemos los DMs recientes y reducimos en memoria.
    if (action === "threads") {
      const res = await rest(`connect_messages?select=channel,from_name,from_lower,body,created_at&channel=like.dm:*&order=created_at.desc&limit=500`);
      const rows = await res.json();
      const seen = new Map<string, any>();
      for (const m of (Array.isArray(rows) ? rows : [])) {
        const parts = dmParts(m.channel);
        if (!parts.includes(me.name_lower)) continue;
        const other = parts.find((p) => p !== me.name_lower) || me.name_lower;
        if (!seen.has(other)) seen.set(other, { with: other, channel: m.channel, last: m.body, at: m.created_at });
      }
      return json({ ok: true, threads: [...seen.values()] });
    }

    // adminThreads: SOLO admin. Todos los hilos de DM del equipo (supervisión).
    if (action === "adminThreads") {
      if (!isAdmin) return json({ ok: false, error: "Solo un ADMIN supervisa las conversaciones." }, 403);
      const res = await rest(`connect_messages?select=channel,from_name,body,created_at&channel=like.dm:*&order=created_at.desc&limit=1000`);
      const rows = await res.json();
      const seen = new Map<string, any>();
      for (const m of (Array.isArray(rows) ? rows : [])) {
        if (!seen.has(m.channel)) {
          const parts = dmParts(m.channel);
          seen.set(m.channel, { channel: m.channel, between: parts, last: m.body, at: m.created_at });
        }
      }
      return json({ ok: true, threads: [...seen.values()] });
    }

    // stats: nº de mensajes por autor (alimenta el panel de productividad).
    if (action === "stats") {
      const res = await rest(`connect_messages?select=from_lower,from_name,created_at&order=created_at.desc&limit=5000`);
      const rows = await res.json();
      const by: Record<string, { name: string; count: number; last: string }> = {};
      for (const m of (Array.isArray(rows) ? rows : [])) {
        const k = m.from_lower;
        if (!by[k]) by[k] = { name: m.from_name, count: 0, last: m.created_at };
        by[k].count++;
      }
      return json({ ok: true, stats: by });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
