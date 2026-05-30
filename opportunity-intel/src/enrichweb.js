// =============================================================================
// enrichweb.js — Cliente de la Edge Function `enrich-web`.
//
// Lee la web de un lead de forma HONESTA (año de copyright, viewport móvil,
// tecnología) y responde "¿desde cuándo no mejoran su web?". El servidor cachea
// 14 días, así que abrir la ficha varias veces no re-lee. Si no se puede leer,
// devuelve readable:false con una nota honesta — nunca inventa.
// =============================================================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/enrich-web";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

/** @returns {Promise<{ok,readable,copyright_year?,has_viewport?,generator?,title?,note?,cached?,error?}>} */
export async function fetchWebFreshness(website, token, force = false) {
  if (!website) return { ok: false, readable: false, error: "Este lead no tiene web registrada." };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ website, token, force }),
    });
    return await res.json();
  } catch {
    return { ok: false, readable: false, error: "Sin conexión para leer su web." };
  }
}
