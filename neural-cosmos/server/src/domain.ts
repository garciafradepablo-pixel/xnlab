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

/** The full owner state (all nested universes), used by the memory repo. */
export interface WorldState {
  rootUniverseId: string;
  universes: Universe[];
  entities: Entity[];
  threads: Thread[];
}
