// =============================================================================
// contacts — El rascador. Lee la web de una empresa y extrae sus vías de
// contacto públicas: email, teléfono y redes (Instagram, LinkedIn, Facebook).
//
// HONESTO: no es Apollo. No hay base de datos de decisores; esto rasca lo que la
// propia web publica (mailto:, tel:, enlaces a redes, y patrones de email/tel).
// Best-effort: si la web bloquea, está caída o no publica nada, devuelve vacío
// sin romper. Determinista, sin LLM, sin coste — solo lee HTML.
//
// Seguridad: mismo patrón. service_role solo en el servidor; el token de sesión
// autoriza. Cualquier sesión válida puede usarlo (leer una web pública es inocuo).
// =============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
async function validSession(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/connect_users?select=token_at&token=eq.${encodeURIComponent(token)}`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    );
    const rows = await res.json();
    const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!u) return false;
    return !(u.token_at && Date.now() - new Date(u.token_at).getTime() > TOKEN_TTL_MS);
  } catch {
    return false;
  }
}

const MAX_HTML = 600000;
const UA = "Mozilla/5.0 (compatible; XNLabConnect/1.0; +https://xnlab)";

function normUrl(u: string): string | null {
  const s = String(u || "").trim();
  if (!s) return null;
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try { return new URL(withProto).href; } catch { return null; }
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return "";
    return (await res.text()).slice(0, MAX_HTML);
  } catch {
    return "";
  }
}

// Busca en el HTML el primer enlace a una página de contacto, resuelto absoluto.
function contactLink(html: string, base: string): string | null {
  const re = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) continue;
    if (/contact|contacto|contacta/i.test(href)) {
      try { return new URL(href, base).href; } catch { /* ignora */ }
    }
  }
  return null;
}

const uniq = (arr: string[], n: number) => [...new Set(arr)].slice(0, n);

function extract(html: string) {
  // Emails: mailto: primero, luego patrón general; fuera imágenes y ruido típico.
  const emails: string[] = [];
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) emails.push(m[1]);
  for (const m of html.matchAll(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g)) emails.push(m[0]);
  const cleanEmails = uniq(
    emails
      .map((e) => e.toLowerCase().trim())
      .filter((e) => !/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(e))
      .filter((e) => !/(sentry|wixpress|example\.|\.wix|@sentry|placeholder|email@|tu-email|nombre@)/i.test(e)),
    4,
  );

  // Teléfonos: tel: primero, luego patrón español (móvil/fijo, con o sin +34).
  const phones: string[] = [];
  for (const m of html.matchAll(/tel:([+0-9()\s.\-]{6,})/gi)) phones.push(m[1]);
  for (const m of html.matchAll(/(?:\+34[\s.\-]?)?[6789]\d{2}[\s.\-]?\d{2,3}[\s.\-]?\d{2,3}/g)) phones.push(m[0]);
  const cleanPhones = uniq(
    phones.map((p) => p.replace(/[\s.\-()]/g, "")).filter((p) => p.replace(/\D/g, "").length >= 9),
    3,
  );

  const first = (re: RegExp) => { const m = html.match(re); return m ? m[0] : null; };
  const instagram = first(/https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9_.][A-Za-z0-9_.\/]*/i);
  const linkedin = first(/https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/[A-Za-z0-9_.\-][A-Za-z0-9_.\-\/]*/i);
  const facebook = first(/https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9_.\-][A-Za-z0-9_.\-\/]*/i);

  return {
    email: cleanEmails[0] || null,
    phone: cleanPhones[0] || null,
    instagram: instagram || null,
    linkedin: linkedin || null,
    facebook: facebook || null,
    emails: cleanEmails,
    phones: cleanPhones,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "Usa POST" }, 405);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ ok: false, error: "JSON inválido" }, 400); }
  if (!(await validSession(String(body.token || "").trim()))) return json({ ok: false, error: "Sesión no válida." }, 401);

  const url = normUrl(String(body.url || ""));
  if (!url) return json({ ok: true, readable: false, note: "Web no válida." });

  let html = await fetchHtml(url);
  if (!html) return json({ ok: true, readable: false, note: "No pudimos leer su web (bloqueada, lenta o caída)." });

  // Si hay página de contacto, la sumamos: suele concentrar email y teléfono.
  const cl = contactLink(html, url);
  if (cl && cl !== url) {
    const more = await fetchHtml(cl);
    if (more) html = (html + "\n" + more).slice(0, MAX_HTML * 2);
  }

  return json({ ok: true, readable: true, ...extract(html) });
});
