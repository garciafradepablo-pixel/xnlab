// =============================================================================
// callai.js — Cliente de la capa de IA de la Caja Negra.
//
// Un único trabajo: dada una transcripción, devolver el análisis estructurado.
// Pide a la Edge Function `call-analysis` (Gemini) y, si no hay clave, red, o
// respuesta válida, CAE al analizador determinista local (calls.analyzeTranscript).
// El llamante recibe siempre el mismo shape — nunca un fallo que rompa el flujo.
// =============================================================================

import { analyzeTranscript } from "./calls.js";
import { getToken } from "./auth.js";

const ENDPOINT = "https://fecfncfkkgzazuetcllx.supabase.co/functions/v1/call-analysis";
const KEY = "sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS";

/**
 * Analiza una transcripción. Intenta el LLM; si no, el analizador local.
 * @param {string} transcript
 * @param {object} [ctx] { leadName, sector, classification }
 * @returns {Promise<{analysis:object, ai:boolean}>}
 */
export async function analyzeCall(transcript, ctx = {}) {
  const text = String(transcript || "").trim();
  const local = () => ({ analysis: analyzeTranscript(text, ctx), ai: false });
  if (!text) return local();
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ token: getToken(), transcript: text, ctx }),
    });
    if (!res.ok) return local(); // 401/403/5xx → análisis local, sin romper
    const data = await res.json();
    // analysis:null es legítimo (no hay clave en el server) → usa el local.
    if (data && data.ok && data.analysis) return { analysis: data.analysis, ai: true };
    return local();
  } catch {
    return local(); // red caída → local
  }
}
