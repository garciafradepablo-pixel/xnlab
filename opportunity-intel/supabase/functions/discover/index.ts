// discover — Google Places Text Search. API key desde tabla privada app_config.
// Protegido por RBAC: exige un token de sesión con permiso de descubrimiento
// (admin/editor). Un viewer/analyst recibe 403 aunque manipule el cliente.
// La API key de Google vive como secreto en el servidor, nunca en el cliente.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Espejo de la capacidad "discover" en roles.js: admin/editor/sales descubren.
const CAN_DISCOVER = new Set(["admin", "editor", "sales"]);

// Rate-limit por usuario (defensa en profundidad contra abuso de cuota de Google
// Places si un token se filtra o un script se desboca). Generoso para el uso
// real: una tanda del agente son ~5 consultas seguidas, así que NUNCA lo toca.
const WIN_CAP = 30;   // máx. llamadas por ventana de 60 s
const DAY_CAP = 300;  // máx. llamadas por usuario y día
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // caducidad de sesión (30 días)

function cityFrom(addr: string): string {
  if (!addr) return "";
  const parts = addr.split(",").map((s) => s.trim());
  for (const p of parts) { const m = p.match(/\b\d{5}\s+(.+)/); if (m) return m[1]; }
  return parts.length >= 2 ? parts[parts.length - 2] : (parts[0] || "");
}

function sbAdmin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
async function userByToken(token: string): Promise<{ id: string; role: string } | null> {
  if (!token) return null;
  try {
    const { data } = await sbAdmin().from("connect_users").select("id,role,token_at").eq("token", token).maybeSingle();
    if (!data) return null;
    if (data.token_at && Date.now() - new Date(data.token_at).getTime() > TOKEN_TTL_MS) return null; // sesión caducada
    return { id: data.id, role: data.role };
  } catch { return null; }
}

// Cuenta una llamada de descubrimiento y decide si se permite. Ventana móvil de
// 60 s + tope diario, por usuario. Devuelve {ok} o {ok:false, msg} para 429.
async function rateLimit(userId: string): Promise<{ ok: boolean; msg?: string }> {
  const db = sbAdmin();
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  try {
    const { data } = await db.from("discover_usage")
      .select("day,day_count,win_start,win_count").eq("user_id", userId).maybeSingle();
    let dayCount = 0, winCount = 0, winStart = now;
    if (data) {
      dayCount = data.day === today ? data.day_count : 0;
      const ws = data.win_start ? new Date(data.win_start).getTime() : 0;
      if (now - ws < 60_000) { winCount = data.win_count; winStart = ws; } // misma ventana
    }
    if (dayCount >= DAY_CAP) return { ok: false, msg: `Límite diario de descubrimiento alcanzado (${DAY_CAP}). Vuelve mañana.` };
    if (winCount >= WIN_CAP) return { ok: false, msg: "Demasiadas búsquedas seguidas. Espera unos segundos." };
    await db.from("discover_usage").upsert({
      user_id: userId, day: today, day_count: dayCount + 1,
      win_start: new Date(winStart).toISOString(), win_count: winCount + 1,
      updated_at: new Date().toISOString(),
    });
    return { ok: true };
  } catch {
    // Si el contador falla, no bloqueamos el trabajo legítimo (fail-open). El
    // RBAC sigue exigiendo token válido con rol; el riesgo residual es acotado.
    return { ok: true };
  }
}
async function getApiKey(): Promise<string | null> {
  const fromEnv = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (fromEnv) return fromEnv;
  try {
    const { data } = await sbAdmin().from("app_config").select("value").eq("key", "GOOGLE_PLACES_API_KEY").maybeSingle();
    return data?.value ?? null;
  } catch { return null; }
}
async function saveDebug(text: string) {
  try { await sbAdmin().from("app_config").upsert({ key: "LAST_PLACES_DEBUG", value: text.slice(0, 1000), updated_at: new Date().toISOString() }); } catch { /* */ }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);

  let body: { query?: string; sector?: string; max?: number; token?: string };
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }

  // RBAC: exige sesión con permiso de descubrimiento.
  const user = await userByToken((body.token || "").trim());
  if (!user) return json({ error: "Sesión no válida." }, 401);
  if (!CAN_DISCOVER.has(user.role)) return json({ error: "Tu rol no permite descubrir leads." }, 403);

  // Rate-limit por usuario antes de gastar cuota de Google Places.
  const rl = await rateLimit(user.id);
  if (!rl.ok) return json({ error: rl.msg }, 429);

  const query = (body.query || "").trim();
  const sector = body.sector || null;
  const max = Math.min(Math.max(body.max ?? 20, 1), 20);
  if (!query) return json({ error: "Falta 'query'" }, 400);

  const apiKey = await getApiKey();
  if (!apiKey) { await saveDebug("NO_API_KEY"); return json({ candidates: [], note: "API key no configurada." }); }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri",
      },
      body: JSON.stringify({ textQuery: query, languageCode: "es", regionCode: "ES", maxResultCount: max }),
    });
    const raw = await res.text();
    if (!res.ok) {
      await saveDebug(`HTTP ${res.status} :: ${raw}`);
      return json({ candidates: [], error: `Places HTTP ${res.status}` });
    }
    const data = JSON.parse(raw);
    const places = Array.isArray(data.places) ? data.places : [];
    await saveDebug(`OK results=${places.length} query="${query}"`);
    const candidates = places.map((p: any) => ({
      company: p.displayName?.text || "(sin nombre)",
      city: cityFrom(p.formattedAddress || ""),
      subsector: "", website: p.websiteUri || null, phone: p.nationalPhoneNumber || null,
      googleMaps: p.googleMapsUri || null, rating: p.rating ?? null, reviews: p.userRatingCount ?? null,
      sector, source: "places",
    }));
    return json({ candidates });
  } catch (e) {
    await saveDebug(`EXCEPTION ${String((e as Error).message || e)}`);
    return json({ candidates: [], error: String((e as Error).message || e) });
  }
});
