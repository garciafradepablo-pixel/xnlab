// =============================================================================
// taxonomy — El arquitecto. Una idea en una línea → un árbol de categorías.
//
// Recibe una idea suelta ("clínicas", "creatividades para tatuadores") y la
// convierte en un ÁRBOL de categorías anidadas, sólido y accionable, cuyas
// HOJAS son nichos concretos que se pueden buscar en el mapa. Así el usuario
// escribe una sola línea y la app organiza la captación en carpetas solas.
//
// Cerebro: Gemini (tier gratuito) si hay GEMINI_API_KEY. Sin clave —o si falla—
// cae a un respaldo determinista: si la idea trae rutas con "/" las respeta;
// si no, crea una raíz única. La función NUNCA deja de devolver un árbol.
//
// Seguridad: mismo patrón que el resto. service_role solo en el servidor; el
// token de sesión resuelve al usuario. Cualquier sesión válida puede generar
// (organizar categorías es inocuo; descubrir empresas sí exige rol con permiso).
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

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const tokenExpired = (tokenAt: string | null) =>
  !!tokenAt && Date.now() - new Date(tokenAt).getTime() > TOKEN_TTL_MS;

async function userByToken(token: string) {
  if (!token) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/connect_users?select=id,token_at&token=eq.${encodeURIComponent(token)}`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  const rows = await res.json();
  const u = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!u || tokenExpired(u.token_at)) return null;
  return u;
}

// —— Saneado: poda el árbol a algo manejable y limpio ————————————————————————
type Node = { name: string; children: Node[] };
const MAX_DEPTH = 4, MAX_BREADTH = 6, MAX_NODES = 60;
let nodeBudget = MAX_NODES;

function clean(raw: unknown, depth: number): Node | null {
  if (nodeBudget <= 0 || depth > MAX_DEPTH || !raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = String(r.name ?? r.label ?? "").trim().replace(/\s+/g, " ").slice(0, 48);
  if (!name) return null;
  nodeBudget--;
  const kidsRaw = Array.isArray(r.children) ? r.children : [];
  const children: Node[] = [];
  for (const k of kidsRaw) {
    if (children.length >= MAX_BREADTH || depth >= MAX_DEPTH) break;
    const c = clean(k, depth + 1);
    if (c) children.push(c);
  }
  return { name, children };
}
function cleanForest(arr: unknown): Node[] {
  nodeBudget = MAX_NODES;
  const roots = Array.isArray(arr) ? arr : [];
  const out: Node[] = [];
  for (const r of roots) {
    if (out.length >= 3) break; // 1-3 raíces como mucho
    const c = clean(r, 1);
    if (c) out.push(c);
  }
  return out;
}

// —— Respaldo determinista (sin LLM): respeta rutas con "/" o crea una raíz —————
function titleCase(s: string) {
  return s.trim().replace(/\s+/g, " ").replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase());
}
function fallbackForest(prompt: string): Node[] {
  const text = String(prompt || "").trim();
  if (!text) return [];
  // Segmentos por línea o coma; cada uno puede ser una ruta "a/b/c".
  const segments = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const roots: Node[] = [];
  const findOrAdd = (list: Node[], name: string) => {
    let n = list.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!n) { n = { name, children: [] }; list.push(n); }
    return n;
  };
  let any = false;
  for (const seg of segments) {
    const parts = seg.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    any = true;
    let level = roots;
    for (const p of parts) { const node = findOrAdd(level, p); level = node.children; }
  }
  if (any) return cleanForest(roots);
  return [{ name: titleCase(text).slice(0, 48), children: [] }];
}

async function fromGemini(prompt: string): Promise<Node[] | null> {
  if (!GEMINI_API_KEY) return null;
  const sys =
    "Eres un arquitecto de taxonomías para una herramienta de captación de clientes B2B. " +
    "Recibes una idea o nicho en lenguaje natural y devuelves un ÁRBOL de categorías " +
    "anidadas, limpio y accionable, para organizar la búsqueda de empresas reales.\n\n" +
    'Devuelve SOLO JSON: {"tree":[{"name":"...","children":[{"name":"...","children":[]}]}]}.\n' +
    "Reglas estrictas:\n" +
    "- 1 categoría raíz (excepcionalmente 2-3 si la idea es claramente plural).\n" +
    "- Hasta 4 niveles de profundidad. Cada nodo: 2 a 6 hijos como mucho.\n" +
    "- Las HOJAS (nodos sin hijos) son NICHOS CONCRETOS Y BUSCABLES: un tipo de " +
    "negocio que se puede buscar en un mapa (p.ej. 'clínicas de ortodoncia', " +
    "'estudios de tatuaje realista', 'fisioterapia deportiva').\n" +
    "- Nombres cortos, en español, en minúscula salvo nombres propios.\n" +
    "- Categorías SÓLIDAS y mutuamente excluyentes; nada de ramas absurdas ni relleno.\n" +
    "- Si la idea ya trae una ruta con '/', respétala como columna vertebral y " +
    "enriquécela con hermanos razonables del mismo nivel.\n\n" +
    "Idea:\n" + prompt;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sys }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      },
    );
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(txt);
    const tree = cleanForest(parsed?.tree ?? parsed);
    return tree.length ? tree : null;
  } catch {
    return null;
  }
}

// —— Clasificador: organiza empresas en el árbol y las etiqueta por dimensiones —
const TAG_DIMS = ["entorno", "clase", "estetica"];
function cleanPath(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((s) => String(s).trim().replace(/\s+/g, " ").slice(0, 48)).filter(Boolean).slice(0, MAX_DEPTH);
}
function cleanTags(obj: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj && typeof obj === "object") {
    for (const d of TAG_DIMS) {
      const v = String((obj as Record<string, unknown>)[d] ?? "").trim().slice(0, 32);
      if (v) out[d] = v;
    }
  }
  return out;
}

async function classifyWithGemini(
  items: Array<{ company: string; subsector?: string; city?: string }>,
  forest: unknown,
): Promise<Array<{ i: number; path: string[]; tags: Record<string, string> }> | null> {
  if (!GEMINI_API_KEY || !items.length) return null;
  const list = items
    .map((it, i) => `${i}: ${it.company || "?"}${it.subsector ? ` · ${it.subsector}` : ""}${it.city ? ` · ${it.city}` : ""}`)
    .join("\n");
  const sys =
    "Eres el cerebro de captación de XNLAB. Organizas empresas en un ÁRBOL de " +
    "categorías coherente (carpetas y subcarpetas) y las etiquetas por dimensiones " +
    "cruzables, para prospectar como un Apollo interno.\n\n" +
    "Árbol de categorías actual (JSON; puede venir vacío):\n" +
    JSON.stringify(Array.isArray(forest) ? forest : []) + "\n\n" +
    "Empresas a clasificar (índice: nombre · subsector · ciudad):\n" + list + "\n\n" +
    "Para CADA empresa devuelve:\n" +
    "- \"path\": la ruta de carpetas más específica y adecuada, de la raíz a la hoja " +
    "(p.ej. [\"clínicas\",\"ortopedia\"]). REUTILIZA ramas del árbol actual cuando " +
    "encajen; crea subcarpetas nuevas cuando haga falta. Agrupa con criterio (tipo " +
    "de negocio, entorno, clase). Máximo 4 niveles, nombres cortos en español, " +
    "minúscula salvo nombres propios.\n" +
    "- \"tags\": objeto con etiquetas cruzables (cadena vacía si no se deduce):\n" +
    "    \"entorno\": dónde opera (urbano, costa, rural, online…)\n" +
    "    \"clase\": nivel/tier (lujo, premium, medio, económico)\n" +
    "    \"estetica\": vibe estético (minimalista, clásico, moderno, urbano…)\n\n" +
    "NO inventes datos que no se deduzcan del nombre/subsector/ciudad; ante la duda, " +
    "deja la etiqueta vacía. Devuelve SOLO JSON: " +
    '{"assignments":[{"i":0,"path":["..."],"tags":{"entorno":"","clase":"","estetica":""}}]}';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sys }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      },
    );
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(txt);
    const raw = Array.isArray(parsed?.assignments) ? parsed.assignments : [];
    return raw
      .map((a: Record<string, unknown>) => ({ i: Number(a.i), path: cleanPath(a.path), tags: cleanTags(a.tags) }))
      .filter((a: { i: number; path: string[] }) => Number.isInteger(a.i) && a.i >= 0 && a.i < items.length && a.path.length);
  } catch {
    return null;
  }
}

// —— Radar de momentos: propone nichos nuevos a explorar ——————————————————————
async function radarWithGemini(
  forest: unknown,
  interests: string[],
  niches: string[],
): Promise<Array<{ path: string[]; why: string }> | null> {
  if (!GEMINI_API_KEY) return null;
  const today = new Date().toISOString().slice(0, 10);
  const sys =
    "Eres el radar de oportunidades de XNLAB, un estudio creativo de élite. Propones " +
    "NICHOS NUEVOS de clientes a explorar AHORA, partiendo de lo que el equipo ya " +
    "trabaja. Razonas sobre estacionalidad, ciclos de negocio y nichos adyacentes de " +
    "alto valor; eres honesto: son hipótesis a explorar, no noticias verificadas.\n\n" +
    `Fecha de hoy: ${today}.\n` +
    "Árbol de categorías actual (JSON):\n" + JSON.stringify(Array.isArray(forest) ? forest : []) + "\n" +
    (interests.length ? "Lo que más busca el equipo: " + interests.join(", ") + "\n" : "") +
    (niches.length ? "Nichos que mejor convierten: " + niches.join(", ") + "\n" : "") + "\n" +
    "Propón 4-7 nichos NUEVOS y concretos (no repitas hojas que ya estén en el árbol). " +
    "Para cada uno da una ruta de carpetas (raíz→hoja) y un 'why' de UNA frase con el " +
    "motivo de por qué AHORA (momento, estacionalidad, transición típica del sector). " +
    "Nichos buscables (negocios reales), nombres cortos en español, minúscula salvo " +
    "nombres propios.\n\n" +
    'Devuelve SOLO JSON: {"suggestions":[{"path":["...","..."],"why":"..."}]}';
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sys }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.6 },
        }),
      },
    );
    const data = await res.json();
    const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(txt);
    const raw = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
    return raw
      .map((s: Record<string, unknown>) => ({ path: cleanPath(s.path), why: String(s.why ?? "").trim().slice(0, 180) }))
      .filter((s: { path: string[] }) => s.path.length)
      .slice(0, 8);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { action, token, prompt, items, forest, interests, niches, queries } = await req.json().catch(() => ({}));
    const caller = await userByToken(String(token || ""));
    if (!caller) return json({ ok: false, error: "Sesión no válida." }, 401);

    // seedcron: siembra los nichos del cerebro (hojas del mapa + radar) en la cola
    // del cron 24/7, para que la captación desatendida cace lo que el mapa decide.
    if (action === "seedcron") {
      const svc = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
      const qs = (Array.isArray(queries) ? queries : [])
        .map((q: Record<string, unknown>) => ({ query: String(q?.query || "").trim().slice(0, 120), sector: q?.sector ? String(q.sector).slice(0, 40) : null }))
        .filter((q: { query: string }) => q.query.length > 2)
        .slice(0, 50);
      if (!qs.length) return json({ ok: true, seeded: 0 });
      let seeded = 0;
      try {
        const existRes = await fetch(`${SUPABASE_URL}/rest/v1/cron_queries?select=query`, { headers: svc });
        const exist = await existRes.json();
        const have = new Set((Array.isArray(exist) ? exist : []).map((r: { query: string }) => String(r.query).toLowerCase()));
        const seen = new Set<string>();
        const toInsert = qs.filter((q: { query: string }) => {
          const k = q.query.toLowerCase();
          if (have.has(k) || seen.has(k)) return false;
          seen.add(k); return true;
        });
        if (toInsert.length) {
          const ins = await fetch(`${SUPABASE_URL}/rest/v1/cron_queries`, {
            method: "POST",
            headers: { ...svc, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify(toInsert.map((q: { query: string; sector: string | null }) => ({ query: q.query, sector: q.sector, active: true }))),
          });
          if (ins.ok) seeded = toInsert.length;
        }
      } catch { /* best-effort */ }
      return json({ ok: true, seeded });
    }

    // radar: propone nichos nuevos a explorar según el momento y lo ya trabajado.
    if (action === "radar") {
      const ints = (Array.isArray(interests) ? interests : []).map((s: unknown) => String(s).slice(0, 60)).filter(Boolean).slice(0, 12);
      const nch = (Array.isArray(niches) ? niches : []).map((s: unknown) => String(s).slice(0, 60)).filter(Boolean).slice(0, 12);
      const suggestions = (await radarWithGemini(forest, ints, nch)) || [];
      return json({ ok: true, suggestions, ai: !!GEMINI_API_KEY && suggestions.length > 0 });
    }

    // classify: organiza un lote de empresas en el árbol y las etiqueta.
    if (action === "classify") {
      const batch = (Array.isArray(items) ? items : []).slice(0, 40)
        .map((it: Record<string, unknown>) => ({
          company: String(it?.company || "").slice(0, 80),
          subsector: String(it?.subsector || "").slice(0, 60),
          city: String(it?.city || "").slice(0, 40),
        }))
        .filter((it: { company: string }) => it.company);
      if (!batch.length) return json({ ok: true, assignments: [] });
      const assignments = (await classifyWithGemini(batch, forest)) || [];
      return json({ ok: true, assignments, ai: !!GEMINI_API_KEY && assignments.length > 0 });
    }

    // por defecto: genera un árbol a partir de una idea en lenguaje natural.
    const text = String(prompt || "").trim();
    if (!text) return json({ ok: false, error: "Escribe una idea." }, 400);
    const tree = (await fromGemini(text)) || fallbackForest(text);
    return json({ ok: true, tree, ai: !!GEMINI_API_KEY && tree.length > 0 });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
