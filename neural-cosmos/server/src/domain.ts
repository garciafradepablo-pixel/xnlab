/** Server-side mirror of the wire shapes (kept in sync with client/types). */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Archetype {
  animal: string;
  color: string;
  energy: string;
}

export interface EntityDoc {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
export interface EntityDecision {
  id: string;
  title: string;
  rationale: string;
  createdAt: string;
}
export interface HistoryEvent {
  id: string;
  kind: string;
  message: string;
  createdAt: string;
}

/** Operational metadata (mirrors client EntityMeta). */
export interface EntityMeta {
  status: string;
  role: string;
  description: string;
  purpose: string;
  tags: string[];
  priority: string;
  potential: string;
  risk: string;
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

export interface Entity {
  id: string;
  universeId: string;
  name: string;
  kind: string;
  state: string;
  archetype: Archetype;
  position: Vec3;
  sizeHint?: number | null;
  parentEntityId?: string | null;
  childUniverseId?: string | null;
  region?: string | null;
  notes?: string;
  meta: EntityMeta;
  docs: EntityDoc[];
  decisions: EntityDecision[];
  history: HistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  universeId: string;
  fromId: string;
  toId: string;
  type: string;
  seed: number;
  label?: string;
}

export interface Universe {
  id: string;
  ownerId: string;
  name: string;
  parentEntityId?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UniverseSnapshot {
  universe: Universe;
  entities: Entity[];
  threads: Thread[];
}

/**
 * Atlas — intelligence force. It studies superior / parity / inferior companies
 * and produces these. Generation is pluggable (see atlas/provider): a heuristic
 * stub ships now; a real model can replace it later without touching storage.
 */
export type AtlasKind =
  | "hypothesis"
  | "alert"
  | "opportunity"
  | "premortem"
  | "recommendation";
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

/** The full owner state (all nested universes), used by the memory repo. */
export interface WorldState {
  rootUniverseId: string;
  universes: Universe[];
  entities: Entity[];
  threads: Thread[];
  analyses: AtlasAnalysis[];
}
