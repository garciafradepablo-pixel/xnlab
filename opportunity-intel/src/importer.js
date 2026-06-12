// =============================================================================
// importer.js — El muelle de entrada: pega una lista externa (Apollo/Clay/
// HubSpot/CSV) y Connect la convierte en leads que el motor puntúa.
//
// PURO y testeable: solo parsea texto y mapea columnas. NO enriquece, NO llama a
// internet, NO inventa. Lo que el usuario no aporta queda vacío (→ señal gris en
// buildLead). Lo pegado por el usuario NUNCA se marca como evidencia confirmada
// externa: se trata como contexto sin verificar.
// =============================================================================

const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Campo canónico → cabeceras aceptadas (EN + ES), ya normalizadas.
const HEADER_MAP = {
  company: ["company", "name", "empresa", "nombre", "lead", "cuenta", "account", "organization", "organizacion"],
  website: ["website", "web", "url", "sitio", "site", "domain", "dominio"],
  sector: ["sector", "industry", "industria", "vertical", "rubro", "categoria", "category"],
  city: ["city", "location", "ciudad", "ubicacion", "localidad", "region", "place"],
  notes: ["notes", "note", "notas", "nota", "comment", "comentarios", "description", "descripcion", "observaciones"],
};
const CANON_FIELDS = Object.keys(HEADER_MAP);

// Mapea una cabecera suelta a su campo canónico (o null).
function fieldForHeader(h) {
  const n = norm(h);
  for (const [field, names] of Object.entries(HEADER_MAP)) if (names.includes(n)) return field;
  return null;
}

// ¿Parece una URL / dominio?
const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
function isUrl(s) { return URL_RE.test(String(s || "").trim()); }
// Normaliza a URL con protocolo (sin inventar: solo añade https si falta).
function normWebsite(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return isUrl(t) ? `https://${t}` : "";
}
/** Dominio en minúsculas, sin www ni protocolo ni ruta (para deduplicar). */
export function normDomain(s) {
  let t = String(s || "").trim().toLowerCase();
  if (!t) return "";
  t = t.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return t.split(/[/?#]/)[0];
}

// Sector del motor (best-effort por palabra clave). El texto crudo del usuario
// se conserva en subsector — no se pierde y alimenta las lentes estratégicas.
const SECTOR_GUESS = [
  ["health", /salud|clinic|cl[ií]nica|dental|m[eé]dic|estetic|fisio|hospital|farmac|odonto/],
  ["hospitality", /hotel|restaurant|restauran|hosteler|hospitality|boutique|gastro|resort|caf[eé]|bar\b|catering/],
  ["realestate", /inmobili|real estate|promotor|construc|property|arquitect|reform/],
];
function guessSector(raw) {
  const n = norm(raw);
  for (const [key, re] of SECTOR_GUESS) if (re.test(n)) return key;
  return "growth"; // por defecto, conservador
}

// Divide una línea CSV respetando comillas (sin saltos de línea embebidos).
function splitRow(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === "," || c === "\t" || c === ";") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

/**
 * Parsea texto pegado (CSV/tabulado/lista) a filas de lead. Detecta cabeceras EN/ES;
 * si no las hay, trata cada línea como dato (empresa + URL si aparece).
 * @param {string} text
 * @returns {{rows:Array, fields:{recognized:string[], missing:string[]}, total:number, hadHeader:boolean}}
 */
export function parseLeads(text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], fields: { recognized: [], missing: CANON_FIELDS.slice() }, total: 0, hadHeader: false };

  // ¿La primera línea es cabecera? Lo es si al menos una celda mapea a un campo.
  const firstCells = splitRow(lines[0]);
  const headerMap = firstCells.map(fieldForHeader);
  const hadHeader = headerMap.some(Boolean);

  const recognized = new Set();
  const rows = [];

  if (hadHeader) {
    headerMap.forEach((f) => f && recognized.add(f));
    for (let i = 1; i < lines.length; i++) {
      const cells = splitRow(lines[i]);
      const row = { company: "", website: "", sector: "", city: "", notes: "" };
      headerMap.forEach((field, idx) => { if (field && cells[idx] != null && cells[idx] !== "") row[field] = cells[idx]; });
      // La web puede venir sin cabecera reconocida pero sí como URL en alguna celda.
      if (!row.website) { const u = cells.find((c) => isUrl(c)); if (u) { row.website = u; recognized.add("website"); } }
      if (row.company || row.website) rows.push(finalizeRow(row));
    }
  } else {
    // Sin cabecera: cada línea es un lead. Empresa = primera celda no-URL; web = URL si la hay.
    recognized.add("company");
    for (const line of lines) {
      const cells = splitRow(line);
      const url = cells.find((c) => isUrl(c));
      const company = cells.find((c) => !isUrl(c)) || "";
      if (url) recognized.add("website");
      const row = { company, website: url || "", sector: "", city: "", notes: cells.filter((c) => c !== company && c !== url).join(" ") };
      if (row.company || row.website) rows.push(finalizeRow(row));
    }
  }

  const missing = CANON_FIELDS.filter((f) => !recognized.has(f));
  return { rows, fields: { recognized: [...recognized], missing }, total: rows.length, hadHeader };
}

// Sella una fila: normaliza web y marca qué campos faltan (sin inventar nada).
function finalizeRow(row) {
  const website = normWebsite(row.website);
  const filled = { company: row.company.trim(), website, sector: row.sector.trim(), city: row.city.trim(), notes: row.notes.trim() };
  const missing = CANON_FIELDS.filter((f) => !filled[f]);
  return { ...filled, _missing: missing };
}

/**
 * Convierte una fila parseada en el input de buildLead (newlead.js). Las notas
 * van a `summary` (narrativa), NO a evidencia: lo pegado por el usuario no se
 * convierte en señal confirmada. El sector crudo se conserva en subsector.
 * @param {object} row  fila de parseLeads
 * @returns {object} input para buildLead
 */
export function rowToLeadInput(row = {}) {
  return {
    company: row.company || "",
    website: row.website || null,
    sector: guessSector(row.sector),
    subsector: row.sector || "",
    city: row.city || "",
    summary: row.notes || "Lead importado — sin verificar; señales por confirmar.",
  };
}

/**
 * Detecta duplicados de cada fila contra oportunidades existentes, por dominio
 * web (fuerte) o por nombre de empresa (posible). No deduplica en silencio:
 * devuelve el veredicto por fila para que la UI avise.
 * @param {Array} rows      filas de parseLeads
 * @param {Array} existing  oportunidades existentes ({company, website})
 * @returns {Array<{dup:boolean, reason:'website'|'name'|null, against:string|null}>}
 */
export function findDuplicates(rows = [], existing = []) {
  const byDomain = new Map();
  const byName = new Map();
  for (const e of existing) {
    const d = normDomain(e.website);
    if (d) byDomain.set(d, e.company || d);
    const n = norm(e.company);
    if (n) byName.set(n, e.company || "");
  }
  return rows.map((r) => {
    const d = normDomain(r.website);
    if (d && byDomain.has(d)) return { dup: true, reason: "website", against: byDomain.get(d) };
    const n = norm(r.company);
    if (n && byName.has(n)) return { dup: true, reason: "name", against: byName.get(n) };
    return { dup: false, reason: null, against: null };
  });
}
