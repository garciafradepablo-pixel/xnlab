// =============================================================================
// sectorinfer.js — Detecta el SECTOR a partir de lo que el usuario busca.
//
// "clínicas dentales en Valencia" → sector salud (existente).
// "estudios de tatuaje premium"   → sector NUEVO "Estudios De Tatuaje".
//
// Así el captador es automático: no eliges sector, lo escribes en lenguaje
// natural y Connect decide si encaja en uno existente o crea uno nuevo (que
// luego puntúa con su propia lente). Módulo PURO y testeable (sin DOM).
// =============================================================================

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Palabras que mapean a los sectores BASE (evita proliferar sectores por nada).
const KEYWORDS = {
  health: ["clinic", "dental", "estetic", "salud", "medic", "fisio", "dermat", "odont", "psicolog", "veterinar", "optic", "nutric", "cirug"],
  hospitality: ["restaurant", "hotel", "hosteler", "gastro", "cocktail", "coctel", "rooftop", "catering", "resort", "taberna", "braser", "cafeter"],
  realestate: ["inmobil", "promotor", "real estate", "residenc", "vivienda", "construc", "arquitect", "reforma", "branded residence", "chalet", "villa"],
  growth: ["marca", "dtc", "ecommerce", "e-commerce", "retail", "startup", "saas", "fashion", "moda", "agencia", "consultor", "fitness", "gimnasio", "gym"],
};

// Relleno y ciudades grandes a quitar para que la etiqueta del sector sea la
// CATEGORÍA, no el lugar ("clínicas dentales en Valencia" → "Clínicas Dentales").
const FILLER = new Set(["en", "de", "del", "la", "el", "los", "las", "para", "con", "cerca", "y", "o", "a", "un", "una", "premium", "lujo"]);
const CITIES = new Set(["madrid", "barcelona", "valencia", "sevilla", "malaga", "bilbao", "zaragoza", "marbella", "alicante", "granada", "murcia", "vigo", "gijon", "cordoba", "valladolid", "ibiza", "mallorca", "tenerife", "españa", "spain", "costa", "sol", "brava", "del"]);

function sectorLabel(query) {
  const toks = norm(query).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const kept = toks.filter((t) => !FILLER.has(t) && !CITIES.has(t) && t.length > 1);
  const base = (kept.length ? kept : toks).slice(0, 4);
  // Title-case sencillo.
  return base.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || String(query).trim().slice(0, 32);
}

/**
 * @param {string} query  lo que el usuario busca, en lenguaje natural
 * @param {Array<{key,label,custom?}>} existing  sectores ya disponibles
 * @returns {{key:string|null, label:string, isNew:boolean, empty?:boolean}}
 *   key=null + isNew=true → hay que crear el sector con `label`.
 */
export function inferSector(query, existing = []) {
  const q = norm(query);
  if (!q.trim()) return { key: null, label: "", isNew: false, empty: true };

  // 1) Sector BASE por palabra clave.
  for (const [key, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => q.includes(w))) return { key, label: key, isNew: false };
  }
  // 2) Sector CUSTOM ya existente (coincidencia por su primera palabra).
  for (const s of existing) {
    if (!s.custom) continue;
    const first = norm(s.label).split(/\s+/)[0];
    if (first.length >= 4 && q.includes(first)) return { key: s.key, label: s.label, isNew: false };
  }
  // 3) Nicho nuevo: etiqueta limpia, a crear.
  return { key: null, label: sectorLabel(query), isNew: true };
}
