// =============================================================================
// contacts.js — Cliente del rascador de contactos. Llama a la Edge Function
// `contacts`, que lee la web pública de una empresa y devuelve email, teléfono
// y redes. Best-effort: si no hay nada, devuelve null sin romper.
// =============================================================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/contacts";
const ANON = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

/** @returns {Promise<{email,phone,instagram,linkedin,facebook,emails,phones}|null>} */
export async function fetchContacts(website, token) {
  if (typeof fetch === "undefined" || !website) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
      body: JSON.stringify({ url: website, token: token || null }),
      signal: typeof AbortSignal !== "undefined" ? AbortSignal.timeout(16000) : undefined,
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d && d.ok && d.readable ? d : null;
  } catch {
    return null;
  }
}
