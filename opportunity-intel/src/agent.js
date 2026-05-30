// =============================================================================
// agent.js — Agente de captación automática ("Nueva tanda").
//
// Al lanzar una tanda, el agente:
//   1. recorre una rotación de consultas por sector + ciudad (semillas),
//   2. descubre candidatos (directorio + Google Places si hay backend),
//   3. los convierte en leads y los PUNTÚA con el motor,
//   4. se queda solo con los que superan el corte (clientes evaluados),
//   5. los guarda como leads de usuario → entran al ranking.
//
// Devuelve un resumen para que la UI muestre "qué ha hecho el agente": cuántos
// vio, cuántos pasaron el corte, cuántos eran nuevos, y la mejor puntuación.
//
// Conservador y honesto: un candidato crudo (sin momento ni evidencia) puntúa
// bajo; el corte por defecto es laxo (deja entrar para enriquecer luego) pero
// se puede subir. No inventa nada: la empresa es real, la evaluación es del
// motor sobre lo que se sabe.
// =============================================================================

import { discover } from "./discovery.js";
import { buildLead } from "./newlead.js";
import { scoreOpportunity } from "./scoring.js";
import { SECTORS } from "./models.js";
import { allSectors, queriesFor } from "./customsectors.js";

// Rotación de "semillas" de búsqueda por sector. Cada tanda avanza por ellas
// para no repetir siempre lo mismo y barrer ciudades distintas.
const CITIES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "Bilbao", "Zaragoza", "Marbella"];
const BASE_QUERIES = {
  health: ["clínicas dentales", "clínicas estética", "fisioterapia deportiva", "clínica fertilidad"],
  hospitality: ["restaurantes premium", "hoteles boutique", "grupos gastronómicos"],
  realestate: ["inmobiliaria lujo", "promotora residencial", "estudio arquitectura"],
  growth: ["marca DTC", "agencia tecnológica", "startup"],
};
// Consultas por sector = base + las definidas en sectores custom (Fase 8).
function queriesForSector(key) {
  return queriesFor(key) || BASE_QUERIES[key] || [];
}
// Todos los sectores activos (base + custom).
function activeSectorKeys() {
  return allSectors().map((s) => s.key);
}

let seedCursor = 0; // avanza entre tandas

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Construye la lista de consultas para una tanda.
 * - Si el usuario escribe un prompt → se usa tal cual (una o varias ciudades).
 * - Si NO escribe nada → barrido ALEATORIO entre sectores y ciudades.
 * @param {string} userQuery  prompt libre (puede venir vacío)
 * @param {string[]} sectors  sectores a barrer
 * @param {number} perBatch   nº de consultas por tanda
 */
function buildQueries(userQuery, sectors, perBatch) {
  const secs = sectors && sectors.length ? sectors : activeSectorKeys();
  const q = (userQuery || "").trim();

  // Prompt libre: si ya menciona una ciudad la respetamos; si no, lo lanzamos
  // tal cual y además en un par de ciudades grandes para ampliar la pesca.
  if (q) {
    const mentionsCity = CITIES.some((c) => q.toLowerCase().includes(c.toLowerCase()));
    if (mentionsCity) return [{ sector: "all", query: q }];
    const cities = [pick(CITIES), pick(CITIES)].filter((v, i, a) => a.indexOf(v) === i);
    return cities.map((city) => ({ sector: "all", query: `${q} ${city}` }));
  }

  // Sin prompt: barrido aleatorio (sector + sub-consulta + ciudad), sin repetir.
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < perBatch && guard++ < perBatch * 8) {
    const sec = pick(secs);
    const qs = queriesForSector(sec);
    if (!qs.length) continue;
    const query = `${pick(qs)} ${pick(CITIES)}`;
    if (seen.has(query)) continue;
    seen.add(query);
    out.push({ sector: sec, query });
  }
  return out;
}

/**
 * Lanza una tanda de captación.
 *
 * @param {object} opts
 *   config       configuración de scoring (state.config)
 *   query        prompt libre del usuario (vacío = barrido aleatorio)
 *   sectors      sectores a barrer (cuando no hay prompt)
 *   existingNames Set de empresas ya presentes (para no duplicar)
 *   perBatch     consultas por tanda (def. 5)
 *   minScore     LISTÓN de excelencia: solo entran al ranking leads ≥ esto
 *   onSave       (lead) => void   se llama por cada lead aceptado
 * @returns {Promise<{seen,evaluated,added,best,queries,sample,belowSample}>}
 */
export async function runBatch({
  config = {},
  query = "",
  sectors = null,
  existingNames = new Set(),
  perBatch = 5,
  minScore = 0,
  token = null,
  onSave = () => {},
} = {}) {
  const queries = buildQueries(query, sectors, perBatch);
  const seenNames = new Set([...existingNames].map((n) => String(n).toLowerCase()));
  let seen = 0, evaluated = 0, added = 0, best = 0;
  const sample = [];
  const below = []; // mejores que NO llegaron al listón (para sugerir enriquecer)

  for (const { sector, query: q } of queries) {
    let candidates = [];
    try { candidates = await discover({ sector, query: q, token }); } catch { candidates = []; }
    for (const c of candidates) {
      seen++;
      const nameKey = String(c.company || "").toLowerCase();
      if (!nameKey || seenNames.has(nameKey)) continue; // dedup global
      const lead = buildLead({
        company: c.company, sector: c.sector || (sector === "all" ? null : sector) || "growth",
        subsector: c.subsector || "", city: c.city || "", website: c.website || null,
        phone: c.phone || null, googleMaps: c.googleMaps || null,
      });
      const scores = scoreOpportunity(lead, config);
      evaluated++;
      if (scores.redCount >= 4) continue; // descarte duro, ni para enriquecer
      // Por debajo del listón: NO entra al ranking, pero lo recordamos como
      // "candidato a enriquecer" para informar al usuario (honestidad).
      if (scores.confidence < minScore) {
        below.push({ company: lead.company, city: lead.city, confidence: scores.confidence });
        continue;
      }
      seenNames.add(nameKey);
      onSave(lead);
      added++;
      best = Math.max(best, scores.confidence);
      if (sample.length < 5) sample.push({ company: lead.company, city: lead.city, confidence: scores.confidence, classification: scores.classification });
    }
  }

  // Ordena por puntuación (lo mejor primero).
  sample.sort((a, b) => b.confidence - a.confidence);
  below.sort((a, b) => b.confidence - a.confidence);
  return {
    seen, evaluated, added, best,
    queries: queries.map((x) => x.query),
    sample,
    belowSample: below.slice(0, 3),
  };
}

/** Reinicia el cursor de semillas (para tests o "empezar de cero"). */
export function resetAgent() { seedCursor = 0; }
