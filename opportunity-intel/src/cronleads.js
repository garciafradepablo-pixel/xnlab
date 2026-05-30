// =============================================================================
// cronleads.js — Cliente de la captación DESATENDIDA (Edge Function cron-capture).
//
// El cron del servidor descubre empresas 24/7 y las deja en cola. Al abrir la
// app, el cliente trae las pendientes, las absorbe al ranking (las puntúa el
// motor local) y las marca como reclamadas para no repetir. Así abres por la
// mañana con leads nuevos esperando, sin tener nada abierto.
// =============================================================================

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/cron-capture";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

async function call(action, payload) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

/** Candidatos descubiertos por el cron y aún no absorbidos. [] si falla. */
export async function pendingCronLeads(token) {
  try { const r = await call("pending", { token }); return r && r.ok ? (r.leads || []) : []; }
  catch { return []; }
}

/** Marca como reclamados los ids ya absorbidos (no se repiten). */
export async function claimCronLeads(token, ids) {
  if (!ids || !ids.length) return;
  try { await call("claim", { token, ids }); } catch { /* se reintenta otro día */ }
}
