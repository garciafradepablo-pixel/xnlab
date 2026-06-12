// =============================================================================
// webenrich.js — Enriquecimiento web HONESTO: de la web de un lead a señales
// citadas para el motor. PURO y testeable (no hace fetch; recibe la lectura que
// devuelve la Edge Function `enrich-web`).
//
// Reglas de honestidad (innegociables):
//   - VERDE solo si la web AFIRMA algo explícito (decisor con nombre + email
//     directo; apertura con fecha concreta). Todo lo demás es indicio → AMARILLO.
//   - Lo que no aparece queda GRIS (no se genera verificación, no sube el OCI).
//   - No se infiere más allá del texto. Fragmentos cortos, no páginas enteras.
//   - Si la lectura falla, se marca "No se pudo verificar" — sin penalizar falso.
//   - Cada señal lleva fuente (url) y fecha (fetchedAt).
// =============================================================================

import { webSignalsToVerifications } from "./enrichweb.js";

/**
 * Normaliza una URL a origen https seguro. Rechaza esquemas peligrosos
 * (javascript:, data:, file:, ftp:…). Devuelve "https://host/" o null.
 */
export function safeUrl(raw) {
  let s = String(raw || "").trim();
  if (!s) return null;
  if (/^(javascript|data|file|ftp|mailto|vbscript):/i.test(s)) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `${u.protocol}//${u.host.toLowerCase()}/`;
  } catch {
    return null;
  }
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const GENERIC_EMAIL = /^(info|hello|hola|contact|contacto|admin|office|oficina|sales|ventas|soporte|support)@/i;
const PREMIUM = /\b(premium|luxury|boutique|exclusive|bespoke|alta gama|lujo|high-?end|exclusiv)\b/i;
const SERVICES = /\bservices\b|servicios|what we do|qu[eé] hacemos|soluciones|solutions/i;
const GENERIC_POS = /we help (businesses|companies|brands)|ayudamos a (empresas|negocios|marcas)|your (growth )?partner|tu socio|llevamos tu (negocio|marca)/i;
const FOUNDER = /\b(founder|co-?founder|fundador|fundadora|ceo|managing director|director general|propietari[oa]|owner)\b/i;
const DATED_OPENING = /(opening|apertura|abrimos|abre|opens|launch(ing)?|lanzamiento|inaugura)[^.]{0,40}(20\d{2}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december|q[1-4]\b)/i;

const linkHas = (links, re) => Array.isArray(links) && links.some((l) => re.test(String(l)));

function snippetAround(text, re, max = 140) {
  const m = String(text || "").match(re);
  if (!m) return null;
  const i = Math.max(0, m.index - 30);
  return String(text).slice(i, i + max).replace(/\s+/g, " ").trim();
}

/**
 * Transforma la lectura de una web en verificaciones citadas + lecturas de dolor.
 * @param {object} page  respuesta de enrich-web (readable, title, meta_description,
 *   headings[], visible_text, links[], signals{}, copyright_year, has_viewport, url, fetched_at)
 * @param {object} [opts] { website }
 * @returns {{status:'success'|'failed', source:string|null, fetchedAt:string,
 *   verifications:Array, pains:string[], note?:string}}
 */
export function extractWebSignals(page = {}, opts = {}) {
  const fetchedAt = page.fetched_at || page.fetchedAt || new Date().toISOString();
  const source = page.final_url || page.url || opts.website || null;

  if (!page || page.readable === false) {
    return { status: "failed", source, fetchedAt, verifications: [], pains: [], note: page.note || "No se pudo verificar su web (bloqueada, lenta o sin contenido)." };
  }

  // Texto disponible (de más a menos). Funciona tanto con la respuesta rica
  // (visible_text/headings) como con la mínima (solo title) — degrada con honestidad.
  const text = [page.title, page.meta_description, ...(page.headings || []), page.visible_text]
    .filter(Boolean).join(" ");
  const links = page.links || [];
  const sig = page.signals || {};

  const raw = []; // verificaciones candidatas (luego dedup por filtro, gana la más alta)
  const pains = [];
  const add = (filter, level, note, snippet) => raw.push({ filter, level, note, url: source, snippet: snippet || null });

  // --- Acceso / contacto (reachableDecisionMaker) ---
  const em = text.match(EMAIL_RE);
  const hasContactLink = linkHas(links, /\/(contact|contacto|contact-us)\b/i);
  const hasFounder = FOUNDER.test(text);
  if (em && !GENERIC_EMAIL.test(em[0]) && hasFounder) {
    add("reachableDecisionMaker", "green", `Decisor con nombre y email directo en la web (${em[0]}).`, em[0]);
  } else if (em && !GENERIC_EMAIL.test(em[0])) {
    add("reachableDecisionMaker", "yellow", `Email directo publicado (${em[0]}) — canal de entrada citado.`, em[0]);
  } else if (em || hasContactLink) {
    add("reachableDecisionMaker", "yellow", "Canal de contacto en la web (formulario/email genérico) — entrada posible, sin nombre.", em ? em[0] : "/contacto");
  } else {
    pains.push("Sin contacto visible en la home");
  }

  // --- Capacidad / premium (economicCapacity) — marketing premium = indicio, no prueba ---
  if (PREMIUM.test(text)) add("economicCapacity", "yellow", "Posicionamiento premium en su copy — indicio de ticket alto (no confirmado).", snippetAround(text, PREMIUM));

  // --- Oferta clara vs genérica (strategicFit / actionableLever / visibleTension) ---
  const hasServices = SERVICES.test(text) || linkHas(links, /\/(services|servicios|what-we-do)\b/i);
  if (hasServices) {
    add("strategicFit", "yellow", "Oferta/servicios visibles en la web — negocio legible.", snippetAround(text, SERVICES));
  } else {
    pains.push("Oferta poco clara / sin página de servicios");
    add("actionableLever", "yellow", "Sin servicios claros en la home — palanca: clarificar la oferta.", null);
  }
  if (GENERIC_POS.test(text)) {
    pains.push("Posicionamiento genérico");
    add("visibleTension", "yellow", "Posicionamiento genérico ('ayudamos a empresas…') — tensión marca vs ambición.", snippetAround(text, GENERIC_POS));
  }

  // --- Crecimiento / contratación (transitionSignal) ---
  const hasCareers = sig.hiring || linkHas(links, /\/(careers|jobs|empleo|trabaja|join)\b/i);
  if (hasCareers) add("transitionSignal", "yellow", "Señal de contratación en la web — crecimiento citado.", null);

  // --- Momento / apertura (whyNow) — VERDE solo si hay fecha explícita ---
  if (DATED_OPENING.test(text)) {
    add("whyNow", "green", "Apertura/lanzamiento con fecha explícita en la web — momento confirmado.", snippetAround(text, DATED_OPENING));
  } else if (sig.opening || /(coming soon|pr[oó]xima apertura|now open|nueva sede|new location|nuevo local)/i.test(text)) {
    add("whyNow", "yellow", "Anuncio de apertura/expansión sin fecha — momento indicado.", null);
  }

  // --- Frescura de la web (actionableLever) — reutiliza el lector existente ---
  for (const v of webSignalsToVerifications(page)) {
    add(v.filter, v.level, v.note, null);
  }

  // CTA / reserva: refuerza acceso si hay vía de conversión.
  if (sig.booking) add("reachableDecisionMaker", "yellow", "CTA de reserva/cita en la web — vía de conversión citada.", null);

  // Dedup por filtro: gana el nivel más alto (green > yellow).
  const LEVEL_RANK = { green: 2, yellow: 1 };
  const byFilter = new Map();
  for (const v of raw) {
    const cur = byFilter.get(v.filter);
    if (!cur || (LEVEL_RANK[v.level] || 0) > (LEVEL_RANK[cur.level] || 0)) byFilter.set(v.filter, v);
  }
  const verifications = [...byFilter.values()];

  return { status: "success", source, fetchedAt, verifications, pains };
}

/** Resumen humano del enriquecimiento, para la UI/operator. */
export function enrichmentSummary(result) {
  if (!result || result.status === "failed") {
    return result?.note ? `No se pudo verificar su web — ${result.note}` : "No se pudo verificar su web.";
  }
  const v = result.verifications || [];
  if (!v.length) return "Leída la web: sin señales nuevas citables (sigue gris donde no hay prueba).";
  const greens = v.filter((x) => x.level === "green").length;
  const yellows = v.length - greens;
  const bits = [];
  if (greens) bits.push(`${greens} confirmada${greens === 1 ? "" : "s"}`);
  if (yellows) bits.push(`${yellows} indicio${yellows === 1 ? "" : "s"}`);
  return `Web leída: ${bits.join(" · ")} citada(s).`;
}
