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

/** Connection semantics — each carries a meaning and a colour. */
export const THREAD_TYPES = [
  "information", // blue
  "capital", // green
  "creativity", // purple
  "control", // gold
  "critical", // red — critical dependency
  "open", // white — open relationship
] as const;
export type ThreadType = (typeof THREAD_TYPES)[number];

export const THREAD_COLORS: Record<ThreadType, string> = {
  information: "#4ea6ff",
  capital: "#3ddc84",
  creativity: "#b06cff",
  control: "#ffcf5c",
  critical: "#ff5470",
  open: "#f2f2ff",
};

export const THREAD_LABELS: Record<ThreadType, { en: string; es: string }> = {
  information: { en: "Information", es: "Información" },
  capital: { en: "Capital", es: "Capital" },
  creativity: { en: "Creativity", es: "Creatividad" },
  control: { en: "Control", es: "Control" },
  critical: { en: "Critical dependency", es: "Dependencia crítica" },
  open: { en: "Open relationship", es: "Relación abierta" },
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
