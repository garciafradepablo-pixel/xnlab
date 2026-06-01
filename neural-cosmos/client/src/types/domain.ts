/**
 * Neural Cosmos — domain model.
 *
 * This is the contract shared by all three layers (store, scene, UI). Keep it
 * pure data: no three.js types, no React types, no DOM. The scene derives
 * geometry from this; the UI derives panels from this; the store owns it.
 */

/** Cosmic life-cycle. Order matters — advance/retreat walk this array. */
export const STAGES = [
  "nebula", // idea — diffuse particle cloud, no defined core
  "protostar", // validation — core forming, unstable glow
  "star", // active system — solid bright core
  "system", // produces subentities — star with orbiting bodies
  "constellation", // several entities joined by light
  "galaxy", // large ecosystem — arms + particle storm
] as const;
export type Stage = (typeof STAGES)[number];

/**
 * Terminal / special states that sit outside the linear stage walk.
 * `absorbed` = merged into a container; `blackhole` = archived/transformed.
 * Rebirth takes a blackhole back to `nebula`.
 */
export type SpecialState = "absorbed" | "blackhole";

/** The full set of life-cycle states an entity can hold. */
export type LifeState = Stage | SpecialState;

export const LIFE_STATES: readonly LifeState[] = [
  ...STAGES,
  "absorbed",
  "blackhole",
];

/**
 * Connection semantics — "Tipos de conexión" from the design. Each carries a
 * meaning and a colour. Order matches the legend in the reference.
 */
export const THREAD_TYPES = [
  "activation", // flujo de activación
  "data", // flujo de datos
  "capital", // flujo de capital
  "creative", // necesidad creativa
  "commercial", // flujo comercial
  "intelligence", // flujo de inteligencia
  "derivation", // derivación de producto
  "absorption", // absorción
  "dependency", // dependencia
  "feedback", // bucle de retroalimentación
] as const;
export type ThreadType = (typeof THREAD_TYPES)[number];

export const THREAD_COLORS: Record<ThreadType, string> = {
  activation: "#2fe6e6",
  data: "#4ea6ff",
  capital: "#ffd23f",
  creative: "#ff5470",
  commercial: "#ff8a3c",
  intelligence: "#3ddc84",
  derivation: "#c9a24a",
  absorption: "#ff6a1f",
  dependency: "#b06cff",
  feedback: "#8a6cff",
};

export const THREAD_LABELS: Record<ThreadType, { en: string; es: string }> = {
  activation: { en: "Activation flow", es: "Flujo de activación" },
  data: { en: "Data flow", es: "Flujo de datos" },
  capital: { en: "Capital flow", es: "Flujo de capital" },
  creative: { en: "Creative need", es: "Necesidad creativa" },
  commercial: { en: "Commercial flow", es: "Flujo comercial" },
  intelligence: { en: "Intelligence flow", es: "Flujo de inteligencia" },
  derivation: { en: "Product derivation", es: "Derivación de producto" },
  absorption: { en: "Absorption", es: "Absorción" },
  dependency: { en: "Dependency", es: "Dependencia" },
  feedback: { en: "Feedback loop", es: "Bucle de retroalimentación" },
};

/**
 * An archetype is energy, not a logo. The animal only *insinuates* itself as
 * cosmic fog / particle storms when you zoom close.
 */
export type AnimalArchetype =
  | "bull"
  | "lion"
  | "wolf"
  | "eagle"
  | "none";

export interface Archetype {
  animal: AnimalArchetype;
  /** Signature hex colour of the body's glow and nebula. */
  color: string;
  /** Free-text energy signature, e.g. "cosmic storms", "stellar dust". */
  energy: string;
}

/**
 * Business status — "Leyenda de estados" from the design. Distinct from the
 * cosmic `state` (which drives the 3D form): this is the operational status
 * shown as a badge / dot.
 */
export const ENTITY_STATUSES = [
  "idea",
  "uncreated",
  "design",
  "development",
  "active",
  "testing",
  "blocked",
  "archived",
  "absorbed",
] as const;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const STATUS_META: Record<
  EntityStatus,
  { en: string; es: string; color: string }
> = {
  idea: { en: "Idea", es: "Idea", color: "#7e8bbd" },
  uncreated: { en: "Not created", es: "No creado", color: "#4a4f6e" },
  design: { en: "In design", es: "En diseño", color: "#8a6cff" },
  development: { en: "In development", es: "En desarrollo", color: "#b06cff" },
  active: { en: "Active", es: "Activo", color: "#3ddc84" },
  testing: { en: "In testing", es: "En pruebas", color: "#ffd23f" },
  blocked: { en: "Blocked", es: "Bloqueado", color: "#ff5470" },
  archived: { en: "Archived", es: "Archivado", color: "#ff8a3c" },
  absorbed: { en: "Absorbed", es: "Absorbido", color: "#6a5a8a" },
};

export type Grade = "low" | "medium" | "high" | "very-high";

export const GRADE_LABELS: Record<Grade, { en: string; es: string }> = {
  low: { en: "Low", es: "Bajo" },
  medium: { en: "Medium", es: "Medio" },
  high: { en: "High", es: "Alto" },
  "very-high": { en: "Very high", es: "Muy alto" },
};

/**
 * Operational metadata mirroring the inspector in the design: description,
 * function/purpose, tags, status, priority/potential/risk, author, and the
 * optional archetype image + symbol ("Cambiar imagen" / "Símbolo").
 */
export interface EntityMeta {
  status: EntityStatus;
  role: string; // short subtitle under the name, e.g. "Creatividad"
  description: string;
  purpose: string; // "Función"
  tags: string[];
  priority: Grade;
  potential: Grade;
  risk: Grade;
  createdBy: string;
  imageUrl?: string;
  symbol?: string;
}

export function emptyMeta(): EntityMeta {
  return {
    status: "idea",
    role: "",
    description: "",
    purpose: "",
    tags: [],
    priority: "medium",
    potential: "medium",
    risk: "medium",
    createdBy: "",
  };
}

/** Kinds of celestial entity the cosmos can hold. */
export type EntityKind =
  | "company"
  | "product"
  | "connector"
  | "service"
  | "flow"
  | "intelligence"
  | "financial"
  | "opportunity"
  | "solution"
  | "tool";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** A stored document attached to an entity. */
export interface EntityDoc {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

/** A recorded decision — part of the entity's strategic memory. */
export interface EntityDecision {
  id: string;
  title: string;
  rationale: string;
  createdAt: string;
}

/** An immutable history event for an entity (stage changes, absorptions…). */
export interface HistoryEvent {
  id: string;
  kind: "created" | "stage" | "absorbed" | "rebirth" | "moved" | "note";
  message: string;
  createdAt: string;
}

/** A celestial entity — a discovered need turned into an operative solution. */
export interface Entity {
  id: string;
  universeId: string;
  name: string;
  kind: EntityKind;
  state: LifeState;
  archetype: Archetype;
  position: Vec3;
  /** Manual size hint (0 = derive from expansion capacity). */
  sizeHint?: number;
  parentEntityId?: string | null;
  /** Recursive: an entity can contain its own inner cosmos. */
  childUniverseId?: string | null;
  /** Atlas regions / structural tag, e.g. "success" | "parity" | "failure". */
  region?: string | null;
  notes?: string;
  /** Operational metadata (status, function, tags, priority…). */
  meta: EntityMeta;
  docs: EntityDoc[];
  decisions: EntityDecision[];
  history: HistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

/** A neural thread (connection) between two entities. */
export interface Thread {
  id: string;
  universeId: string;
  fromId: string;
  toId: string;
  type: ThreadType;
  /** Slight 3D wobble seed so each thread waves differently. */
  seed: number;
  label?: string;
}

/** A universe (cosmos). Universes nest via Entity.childUniverseId. */
export interface Universe {
  id: string;
  ownerId: string;
  name: string;
  /** The entity this universe lives inside, if it is a child cosmos. */
  parentEntityId?: string | null;
  /** Optimistic-concurrency version, bumped on every server write. */
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** A universe plus its contents — the load/save payload. */
export interface UniverseSnapshot {
  universe: Universe;
  entities: Entity[];
  threads: Thread[];
}

// ── Atlas — intelligence force (Phase 9) ──────────────────────────────────

export const ATLAS_KINDS = [
  "hypothesis",
  "alert",
  "opportunity",
  "premortem",
  "recommendation",
] as const;
export type AtlasKind = (typeof ATLAS_KINDS)[number];

export type AtlasTier = "superior" | "parity" | "inferior";
export type AtlasRegion = "success" | "parity" | "failure" | "blackhole";

export interface AtlasAnalysis {
  id: string;
  universeId: string;
  kind: AtlasKind;
  region: AtlasRegion;
  tier: AtlasTier;
  subject: string;
  title: string;
  body: string;
  status: "open" | "acted" | "dismissed";
  source: "model" | "manual" | "heuristic";
  createdAt: string;
}

export const ATLAS_KIND_LABELS: Record<AtlasKind, { en: string; es: string }> = {
  hypothesis: { en: "Hypothesis", es: "Hipótesis" },
  alert: { en: "Alert", es: "Alerta" },
  opportunity: { en: "Opportunity", es: "Oportunidad" },
  premortem: { en: "Premortem", es: "Premortem" },
  recommendation: { en: "Recommendation", es: "Recomendación" },
};

export const ATLAS_REGION_LABELS: Record<
  AtlasRegion,
  { en: string; es: string; color: string }
> = {
  success: { en: "Success", es: "Éxito", color: "#3ddc84" },
  parity: { en: "Parity", es: "Paridad", color: "#9aa0c8" },
  failure: { en: "Failure", es: "Fallo", color: "#ff5470" },
  blackhole: { en: "Black hole", es: "Agujero negro", color: "#b06cff" },
};

export const ATLAS_TIER_LABELS: Record<AtlasTier, { en: string; es: string }> = {
  superior: { en: "Superior", es: "Superior" },
  parity: { en: "Parity", es: "Igual" },
  inferior: { en: "Inferior", es: "Inferior" },
};

// ── derived helpers (pure) ────────────────────────────────────────────────

/** Stage index, or -1 for special states. */
export function stageIndex(state: LifeState): number {
  return (STAGES as readonly string[]).indexOf(state);
}

/** Human label per state. */
export const STATE_LABELS: Record<LifeState, { en: string; es: string }> = {
  nebula: { en: "Nebula", es: "Nebulosa" },
  protostar: { en: "Protostar", es: "Protoestrella" },
  star: { en: "Star", es: "Estrella" },
  system: { en: "System", es: "Sistema" },
  constellation: { en: "Constellation", es: "Constelación" },
  galaxy: { en: "Galaxy", es: "Galaxia" },
  absorbed: { en: "Absorbed", es: "Absorbida" },
  blackhole: { en: "Black hole", es: "Agujero negro" },
};

export const KIND_LABELS: Record<EntityKind, { en: string; es: string }> = {
  company: { en: "Company", es: "Empresa" },
  product: { en: "Product", es: "Producto" },
  connector: { en: "Connector", es: "Conector" },
  service: { en: "Service", es: "Servicio" },
  flow: { en: "Flow", es: "Flujo" },
  intelligence: { en: "Intelligence", es: "Inteligencia" },
  financial: { en: "Financial", es: "Sistema financiero" },
  opportunity: { en: "Opportunity", es: "Oportunidad" },
  solution: { en: "Solution", es: "Solución" },
  tool: { en: "Tool", es: "Herramienta" },
};
