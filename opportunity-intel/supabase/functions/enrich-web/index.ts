// =============================================================================
// enrich-web — Lectura HONESTA de la web de un lead (frescura / antigüedad).
//
// Responde "¿desde cuándo no mejoran su web?" con señales citables, NUNCA
// inventadas: año de copyright del pie, si tiene viewport móvil (responsive),
// qué tecnología declara (generator), y el título. De ahí deriva una palanca de
// venta ("web sin tocar desde 2019 → rediseño"). Si no se puede leer, lo dice
// (gris), no se inventa nada.
//
// Caché de 14 días en `web_enrichment` (no re-lee la misma web; persiste el dato
// y lo hace automático). Auth por token de sesión (cualquier rol puede leer).
// verify_jwt=false: autenticación propia por token.
// =============================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;
const MAX_HTML = 500_000;

function sbAdmin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
async function validSession(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const { data } = await sbAdmin().from("connect_users").select("token_at").eq("token", token).maybeSingle();
    if (!data) return false;
    if (data.token_at && Date.now() - new Date(data.token_at).getTime() > TOKEN_TTL_MS) return false;
    return true;
  } catch { return false; }
}

// Normaliza a origen https (esquema + host), sin ruta: leemos la home.
function normalize(raw: string): string | null {
  let s = String(raw || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try { const u = new URL(s); return `${u.protocol}//${u.host.toLowerCase()}/`; } catch { return null; }
}

function extract(html: string) {
  const h = html.slice(0, MAX_HTML);
  const year = new Date().getFullYear();
  // Años junto a © / copyright (coge el más reciente y razonable).
  const years: number[] = [];
  for (const m of h.matchAll(/(?:©|&copy;|&#169;|copyright)[^0-9]{0,14}((?:19|20)\d{2})(?:\s*[–\-—]\s*((?:19|20)\d{2}))?/gi)) {
    const a = +m[1]; const b = m[2] ? +m[2] : 0;
    if (a >= 1995 && a <= year) years.push(a);
    if (b >= 1995 && b <= year) years.push(b);
  }
  const copyright_year = years.length ? Math.max(...years) : null;
  const has_viewport = /<meta[^>]+name=["']?viewport["']?/i.test(h);
  const gen = h.match(/<meta[^>]+name=["']?generator["']?[^>]*content=["']([^"']+)["']/i);
  const generator = gen ? gen[1].slice(0, 80) : null;
  const tt = h.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = tt ? tt[1].trim().slice(0, 140) : null;
  // Señales honestas adicionales (frases específicas; no inventamos).
  const opening = /(pr[oó]xima\s+apertura|nueva\s+apertura|gran\s+apertura|coming\s+soon|pr[oó]ximamente|nuevo\s+local|nueva\s+sede)/i.test(h);
  const hiring = /(únete\s+al\s+equipo|trabaja\s+con\s+nosotros|estamos\s+contratando|ofertas?\s+de\s+empleo|we'?re\s+hiring|join\s+our\s+team)/i.test(h);
  const booking = /(reservar|reserva\s+(?:tu\s+)?mesa|pide\s+cita|book\s+(?:a\s+table|now)|agendar?\s+cita)/i.test(h);
  return { copyright_year, has_viewport, generator, title, signals: { opening, hiring, booking } };
}

// Extracción RICA adicional (Tanda 5): meta description, encabezados, texto
// visible acotado y enlaces internos básicos. Se devuelve en la respuesta (NO se
// cachea: cero migración de esquema) para que el extractor LOCAL honesto derive
// señales citadas. Fragmentos cortos, sin copiar páginas enteras, sin crawling.
function extractRich(html: string, baseUrl: string) {
  const h = html.slice(0, MAX_HTML);
  const md = h.match(/<meta[^>]+name=["']?description["']?[^>]*content=["']([^"']+)["']/i)
    || h.match(/<meta[^>]+property=["']og:description["']?[^>]*content=["']([^"']+)["']/i);
  const meta_description = md ? md[1].trim().slice(0, 300) : null;
  const headings: string[] = [];
  for (const m of h.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)) {
    const t = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (t && t.length <= 120) headings.push(t);
    if (headings.length >= 12) break;
  }
  const visible_text = h
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2500);
  const links: string[] = [];
  const host = (() => { try { return new URL(baseUrl).host.toLowerCase(); } catch { return ""; } })();
  for (const m of h.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)) {
    const href = m[1].trim();
    if (!href) continue;
    try {
      const u = new URL(href, baseUrl);
      if (u.host.toLowerCase() !== host) continue; // solo enlaces internos
      const path = u.pathname.toLowerCase();
      if (path && path !== "/" && !links.includes(path)) links.push(path);
    } catch { /* href raro: ignora */ }
    if (links.length >= 40) break;
  }
  return { meta_description, headings, visible_text, links };
}

function verdict(sig: { copyright_year: number | null; has_viewport: boolean }): string {
  const year = new Date().getFullYear();
  const parts: string[] = [];
  if (sig.copyright_year) {
    const age = year - sig.copyright_year;
    if (age >= 3) parts.push(`Sin señal de actualización desde ${sig.copyright_year} (${age} años) — palanca clara de rediseño.`);
    else parts.push(`Pie actualizado a ${sig.copyright_year}: web relativamente reciente.`);
  } else {
    parts.push("Sin año de copyright legible (no concluyente).");
  }
  if (!sig.has_viewport) parts.push("Sin viewport móvil: probablemente no responsive — dolor de marca en el móvil.");
  return parts.join(" ");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);

  let body: { website?: string; token?: string; force?: boolean };
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }

  if (!(await validSession((body.token || "").trim()))) return json({ ok: false, error: "Sesión no válida." }, 401);

  const url = normalize(body.website || "");
  if (!url) return json({ ok: false, error: "Web no válida.", readable: false });

  const db = sbAdmin();
  // Caché: no re-leemos la misma web dentro de la ventana.
  if (!body.force) {
    try {
      const { data } = await db.from("web_enrichment").select("*").eq("url", url).maybeSingle();
      if (data && Date.now() - new Date(data.fetched_at).getTime() < CACHE_TTL_MS) {
        return json({ ok: true, cached: true, ...row(data) });
      }
    } catch { /* sigue y re-lee */ }
  }

  // Lectura con timeout y tope de tamaño.
  let html = "", status = 0;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; XNLabConnect/1.0; +https://xnlab)" },
    });
    clearTimeout(t);
    status = res.status;
    if (res.ok) html = (await res.text()).slice(0, MAX_HTML);
  } catch {
    return json({ ok: true, readable: false, http_status: 0, note: "No pudimos leer su web (bloqueada, lenta o caída). Compruébalo a mano." });
  }
  if (!html) {
    return json({ ok: true, readable: false, http_status: status, note: `Su web respondió ${status} sin contenido legible.` });
  }

  const sig = extract(html);
  const note = verdict(sig);
  const record = {
    url, fetched_at: new Date().toISOString(), http_status: status,
    copyright_year: sig.copyright_year, has_viewport: sig.has_viewport,
    generator: sig.generator, title: sig.title, note, signals: sig.signals,
  };
  try { await db.from("web_enrichment").upsert(record); } catch { /* best-effort */ }
  // Campos ricos (Tanda 5): solo en la respuesta, no en la caché (cero migración).
  const rich = extractRich(html, url);
  return json({ ok: true, readable: true, ...row(record), final_url: url, ...rich });
});

function row(d: any) {
  return {
    url: d.url, fetched_at: d.fetched_at, http_status: d.http_status,
    copyright_year: d.copyright_year, has_viewport: d.has_viewport,
    generator: d.generator, title: d.title, note: d.note,
    signals: d.signals || {}, readable: true,
  };
}
