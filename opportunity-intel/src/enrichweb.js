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

/**
 * Convierte la lectura de la web en un INDICIO citado para el motor: una web
 * obsoleta o no responsive es una palanca de rediseño clara → sube `actionableLever`
 * a AMARILLO (indicio citado, no verde: el pie de copyright no es prueba férrea).
 * Honesto: si la web está al día, NO inventa indicio. @returns {object|null}
 */
export function webLeverFromFreshness(r, year = new Date().getFullYear()) {
  if (!r || !r.readable) return null;
  const age = r.copyright_year ? year - r.copyright_year : null;
  const stale = age != null && age >= 3;
  const noMobile = r.has_viewport === false;
  if (!stale && !noMobile) return null;
  const bits = [];
  if (stale) bits.push(`web sin actualizar desde ${r.copyright_year} (${age} años)`);
  if (noMobile) bits.push("sin viewport móvil (no responsive)");
  return { filter: "actionableLever", level: "yellow", note: `Palanca de rediseño: ${bits.join("; ")}.` };
}

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
