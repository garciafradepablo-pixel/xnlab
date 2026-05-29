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

// Rotación de "semillas" de búsqueda por sector. Cada tanda avanza por ellas
// para no repetir siempre lo mismo y barrer ciudades distintas.
const CITIES = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "Bilbao", "Zaragoza", "Marbella"];
const SECTOR_QUERIES = {
  health: ["clínicas dentales", "clínicas estética", "fisioterapia deportiva", "clínica fertilidad"],
  hospitality: ["restaurantes premium", "hoteles boutique", "grupos gastronómicos"],
  realestate: ["inmobiliaria lujo", "promotora residencial", "estudio arquitectura"],
  growth: ["marca DTC", "agencia tecnológica", "startup"],
};

let seedCursor = 0; // avanza entre tandas

/**
 * Construye la lista de consultas para una tanda.
 * @param {string[]} sectors  sectores a barrer (por defecto, todos)
 * @param {number} perBatch   nº de consultas por tanda
 */
function buildQueries(sectors, perBatch) {
  const out = [];
  const secs = sectors && sectors.length ? sectors : SECTORS.map((s) => s.key);
  let i = seedCursor;
  while (out.length < perBatch) {
    const sec = secs[i % secs.length];
    const qs = SECTOR_QUERIES[sec] || [];
    const q = qs[Math.floor(i / secs.length) % qs.length];
    const city = CITIES[i % CITIES.length];
    if (q) out.push({ sector: sec, query: `${q} ${city}` });
    i++;
    if (i - seedCursor > perBatch * 6) break; // salvaguarda
  }
  seedCursor = i; // la próxima tanda continúa donde lo dejó
  return out;
}

/**
 * Lanza una tanda de captación.
 *
 * @param {object} opts
 *   config       configuración de scoring (state.config)
 *   sectors      sectores a barrer
 *   existingIds  Set de ids/empresas ya presentes (para no duplicar)
 *   perBatch     consultas por tanda (def. 4)
 *   minScore     corte de confianza para entrar al ranking (def. 0 = todos los
 *                que no sean "discard")
 *   onSave       (lead) => void   se llama por cada lead aceptado
 * @returns {Promise<{seen,evaluated,added,best,queries,sample}>}
 */
export async function runBatch({
  config = {},
  sectors = null,
  existingNames = new Set(),
  perBatch = 4,
  minScore = 0,
  onSave = () => {},
} = {}) {
  const queries = buildQueries(sectors, perBatch);
  const seenNames = new Set([...existingNames].map((n) => String(n).toLowerCase()));
  let seen = 0, evaluated = 0, added = 0, best = 0;
  const sample = [];

  for (const { sector, query } of queries) {
    let candidates = [];
    try { candidates = await discover({ sector, query }); } catch { candidates = []; }
    for (const c of candidates) {
      seen++;
      const nameKey = String(c.company || "").toLowerCase();
      if (!nameKey || seenNames.has(nameKey)) continue; // dedup global
      // Convertir a lead y evaluar.
      const lead = buildLead({
        company: c.company, sector: c.sector || sector, subsector: c.subsector || "",
        city: c.city || "", website: c.website || null,
        phone: c.phone || null, googleMaps: c.googleMaps || null,
      });
      const scores = scoreOpportunity(lead, config);
      evaluated++;
      // Solo entran clientes EVALUADOS que no sean descarte y superen el corte.
      if (scores.classification === "discard") continue;
      if (scores.confidence < minScore) continue;
      seenNames.add(nameKey);
      onSave(lead);
      added++;
      best = Math.max(best, scores.confidence);
      if (sample.length < 5) sample.push({ company: lead.company, city: lead.city, confidence: scores.confidence, classification: scores.classification });
    }
  }

  // Ordena la muestra por puntuación (lo mejor primero).
  sample.sort((a, b) => b.confidence - a.confidence);
  return { seen, evaluated, added, best, queries: queries.map((q) => q.query), sample };
}

/** Reinicia el cursor de semillas (para tests o "empezar de cero"). */
export function resetAgent() { seedCursor = 0; }
