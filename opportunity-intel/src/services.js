// =============================================================================
// services.js — Catálogo de servicios (XNLAB + 01 Agency) y MOTOR DE ENCAJE.
//
// Responde a la pregunta comercial central: "¿qué le ofrecemos a ESTA empresa?"
//
// Cada servicio declara:
//   - de qué casa es (xn = xnlab.io, "01" = 01digitalagency.com)
//   - qué SEÑALES (de los 10 filtros) y TENSIONES activan su necesidad
//   - el problema que resuelve y el resultado que produce (lenguaje de venta)
//   - su rango de ticket (interno)
//
// matchServices(opp) lee las señales débiles + tensiones de una oportunidad y
// devuelve los servicios que encajan, ordenados por relevancia, con el MOTIVO
// de por qué encaja cada uno. Es la base del "camino recomendado".
//
// Fuentes de la oferta:
//   XNLAB → las seis superficies de xnlab.io (app/_lib/worlds.ts), capa premium.
//   01    → servicios de 01digitalagency.com + brief 01 (web, SEO, branding,
//           redes, automatización, ecommerce, auditoría, captación).
// =============================================================================

// Niveles que cuentan como "débil/ausente" en un filtro = hay necesidad.
const WEAK = new Set(["yellow", "grey", "red"]);

function levelOf(opp, key) {
  return opp?.signals?.[key]?.level || "grey";
}
function hasTension(opp, t) {
  return (opp?.tensions || []).includes(t);
}

// -----------------------------------------------------------------------------
// CATÁLOGO. `triggers`: filtros cuya debilidad sugiere el servicio.
// `tensions`: tensiones que lo refuerzan. `weight`: prioridad base.
// -----------------------------------------------------------------------------
export const SERVICES = [
  // ---- 01 Agency (ticket 1.500–5.000 €) -----------------------------------
  {
    id: "01-auditoria",
    house: "01",
    name: "Auditoría de marca y web",
    ticket: [1500, 1500],
    solves: "No sabemos dónde se pierde negocio entre la web, la marca y la captación.",
    produces: "Un diagnóstico claro con las 3 fugas prioritarias y un plan de acción.",
    triggers: ["actionableLever", "visibleTension"],
    tensions: [],
    weight: 0.6,
  },
  {
    id: "01-seo",
    house: "01",
    name: "Reparación SEO + visibilidad local",
    ticket: [1500, 3000],
    solves: "La empresa no aparece cuando su cliente la busca (sobre todo en local).",
    produces: "Posicionamiento en las búsquedas que traen clientes de pago.",
    triggers: ["activePainSignal", "visibleTension"],
    tensions: ["visibility_conversion"],
    weight: 0.7,
  },
  {
    id: "01-landing",
    house: "01",
    name: "Reposicionamiento + landing de conversión",
    ticket: [3000, 3000],
    solves: "Hay tráfico/interés pero la web no convierte ni transmite el nivel real.",
    produces: "Una página que captura el lead y sube la percepción de precio.",
    triggers: ["visibleTension", "actionableLever", "budgetPriority"],
    tensions: ["quality_perception", "price_communication", "visibility_conversion"],
    weight: 0.85,
  },
  {
    id: "01-funnel",
    house: "01",
    name: "Web + embudo + automatización (intake/CRM)",
    ticket: [5000, 5000],
    solves: "La captación es manual o se cae; las consultas se pierden o tardan.",
    produces: "Un sistema que capta, cualifica y enruta cada lead sin esfuerzo.",
    triggers: ["activePainSignal", "actionableLever", "reachableDecisionMaker"],
    tensions: ["growth_structure", "expansion_systems", "visibility_conversion"],
    weight: 0.9,
  },
  {
    id: "01-redes",
    house: "01",
    name: "Sistema de contenido + redes",
    ticket: [1500, 3000],
    solves: "Canales abandonados o sin ritmo durante una fase de crecimiento.",
    produces: "Una pauta de publicación y contenido que sostiene la captación.",
    triggers: ["activePainSignal", "transitionSignal"],
    tensions: ["growth_structure", "ambition_maturity"],
    weight: 0.6,
  },
  {
    id: "01-ecommerce",
    house: "01",
    name: "Ecommerce / venta online",
    ticket: [3000, 5000],
    solves: "Hay producto vendible online pero no canal (o uno que no convierte).",
    produces: "Una tienda que abre una línea de ingresos de alto margen.",
    triggers: ["actionableLever", "economicCapacity"],
    tensions: ["growth_structure", "visibility_conversion"],
    weight: 0.55,
  },

  // ---- XN LAB (ticket 8.000 €+, transformación) ----------------------------
  {
    id: "xn-producto",
    house: "xn",
    name: "Sistema de marca para producto y experiencia",
    ticket: [8000, 8000],
    solves: "El producto/experiencia premium no tiene un sistema de marca coherente.",
    produces: "Voz, identidad y micro-experiencia consistentes en cada punto.",
    triggers: ["economicCapacity", "strategicFit"],
    tensions: ["quality_perception", "ambition_maturity"],
    weight: 0.7,
  },
  {
    id: "xn-digital",
    house: "xn",
    name: "Dirección de digital propio (web + contenido editorial)",
    ticket: [8000, 8000],
    solves: "El digital propio no está a la altura de la ambición de la marca.",
    produces: "Una superficie digital con dirección editorial y atmósfera propia.",
    triggers: ["visibleTension", "economicCapacity"],
    tensions: ["ambition_maturity", "quality_perception", "visibility_conversion"],
    weight: 0.8,
  },
  {
    id: "xn-retail",
    house: "xn",
    name: "Atmósfera de espacio físico / flagship",
    ticket: [8000, 8000],
    solves: "El espacio físico premium no comunica lo que el negocio vale.",
    produces: "Umbral, luz, material y servicio diseñados como una sola pieza.",
    triggers: ["economicCapacity"],
    tensions: ["quality_perception", "expansion_systems"],
    weight: 0.6,
  },
  {
    id: "xn-operaciones",
    house: "xn",
    name: "Diseño de operación de cliente (onboarding + postventa)",
    ticket: [8000, 8000],
    solves: "La experiencia de cliente se rompe en el onboarding o la postventa.",
    produces: "Secuencias de cliente diseñadas como una experiencia editorial.",
    triggers: ["activePainSignal", "actionableLever"],
    tensions: ["growth_structure", "expansion_systems"],
    weight: 0.6,
  },
  {
    id: "xn-comunicacion",
    house: "xn",
    name: "Dirección de comunicación y campaña",
    ticket: [8000, 8000],
    solves: "El momento (lanzamiento/prensa) no se convierte en posicionamiento.",
    produces: "Dirección editorial de campaña en canales pagados, propios y ganados.",
    triggers: ["whyNow", "transitionSignal"],
    tensions: ["ambition_maturity", "visibility_conversion"],
    weight: 0.7,
  },
  {
    id: "xn-transformacion",
    house: "xn",
    name: "Transformación estratégica de marca (integral)",
    ticket: [8000, 20000],
    solves: "La empresa entra en una fase nueva sin fundamento de marca que la sostenga.",
    produces: "Un sistema de marca completo sobre el que ejecutar todo lo demás.",
    triggers: ["transitionSignal", "economicCapacity", "strategicFit"],
    tensions: ["ambition_maturity", "growth_structure", "expansion_systems"],
    weight: 0.95,
  },
];

export const SERVICE_BY_ID = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

const FILTER_NEED_LABEL = {
  transitionSignal: "está en transición",
  economicCapacity: "tiene capacidad para invertir",
  visibleTension: "su comunicación no está a la altura",
  actionableLever: "hay una palanca clara que tocar",
  activePainSignal: "tiene un dolor activo ahora",
  whyNow: "el momento es ahora",
  reachableDecisionMaker: "hay decisor alcanzable",
  budgetPriority: "el problema afecta a ingresos",
};

/**
 * Devuelve los servicios que encajan con una oportunidad, ordenados por
 * relevancia, con el motivo de cada encaje.
 *
 * Lógica: un servicio puntúa si la empresa tiene la NECESIDAD que resuelve.
 * La necesidad se detecta por dos vías:
 *   - señales DÉBILES en sus filtros disparadores (algo que arreglar), o
 *     señales FUERTES cuando el disparador es de capacidad/encaje (algo que
 *     habilita la venta, p.ej. economicCapacity verde = puede pagar XN).
 *   - tensiones detectadas que el servicio resuelve.
 *
 * @param {object} opp
 * @param {object} [opts] { max=4, preferHouse }  preferHouse: "01"|"xn" sesga.
 * @returns {Array<{ id, name, house, ticket, solves, produces, score, reasons }>}
 */
export function matchServices(opp, opts = {}) {
  const max = opts.max ?? 4;
  const cls = opp?.scores?.classification; // "01" | "xn" | "discard"
  const out = [];

  for (const svc of SERVICES) {
    let score = 0;
    const reasons = [];

    for (const key of svc.triggers) {
      const lvl = levelOf(opp, key);
      // Capacidad/encaje cuentan cuando son FUERTES (habilitan la venta).
      const isEnabler = key === "economicCapacity" || key === "strategicFit" || key === "reachableDecisionMaker";
      if (isEnabler) {
        if (lvl === "green") { score += 0.5; reasons.push(FILTER_NEED_LABEL[key]); }
        else if (lvl === "yellow") score += 0.2;
      } else {
        // El resto cuentan cuando son DÉBILES (hay algo que arreglar).
        if (WEAK.has(lvl)) { score += lvl === "red" ? 0.6 : lvl === "grey" ? 0.45 : 0.5; reasons.push(FILTER_NEED_LABEL[key]); }
      }
    }
    for (const t of svc.tensions) {
      if (hasTension(opp, t)) { score += 0.5; reasons.push(`tensión: ${t.replace(/_/g, " ")}`); }
    }
    if (score <= 0) continue;

    // Sesgo por casa: alinea la oferta con la clasificación 01/XN del lead.
    score *= svc.weight;
    if (cls && svc.house === cls) score *= 1.35;
    else if (cls && cls !== "discard" && svc.house !== cls) score *= 0.7;
    if (opts.preferHouse && svc.house === opts.preferHouse) score *= 1.2;

    out.push({
      id: svc.id, name: svc.name, house: svc.house, ticket: svc.ticket,
      solves: svc.solves, produces: svc.produces,
      score: Math.round(score * 100) / 100,
      // motivos únicos, legibles
      reasons: [...new Set(reasons)].slice(0, 3),
    });
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, max);
}

/** Formatea el rango de ticket en euros. */
export function ticketLabel(svc) {
  const [lo, hi] = svc.ticket || [];
  if (lo == null) return "";
  const f = (n) => `${n.toLocaleString("es-ES")} €`;
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}
