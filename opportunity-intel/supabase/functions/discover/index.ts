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

const CAN_DISCOVER = new Set(["admin", "editor"]);

function cityFrom(addr: string): string {
  if (!addr) return "";
  const parts = addr.split(",").map((s) => s.trim());
  for (const p of parts) { const m = p.match(/\b\d{5}\s+(.+)/); if (m) return m[1]; }
  return parts.length >= 2 ? parts[parts.length - 2] : (parts[0] || "");
}

function sbAdmin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}
async function roleByToken(token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { data } = await sbAdmin().from("connect_users").select("role").eq("token", token).maybeSingle();
    return data?.role ?? null;
  } catch { return null; }
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
  const role = await roleByToken((body.token || "").trim());
  if (!role) return json({ error: "Sesión no válida." }, 401);
  if (!CAN_DISCOVER.has(role)) return json({ error: "Tu rol no permite descubrir leads." }, 403);

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
