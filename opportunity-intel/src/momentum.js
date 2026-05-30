// =============================================================================
// momentum.js — Cliente de la Edge Function `momentum`.
//
// Detecta el MOMENTO de una empresa desde prensa pública (Google News RSS, sin
// coste): apertura, financiación, expansión, contratación, premio. Devuelve la
// noticia citada (titular + enlace + fuente). Si no hay señal, found:false —
// nunca inventa. El servidor cachea 7 días.
// =============================================================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/momentum";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

/** @returns {Promise<{ok,found,kind?,headline?,url?,source?,published?,error?}>} */
export async function fetchMomentum(company, token) {
  if (!company) return { ok: false, found: false, error: "Sin empresa." };
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ company, token }),
    });
    return await res.json();
  } catch {
    return { ok: false, found: false, error: "Sin conexión." };
  }
}

const KIND_LABEL = {
  apertura: "Apertura", financiacion: "Financiación", expansion: "Expansión",
  contratacion: "Contratación", premio: "Premio", prensa: "En prensa",
};
export const momentumLabel = (k) => KIND_LABEL[k] || "Momento";

/** El momento detectado, como indicio CITADO para el motor: sube transitionSignal
 *  a verde (es prensa real, no un copyright). null si no hay momento. */
export function momentumToVerification(r) {
  if (!r || !r.found || !r.kind) return null;
  return {
    filter: "transitionSignal",
    level: "green",
    note: `${momentumLabel(r.kind)} en prensa: ${r.headline || ""}`.slice(0, 240),
    url: r.url || null,
  };
}
