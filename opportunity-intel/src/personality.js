// =============================================================================
// personality.js — La "personalidad" de una empresa, de un vistazo.
//
// A cada empresa le asigna un ANIMAL (emoji + nombre), un ELEMENTO/material, un
// AURA y un SÍMBOLO que la definen, más PALABRAS CLAVE para encarar la llamada
// (ángulos adaptables, no un guión: el vendedor improvisa sobre ellos).
//
// Puro y DETERMINISTA: la misma empresa da siempre la misma personalidad (se
// elige del pool por un hash estable del nombre, no al azar), así Dani la
// reconoce. Import-safe en Node: nada de DOM, red ni estado global.
//
// El aura sale del encaje (confidence 0-100) y sus bandas coinciden con los
// umbrales del negocio: ≥80 magnética · 60-79 firme · <60 latente.
// =============================================================================

// Hash estable texto → entero ≥0. Determinista (misma empresa, mismo animal).
function stableHash(s) {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Arquetipos por sector. Cada animal: emoji, nombre, su símbolo y un rasgo de
// venta. `element` es el material/elemento que acompaña al sector; `angles` son
// ángulos de venta base (palabras clave, no frases hechas).
const ARCHETYPES = {
  hospitality: {
    label: "Hostelería", element: "Fuego y luz", elementEmoji: "🔥", auraHue: "#f0883e",
    angles: ["primera impresión", "experiencia en sala", "marca que se recuerda", "reseña y boca a boca"],
    animals: [
      { emoji: "🦚", name: "Pavo real", symbol: "El espectáculo", trait: "vive de la primera impresión" },
      { emoji: "🦢", name: "Cisne", symbol: "La elegancia", trait: "calma que se recuerda" },
      { emoji: "🦉", name: "Búho", symbol: "La noche", trait: "dueño de las horas que importan" },
      { emoji: "🐅", name: "Tigre", symbol: "La intensidad", trait: "presencia que llena la sala" },
    ],
  },
  health: {
    label: "Salud y clínicas", element: "Agua y cristal", elementEmoji: "💧", auraHue: "#2dd4bf",
    angles: ["confianza", "resultado clínico", "claridad sin tecnicismos", "captación de paciente"],
    animals: [
      { emoji: "🦌", name: "Ciervo", symbol: "El cuidado", trait: "confianza que se gana despacio" },
      { emoji: "🐬", name: "Delfín", symbol: "La inteligencia", trait: "precisión que tranquiliza" },
      { emoji: "🦢", name: "Cisne", symbol: "La pureza", trait: "lo limpio como promesa" },
      { emoji: "🦉", name: "Búho", symbol: "El criterio", trait: "decisiones que no se improvisan" },
    ],
  },
  realestate: {
    label: "Inmobiliario", element: "Piedra y tierra", elementEmoji: "🪨", auraHue: "#c9a227",
    angles: ["estatus", "valor percibido", "decisión de alto ticket", "internacional"],
    animals: [
      { emoji: "🦅", name: "Águila", symbol: "La visión", trait: "ve el valor desde la altura" },
      { emoji: "🦁", name: "León", symbol: "El estatus", trait: "territorio y prestigio" },
      { emoji: "🐘", name: "Elefante", symbol: "La solidez", trait: "lo que no se mueve, se confía" },
      { emoji: "🐎", name: "Caballo", symbol: "El movimiento", trait: "oportunidad que no espera" },
    ],
  },
  growth: {
    label: "Crecimiento", element: "Rayo y metal", elementEmoji: "⚡", auraHue: "#8b7bd8",
    angles: ["velocidad", "escala", "tracción", "ronda y expansión"],
    animals: [
      { emoji: "🐆", name: "Guepardo", symbol: "La velocidad", trait: "escala antes que nadie" },
      { emoji: "🐺", name: "Lobo", symbol: "La manada", trait: "crece en equipo y en red" },
      { emoji: "🦅", name: "Halcón", symbol: "La puntería", trait: "foco quirúrgico en el objetivo" },
      { emoji: "🦈", name: "Tiburón", symbol: "El avance", trait: "no para de moverse" },
    ],
  },
};

const FALLBACK = {
  label: "General", element: "Aire", elementEmoji: "🌫️", auraHue: "#4a9eff",
  angles: ["momento", "marca", "presencia digital"],
  animals: [{ emoji: "🦋", name: "Mariposa", symbol: "El cambio", trait: "marca en formación" }],
};

// Aura por banda de encaje. Las bandas reflejan los umbrales del negocio.
function auraFor(score) {
  const s = Number(score) || 0;
  if (s >= 80) return { label: "Magnética", note: "encaja de lleno — entra con seguridad", tone: "hot" };
  if (s >= 60) return { label: "Firme", note: "encaje real — hay con qué trabajar", tone: "warm" };
  return { label: "Latente", note: "potencial por confirmar", tone: "cool" };
}

// Desvía la elección dentro del pool según señales del subsector (lujo, tech,
// expansión…), para que se note que la empresa concreta se ha "analizado".
function subsectorBump(subsector) {
  const t = String(subsector || "").toLowerCase();
  let bump = 0;
  if (/lujo|luxury|premium|insignia|boutique/.test(t)) bump += 1;
  if (/tech|foodtech|healthtech|dtc|digital/.test(t)) bump += 2;
  if (/expansi|cadena|grupo|scale|funded|financiad/.test(t)) bump += 3;
  return bump;
}

// Palabras clave para encarar la llamada: ángulos adaptables, NO un guión.
// Mezcla el subsector real, el símbolo del animal y los ángulos del sector.
function callKeywords(o, arch, animal) {
  const out = [];
  const sub = String(o?.subsector || "").trim();
  if (sub) out.push(sub);
  out.push(animal.symbol.replace(/^(El|La|Lo)\s+/i, "").toLowerCase());
  for (const a of arch.angles) out.push(a);
  // Únicas, sin vacíos, tope 6 — esquema, no parrafada.
  return [...new Set(out.filter(Boolean))].slice(0, 6);
}

/**
 * Personalidad de una empresa (lead). Determinista.
 * @param {{company?:string, sector?:string, subsector?:string, scores?:{confidence?:number}, score?:number}} o
 * @returns {{animal:{emoji,name,symbol,trait}, element:string, elementEmoji:string, auraHue:string, aura:{label,note,tone}, sectorLabel:string, keywords:string[]}}
 */
export function personality(o = {}) {
  const arch = ARCHETYPES[o.sector] || FALLBACK;
  const pool = arch.animals;
  const idx = (stableHash(o.company) + subsectorBump(o.subsector)) % pool.length;
  const animal = pool[idx];
  const score = o?.scores?.confidence ?? o?.score ?? 0;
  return {
    animal,
    element: arch.element,
    elementEmoji: arch.elementEmoji,
    auraHue: arch.auraHue,
    aura: auraFor(score),
    sectorLabel: arch.label,
    keywords: callKeywords(o, arch, animal),
  };
}

// Solo el emoji del animal (para insignias compactas en las tarjetas).
export function animalEmoji(o = {}) {
  return personality(o).animal.emoji;
}
