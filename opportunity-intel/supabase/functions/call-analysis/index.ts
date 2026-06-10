// =============================================================================
// call-analysis — La capa de IA de la Caja Negra Comercial.
//
// Recibe la transcripción de UNA llamada comercial (que hizo un humano) y la
// convierte en un dossier estructurado: resumen, qué quiere de verdad el
// cliente, dolores, objeciones, señales de compra/pérdida, lo que no dice pero
// se infiere, siguiente acción, mensaje de seguimiento, scores y aprendizajes.
//
// Cerebro: Gemini (tier gratuito) si hay GEMINI_API_KEY. Si NO la hay —o falla—
// devuelve { ok:true, analysis:null }: el cliente entonces usa el analizador
// DETERMINISTA local (src/calls.js · analyzeTranscript), que da el mismo shape.
// La función nunca rompe el flujo: con clave afina, sin clave delega al local.
//
// No escribe en base de datos: es un transformador puro de texto→análisis. El
// registro de la llamada se guarda en el documento compartido (connect-state),
// no aquí. Exige sesión con permiso de escritura (es una herramienta de venta).
//
// Seguridad: service_role SOLO para validar el token; misma TTL que el resto.
// =============================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const CAN_WRITE = new Set(["admin", "editor"]);
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días, igual que el resto
const tokenExpired = (tokenAt: string | null) =>
  !!tokenAt && Date.now() - new Date(tokenAt).getTime() > TOKEN_TTL_MS;

async function rest(path: string, init: RequestInit = {}) {
  return await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function userByToken(token: string) {
  if (!token) return null;
  const res = await rest(`connect_users?select=name,role,token_at&token=eq.${encodeURIComponent(token)}`);
  const rows = await res.json();
  const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!u || tokenExpired(u.token_at)) return null;
  return u;
}

// —— El cerebro: transcripción → dossier comercial estructurado ————————————————
async function analyze(transcript: string, ctx: Record<string, unknown>) {
  if (!GEMINI_API_KEY) return null; // sin clave → el cliente usa el analizador local
  const leadName = String(ctx?.leadName || "el cliente");
  const sector = String(ctx?.sector || "desconocido");
  const prompt =
    "Eres el analista comercial de XNLAB, un estudio creativo premium (dirección " +
    "creativa, branding, atmósferas digitales, contenido, automatización). Acabas " +
    "de escuchar la transcripción de una llamada de venta que hizo un humano del " +
    "equipo. Conviértela en inteligencia comercial accionable. NO inventes nada " +
    "que no esté en el texto; si algo se infiere, márcalo como inferencia.\n\n" +
    `Cliente: ${leadName}. Sector: ${sector}.\n\n` +
    "Devuelve EXCLUSIVAMENTE un JSON con esta forma exacta:\n" +
    "{\n" +
    '  "summary": string,                // resumen ejecutivo, 1-2 frases\n' +
    '  "wants": string,                  // qué quiere de verdad el cliente\n' +
    '  "pains": string[],                // dolores detectados (etiquetas cortas)\n' +
    '  "objections": string[],           // objeciones planteadas\n' +
    '  "buySignals": string[],           // frases literales de compra\n' +
    '  "lossSignals": string[],          // frases literales de pérdida\n' +
    '  "inferred": string[],             // lo que NO dice pero se infiere\n' +
    '  "services": string[],             // servicios del estudio que encajan\n' +
    '  "authority": string,              // autoridad de decisión observada\n' +
    '  "budget": string|null,            // presupuesto mencionado, o null\n' +
    '  "urgency": "alta"|"media"|"baja",\n' +
    '  "nextStep": string,               // siguiente acción recomendada\n' +
    '  "followUp": string,               // mensaje de seguimiento listo para enviar\n' +
    '  "scores": { "interest": number, "fit": number, "close": number }, // 0-100\n' +
    '  "closeProbability": number,       // 0-100\n' +
    '  "learnings": string[]             // aprendizajes para mejorar el pitch\n' +
    "}\n\n" +
    "Español natural y directo. Sé conservador con los scores: sin señal clara, " +
    "puntúa bajo. El mensaje de seguimiento, en tono de estudio premium (primera " +
    "persona del plural o neutro), breve, con una sola petición concreta.\n\n" +
    "Transcripción:\n" + transcript;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      },
    );
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(txt);
    if (!parsed || typeof parsed !== "object") return null;
    parsed.engine = "gemini";
    return parsed;
  } catch {
    return null; // red caída / cuota / respuesta rara → el cliente cae al local
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { token, transcript, ctx } = await req.json().catch(() => ({}));
    const caller = await userByToken(String(token || ""));
    if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);
    if (!CAN_WRITE.has(caller.role)) return json({ ok: false, error: "Tu rol no puede analizar llamadas." }, 403);

    const text = String(transcript || "").trim();
    if (!text) return json({ ok: false, error: "La transcripción está vacía." }, 400);

    const analysis = await analyze(text, ctx || {});
    // analysis:null es legítimo → el cliente usa su analizador local determinista.
    return json({ ok: true, analysis, ai: !!analysis });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
