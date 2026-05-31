// =============================================================================
// eco — EC · Eco. El walkie-talkie que resume y escupe.
//
// Una persona deja una nota de voz (ya transcrita en el navegador); esta función
// la DESTILA a lo mínimo accionable (resumen + palabras clave) y la ENTREGA a la
// otra persona del equipo. Aislada de la mesa de trabajo compartida (connect-state):
// vive en su propia tabla `connect_ecos`, no toca el documento de estado.
//
// Cerebro: Gemini (tier gratuito) si hay GEMINI_API_KEY en los secrets. Si no la
// hay (o falla), cae a un resumen de respaldo (recorte) para que la función NUNCA
// deje de entregar — la calidad sube en cuanto pongas la clave.
//
// Seguridad: igual patrón que el resto. service_role SOLO en el servidor; la tabla
// tiene RLS sin políticas (nadie entra por REST salvo esta función). El token de
// sesión resuelve usuario+rol. Enviar exige rol con escritura (admin/editor);
// leer la bandeja exige sesión válida.
// =============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const CAN_WRITE = new Set(["admin", "editor"]);
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días, igual que users/connect-state
const tokenExpired = (tokenAt: string | null) =>
  !!tokenAt && Date.now() - new Date(tokenAt).getTime() > TOKEN_TTL_MS;

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

// Identidad de equipo en la app = APODO (aka). Los ecos se dirigen y firman por
// aka (privacidad: nadie ve el nombre real de otro). Si una cuenta vieja no
// tuviera aka, caemos al nombre de pila.
const firstName = (n: string) => {
  const w = String(n || "").trim().split(/\s+/)[0] || "";
  return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : "";
};
async function userByToken(token: string) {
  if (!token) return null;
  const res = await rest(`connect_users?select=id,name,name_lower,aka,role,token_at&token=eq.${encodeURIComponent(token)}`);
  const rows = await res.json();
  const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!u || tokenExpired(u.token_at)) return null;
  u.aka = u.aka || firstName(u.name);
  return u;
}

// —— El cerebro: destila la nota a lo mínimo accionable ————————————————————————
function fallback(text: string) {
  const s = text.trim().replace(/\s+/g, " ");
  return { resumen: s.length > 280 ? s.slice(0, 277) + "…" : s, keywords: [] as string[], ai: false };
}

async function distill(text: string) {
  if (!GEMINI_API_KEY) return fallback(text);
  const prompt =
    "Eres EC · Eco, el delfín de XNLAB: el colchón entre dos personas que trabajan " +
    "en remoto. Recibes una nota de voz transcrita y la destilas a lo MÍNIMO " +
    "accionable para la otra persona del equipo.\n\n" +
    'Devuelve un JSON {"resumen": string, "palabras_clave": string[]}.\n' +
    'El "resumen" son hasta 3 líneas (cada una en su propia línea), SOLO las que ' +
    "apliquen:\n" +
    "Cambia: (decisión o novedad que el otro aún no sabe)\n" +
    "Necesito: (la acción concreta que pides, en imperativo, idealmente una)\n" +
    "No perder: (contexto crítico, solo si lo hay)\n\n" +
    "Reglas estrictas: máximo de eficiencia, mínimo de palabras; quita tono, ego, " +
    "prisa, divagación y relleno. NO inventes nada que no esté en la nota; si algo " +
    "es ambiguo, escríbelo como '⚠ a confirmar: …'. Omite las líneas que no " +
    'apliquen. Español natural. "palabras_clave": 3-6 términos.\n\nNota:\n' + text;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      },
    );
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(txt);
    const resumen = String(parsed.resumen || "").trim();
    const keywords = Array.isArray(parsed.palabras_clave)
      ? parsed.palabras_clave.map((k: unknown) => String(k).trim()).filter(Boolean).slice(0, 8)
      : [];
    if (!resumen) return fallback(text);
    return { resumen, keywords, ai: true };
  } catch {
    return fallback(text); // red caída / cuota / respuesta rara → nunca dejamos de entregar
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, token, to, transcript, id, verdict } = await req.json().catch(() => ({}));

    // send: destila y entrega a la otra persona. Exige rol con escritura.
    if (action === "send") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      if (!CAN_WRITE.has(caller.role)) return json({ ok: false, error: "Tu rol no puede enviar ecos." }, 403);
      const text = String(transcript || "").trim();
      if (!text) return json({ ok: false, error: "La nota está vacía." }, 400);
      const dest = String(to || "").trim();
      if (!dest) return json({ ok: false, error: "Falta el destinatario." }, 400);

      const d = await distill(text);
      const ins = await rest(`connect_ecos`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          from_name: caller.aka,
          to_name: dest,
          to_name_lower: dest.toLowerCase(),
          resumen: d.resumen,
          keywords: d.keywords,
          raw: text,
          ai: d.ai,
        }),
      });
      if (!ins.ok) return json({ ok: false, error: "No se pudo entregar el eco." }, 500);
      const row = (await ins.json())[0];
      return json({ ok: true, eco: row, ai: d.ai });
    }

    // inbox: los ecos dirigidos a mí, recientes primero.
    if (action === "inbox") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      const res = await rest(
        `connect_ecos?select=*&to_name_lower=eq.${encodeURIComponent(caller.aka.toLowerCase())}&order=created_at.desc&limit=50`,
      );
      const ecos = await res.json();
      return json({ ok: true, ecos: Array.isArray(ecos) ? ecos : [] });
    }

    // read: marca un eco mío como leído (solo los míos).
    if (action === "read") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      await rest(
        `connect_ecos?id=eq.${encodeURIComponent(String(id || ""))}&to_name_lower=eq.${encodeURIComponent(caller.aka.toLowerCase())}`,
        { method: "PATCH", body: JSON.stringify({ read_at: new Date().toISOString() }) },
      );
      return json({ ok: true });
    }

    // verdict: el receptor marca su eco como 'clear' (lo entendió sin repreguntar)
    // o 'ask' (tengo que preguntar). Es LA señal con la que medimos la eficiencia.
    if (action === "verdict") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      const v = verdict === "clear" || verdict === "ask" ? verdict : null;
      if (!v) return json({ ok: false, error: "Verdict no válido." }, 400);
      const now = new Date().toISOString();
      await rest(
        `connect_ecos?id=eq.${encodeURIComponent(String(id || ""))}&to_name_lower=eq.${encodeURIComponent(caller.aka.toLowerCase())}`,
        { method: "PATCH", body: JSON.stringify({ verdict: v, verdict_at: now, read_at: now }) },
      );
      return json({ ok: true });
    }

    // sent: mis ecos enviados con su verdict — para medir si llegan claros.
    if (action === "sent") {
      const caller = await userByToken(String(token || ""));
      if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
      const res = await rest(
        `connect_ecos?select=id,to_name,verdict,created_at&from_name=eq.${encodeURIComponent(caller.aka)}&order=created_at.desc&limit=100`,
      );
      const ecos = await res.json();
      return json({ ok: true, ecos: Array.isArray(ecos) ? ecos : [] });
    }

    return json({ ok: false, error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
