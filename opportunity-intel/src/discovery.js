// =============================================================================
// discovery.js — Descubrimiento de candidatos DENTRO de la app.
//
// El usuario elige sector + ciudad y la app le muestra candidatos reales aquí
// mismo (no le manda a Google). Cada candidato se puede añadir de un toque y se
// puntúa como el resto.
//
// Dos fuentes, en este orden:
//   1) Directorio curado (CANDIDATES): empresas reales con datos públicos
//      (web, ciudad, sector). Ampliable. Funciona sin red ni claves.
//   2) Conector Places (placesAdapter): hueco listo para enchufar Google Places
//      en producción y traer volumen masivo. En el demo devuelve [].
//
// Honesto: un candidato del directorio es un PUNTO DE PARTIDA (empresa real del
// sector), no un lead cualificado. Al añadirlo entra con señales conservadoras
// y el usuario lo enriquece (momento, tensión, verificación). No se inventa
// ninguna "oportunidad": solo se ofrece la empresa para investigarla.
// =============================================================================

// Normaliza texto para buscar sin acentos/mayúsculas.
const norm = (s) =>
  String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// Raíz tolerante a plural/sinónimos: "clínicas"→"clinic", "dentales"→"dental".
// Así "clinicas dentales madrid" encuentra "Clínica Dental ...".
function stem(tok) {
  let t = norm(tok);
  t = t.replace(/(es|s)$/,"");          // plural simple
  t = t.replace(/(a|o)$/,"");            // género (clinic/clinica → clinic)
  return t;
}
// ¿El token (por raíz) aparece como prefijo de alguna palabra del texto?
function tokenHits(tok, haystackWords) {
  const r = stem(tok);
  if (r.length < 3) return true; // tokens muy cortos no filtran (de, la, ...)
  return haystackWords.some((w) => w.startsWith(r) || (w.length >= 4 && r.startsWith(w)));
}

// Directorio curado de candidatos reales (datos públicos: nombre, ciudad, web,
// subsector). Ampliable — añade más filas y aparecen en el descubridor.
export const CANDIDATES = [
  // ---- Salud · clínicas dentales (Madrid) ----
  { company: "Clínica Dental Morante", sector: "health", subsector: "Implantología y estética dental", city: "Madrid", website: "https://www.dentalmorante.es/" },
  { company: "i2 Implantología", sector: "health", subsector: "Implantes carga inmediata", city: "Madrid", website: "https://i2-implantologia.com/" },
  { company: "Medina 3D", sector: "health", subsector: "Implantología y ortodoncia invisible", city: "Madrid", website: "https://medina3d.es/" },
  { company: "MAG Dental Madrid", sector: "health", subsector: "Implantología avanzada 3D", city: "Madrid", website: "https://magdentalmadrid.com/" },
  { company: "Palma Medicodental", sector: "health", subsector: "Implantología y periodoncia", city: "Madrid", website: "https://palmamedicodental.com/" },
  // ---- Salud · dental / estética (otras ciudades) ----
  { company: "Clínica Dental Ferrer", sector: "health", subsector: "Odontología integral", city: "Valencia", website: null },
  { company: "Clínica Dental Pardiñas", sector: "health", subsector: "Odontología y estética dental", city: "Madrid", website: "https://www.clinicapardinas.com/" },
  // ---- Hostelería ----
  { company: "Grupo Saona", sector: "hospitality", subsector: "Restaurantes mediterráneos (cadena)", city: "Valencia", website: "https://grupociento.com/" },
  { company: "Grupo La Máquina", sector: "hospitality", subsector: "Restaurantes tradicionales premium", city: "Madrid", website: null },
  { company: "Hotel Boutique Mihotel", sector: "hospitality", subsector: "Hoteles boutique", city: "Valencia", website: null },
  { company: "Único Hotels", sector: "hospitality", subsector: "Hoteles boutique de lujo", city: "Barcelona", website: "https://www.unicohotels.com/" },
  // ---- Inmobiliario / arquitectura ----
  { company: "Gonzalez & Jacobson Arquitectura", sector: "realestate", subsector: "Arquitectura de lujo (Costa del Sol)", city: "Marbella", website: null },
  { company: "Lucas Fox", sector: "realestate", subsector: "Inmobiliaria de lujo", city: "Barcelona", website: "https://www.lucasfox.es/" },
  // ---- Growth / marcas ----
  { company: "Singularu", sector: "growth", subsector: "Joyería DTC en expansión", city: "Valencia", website: "https://www.singularu.com/" },
  { company: "Laagam", sector: "growth", subsector: "Moda DTC tech", city: "Barcelona", website: null },
];

/**
 * Busca candidatos del directorio por sector y/o texto (nombre, ciudad,
 * subsector). Devuelve los que coinciden, marcados con `source: "directorio"`.
 */
export function searchCandidates({ sector = "all", query = "" } = {}) {
  const toks = norm(query).split(/\s+/).filter(Boolean);
  return CANDIDATES.filter((c) => {
    if (sector !== "all" && c.sector !== sector) return false;
    if (!toks.length) return true;
    const words = norm(`${c.company} ${c.city} ${c.subsector}`).split(/\s+/);
    // Cada token de la consulta debe casar (por raíz) con alguna palabra.
    return toks.every((tok) => tokenHits(tok, words));
  }).map((c) => ({ ...c, source: "directorio" }));
}

/**
 * Conector Google Places — hueco para producción. En el demo devuelve [].
 * LIVE: llamar a Places Text Search (server-side, con API key) con
 * `${query} ${city}` y mapear cada resultado a { company, city, website,
 * phone, googleMaps, sector }. El resto del flujo (añadir + puntuar) no cambia.
 */
export async function placesAdapter(/* { query, city, apiKey } */) {
  return [];
}

/**
 * Descubrimiento combinado: directorio + (si hay) Places. Async para que el
 * conictor live encaje sin cambiar la UI.
 */
export async function discover({ sector = "all", query = "", live = false } = {}) {
  const local = searchCandidates({ sector, query });
  if (!live) return local;
  let remote = [];
  try { remote = await placesAdapter({ query }); } catch { remote = []; }
  // Dedup por nombre+ciudad.
  const seen = new Set(local.map((c) => norm(`${c.company}|${c.city}`)));
  for (const r of remote) {
    const k = norm(`${r.company}|${r.city}`);
    if (!seen.has(k)) { seen.add(k); local.push({ ...r, source: "places" }); }
  }
  return local;
}
