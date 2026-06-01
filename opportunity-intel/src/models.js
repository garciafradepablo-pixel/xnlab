// =============================================================================
// models.js — Data schema, enumerations and constants.
//
// This module is the single source of truth for the *shape* of the system:
// the ten qualification filters, the signal colour model, the evidence tiers,
// sectors, statuses and the human-readable explanations of what moves each
// score up or down.
//
// Nothing here computes a score. Computation lives in scoring.js. Keeping the
// model declarative means the scoring engine, the seed data, the UI and the
// exporters all agree on the same vocabulary.
// =============================================================================

// -----------------------------------------------------------------------------
// Signal colours
// -----------------------------------------------------------------------------
// Every filter resolves to one of four colours. The colour is a *judgement*
// about the evidence, not the evidence itself.
//
//   green  — strong, concrete evidence in favour
//   yellow — partial / circumstantial evidence
//   red    — negative evidence, or a clear missing requirement
//   grey   — insufficient data to judge (treated conservatively, never neutral)
//
// Two numeric readings exist per colour. The engine blends them 80/20 so the
// system stays conservative (80% of the weight) while still rewarding genuine
// pattern detection (20%). Grey is deliberately low under the conservative
// reading: "we don't know" defaults toward "probably not".
export const LEVELS = {
  green: { label: "Green", conservative: 1.0, aggressive: 1.0, rank: 3 },
  yellow: { label: "Yellow", conservative: 0.45, aggressive: 0.65, rank: 2 },
  grey: { label: "Grey", conservative: 0.2, aggressive: 0.5, rank: 1 },
  red: { label: "Red", conservative: 0.0, aggressive: 0.05, rank: 0 },
};

export const LEVEL_KEYS = ["green", "yellow", "grey", "red"];

// The conservative/aggressive split, as a ratio. 0.8 = 80% conservative.
export const CONSERVATIVE_BIAS = 0.8;

// -----------------------------------------------------------------------------
// Evidence tiers
// -----------------------------------------------------------------------------
// Evidence is weighted by how much it actually proves. The brief's hierarchy:
//   1 evidence  = intuition
//   2 evidences = possibility
//   3 evidences = hypothesis
//   5 evidences = strong opportunity
// We encode each *piece* of evidence with a tier (how load-bearing it is) so
// that one strong press article counts for more than three vague hunches.
export const EVIDENCE_TIERS = {
  1: "Débil / circunstancial",
  2: "Sólida / corroborante",
  3: "Fuerte / de peso",
};

// Mapea un *número* de evidencias al vocabulario de confianza.
export function evidenceVerdict(count) {
  if (count >= 5) return "oportunidad fuerte";
  if (count >= 3) return "hipótesis";
  if (count >= 2) return "posibilidad";
  if (count >= 1) return "intuición";
  return "sin evidencia";
}

// Minimum concrete evidence points required before an opportunity may enter
// the shortlist. The brief is explicit: every selected opportunity must carry
// at least three.
export const MIN_EVIDENCE_FOR_SHORTLIST = 3;

// -----------------------------------------------------------------------------
// The ten qualification filters
// -----------------------------------------------------------------------------
// Order matters: it is the order an analyst should reason in, and the order
// the UI renders. Weights sum to 1.0 and express how much each filter moves
// the Opportunity Confidence Score. "increases" / "decreases" are shown in the
// UI so no score is ever presented without an explanation.
export const FILTERS = [
  {
    key: "transitionSignal",
    label: "Señal de transición",
    weight: 0.14,
    question: "¿Está la empresa entrando en una nueva etapa?",
    increases:
      "Nueva oficina/clínica/restaurante, nueva ciudad, nueva inversión, nueva línea de negocio, rebrand reciente, contratación reciente, anuncio de expansión.",
    decreases:
      "Empresa estática, sin movimiento en 24 meses, sin anuncios, sin huella de crecimiento.",
  },
  {
    key: "economicCapacity",
    label: "Capacidad económica",
    weight: 0.13,
    question: "¿Pueden pagar 1.500–5.000 € sin sufrir?",
    increases:
      "Servicios premium, oferta de ticket alto, varias ubicaciones, equipo visible, instalaciones potentes, indicadores de inversión/facturación.",
    decreases:
      "Bajo margen, modo supervivencia, una sola ubicación pequeña, posicionamiento de descuento.",
  },
  {
    key: "visibleTension",
    label: "Tensión visible",
    weight: 0.13,
    question: "¿Desajuste entre hacia dónde van y lo que comunican?",
    increases:
      "Crecen pero web obsoleta, producto premium pero marca débil, muchas ubicaciones pero digital amateur, buenas reseñas pero posicionamiento débil.",
    decreases:
      "La marca ya está a la altura de la ambición; nada visiblemente roto o desalineado.",
  },
  {
    key: "actionableLever",
    label: "Palanca accionable",
    weight: 0.1,
    question: "¿Podemos señalar un primer movimiento claro?",
    increases:
      "Reposicionamiento evidente, landing, arquitectura web, embudo de captación, reparación SEO, sistema de marca, automatización de intake, narrativa comercial.",
    decreases:
      "Sin primer movimiento claro; el problema es difuso o fuera de nuestros servicios.",
  },
  {
    key: "activePainSignal",
    label: "Dolor activo",
    weight: 0.11,
    question: "¿Está el problema activo *ahora*?",
    increases:
      "Reseñas sobre reservas/esperas/claridad, contratación reciente de marketing/ventas, campaña de lanzamiento floja, expansión sin infraestructura, web rota, canales abandonados durante el crecimiento.",
    decreases:
      "No afloran síntomas; el dolor es hipotético o latente.",
  },
  {
    key: "whyNow",
    label: "Por qué ahora",
    weight: 0.1,
    question: "¿Por qué llamar precisamente esta semana?",
    increases:
      "Lanzamiento, apertura, expansión reciente, campaña reciente, contratación, nueva sede, artículo reciente, nuevo producto/servicio, momento público de crecimiento.",
    decreases:
      "Sin gatillo de oportunidad; la llamada podría ser en cualquier momento = nunca ocurre.",
  },
  {
    key: "reachableDecisionMaker",
    label: "Decisor alcanzable",
    weight: 0.09,
    question: "¿Podemos llegar a alguien que pueda decir que sí?",
    increases:
      "Fundador/CEO/dueño/gerente con nombre, email directo, perfil de LinkedIn, teléfono directo, DM de Instagram activo.",
    decreases:
      "Solo un formulario genérico o un info@; ninguna persona con nombre.",
  },
  {
    key: "budgetPriority",
    label: "Prioridad de presupuesto",
    weight: 0.08,
    question: "¿Suficientemente importante para mover presupuesto pronto?",
    increases:
      "Facturación / captación de pacientes / clientes / confianza / percepción premium / contratación / expansión directamente afectadas.",
    decreases:
      "La mejora es meramente estética; nada lo bastante doloroso como para financiarlo.",
  },
  {
    key: "strategicFit",
    label: "Encaje estratégico",
    weight: 0.07,
    question: "¿Es el tipo de empresa con la que deberíamos trabajar?",
    increases:
      "Sector premium o en crecimiento, caso de éxito atractivo, universo de marca limpio, negocio serio y ético, escalable.",
    decreases:
      "Dañaría el posicionamiento, ético dudoso, sin recorrido de caso — aunque puedan pagar.",
  },
  {
    key: "brutalFinalFilter",
    label: "Filtro final brutal",
    weight: 0.05,
    question: "Si solo pudiéramos llamar a 3 empresas mañana, ¿sigue dentro?",
    increases: "Sobrevive al corte frente a todo lo demás de la lista.",
    decreases: "Se caería en cuanto aparezca un lead más fuerte.",
  },
];

export const FILTER_KEYS = FILTERS.map((f) => f.key);
export const FILTER_BY_KEY = Object.fromEntries(FILTERS.map((f) => [f.key, f]));

// -----------------------------------------------------------------------------
// Score explainers — shown in the UI so a score is never naked.
// -----------------------------------------------------------------------------
export const SCORE_EXPLAINERS = {
  confidence: {
    label: "Confianza de oportunidad",
    up: "Más filtros verdes, sobre todo los de más peso (transición, capacidad económica, tensión).",
    down: "Filtros rojos o grises; cualquier bandera roja limita el techo. El gris se trata como 'probablemente no'.",
  },
  evidence: {
    label: "Fuerza de evidencia",
    up: "Más evidencia concreta y de peso (nivel 3) repartida entre varios filtros.",
    down: "Pocas evidencias, fuentes débiles, o evidencia concentrada en un solo filtro.",
  },
  conversation: {
    label: "Prob. de conversación",
    up: "Un decisor con nombre y alcanzable + dolor activo + un gatillo real de oportunidad.",
    down: "Solo formulario genérico, sin dolor real, sin motivo esta semana. Amortiguada por la confianza global.",
  },
  meeting: {
    label: "Prob. de reunión",
    up: "Tensión visible + prioridad de presupuesto + una primera palanca clara para anclar la reunión.",
    down: "Siempre ≤ conversación. Baja si la tensión es débil o la prioridad de presupuesto es baja.",
  },
  closing: {
    label: "Potencial de cierre",
    up: "Capacidad económica + prioridad de presupuesto + encaje estratégico + tensión, todo alineado.",
    down: "Capacidad floja, dolor solo estético o encaje débil. Las banderas rojas lo hunden.",
  },
};

// -----------------------------------------------------------------------------
// Sectors (initial target pool) and statuses
// -----------------------------------------------------------------------------
export const SECTORS = [
  { key: "health", label: "Salud y Clínicas" },
  { key: "realestate", label: "Inmobiliario y Construcción" },
  { key: "growth", label: "Crecimiento / Financiadas / Expansión" },
  { key: "hospitality", label: "Hostelería Premium" },
];
export const SECTOR_BY_KEY = Object.fromEntries(SECTORS.map((s) => [s.key, s]));

// Clase = ALCANCE del primer movimiento, no "casa". Los leads no pertenecen a
// ninguna marca: son oportunidades. "Ágil" = entrada acotada; "Profunda" =
// transformación de fondo. (Las claves 01/xn son plumbing interno del motor.)
export const CLASSIFICATIONS = {
  "01": "Ágil",
  xn: "Profunda",
  unqualified: "Por evaluar",
  discard: "No merece llamada",
};

export const ECONOMIC_POTENTIAL = ["low", "medium", "high", "very high"];

// Etiquetas mostradas para el potencial económico.
export const ECONOMIC_LABELS = {
  low: "bajo",
  medium: "medio",
  high: "alto",
  "very high": "muy alto",
};

export const RECOMMENDATIONS = {
  call_immediately: "Llamar de inmediato",
  prepare_audit: "Preparar mini-auditoría primero",
  secondary: "Mantener como secundario",
  enrich: "Enriquecer antes de llamar",
  discard: "Descartar",
};

export const CALL_STATUSES = [
  "not_called",
  "called",
  "no_answer",
  "interested",
  "meeting_booked",
  "proposal_sent",
  "won",
  "rejected",
  "follow_up",
  "wrong_fit",
];

export const STATUS_LABELS = {
  not_called: "Sin llamar",
  called: "Llamado",
  no_answer: "No contesta",
  interested: "Interesado",
  meeting_booked: "Reunión agendada",
  proposal_sent: "Propuesta enviada",
  won: "Firmado",
  rejected: "Rechazado",
  follow_up: "Requiere seguimiento",
  wrong_fit: "Mal encaje",
};

// Tipos de tensión canónicos.
export const TENSION_TYPES = {
  growth_structure: "Crecimiento vs estructura",
  quality_perception: "Calidad vs percepción",
  expansion_systems: "Expansión vs sistemas",
  price_communication: "Precio premium vs comunicación",
  visibility_conversion: "Visibilidad vs conversión",
  ambition_maturity: "Ambición vs madurez de marca",
};

// Suggested offer ladder. NOTE: this is an INTERNAL sales tool — prices are
// intentional here. (The public XNLAB brand site forbids published pricing;
// that rule governs public surfaces, not this internal instrument.)
// owner: alcance interno del motor ("01" = entrada ágil, "xn" = transformación
// profunda). NO es marca: el lead no pertenece a ninguna casa.
export const OFFER_LADDER = {
  audit: { label: "Auditoría de marca y web", price: 1500, owner: "01" },
  reposition: { label: "Reposicionamiento + Landing", price: 3000, owner: "01" },
  web_funnel: { label: "Web + Funnel + Automatización", price: 5000, owner: "01" },
  xn_transformation: { label: "Transformación estratégica", price: 8000, owner: "xn" },
};

// Pipeline stages, in order.
export const PIPELINE_STAGES = [
  { key: "discovered", label: "Descubierto" },
  { key: "enriched", label: "Enriquecido" },
  { key: "filtered", label: "Filtrado" },
  { key: "scored", label: "Puntuado" },
  { key: "shortlisted", label: "Preseleccionado" },
  { key: "final", label: "Top final" },
];

// Default search configuration.
export const DEFAULT_CONFIG = {
  country: "Spain",
  sectors: SECTORS.map((s) => s.key),
  candidateVolume: 1000,
  finalCount: 20,
  conservatism: 0.8, // 0 = aggressive, 1 = maximally conservative
  minScore: 45,
  xnThreshold: 68, // confianza a partir de la cual un lead de alta economía pasa a alcance "profundo"
};
