import type {
  AtlasAnalysis,
  Entity,
  Thread,
  UniverseSnapshot,
} from "../domain.js";

/** Storage contract. Two implementations: Prisma (Postgres) and JSON-file. */
export interface Repo {
  /** Root universe for the (single, dev) owner — seeds it if empty. */
  getRootSnapshot(): Promise<UniverseSnapshot>;
  getSnapshot(universeId: string): Promise<UniverseSnapshot | null>;

  createEntity(
    universeId: string,
    patch: Partial<Entity> & { name: string },
  ): Promise<Entity>;
  updateEntity(id: string, patch: Partial<Entity>): Promise<Entity | null>;

  createThread(
    universeId: string,
    patch: Pick<Thread, "fromId" | "toId" | "type"> & Partial<Thread>,
  ): Promise<Thread>;
  deleteThread(id: string): Promise<void>;

  /** Create (or return existing) child universe for an entity. */
  ensureChildUniverse(entityId: string): Promise<{ childUniverseId: string }>;

  /** Replace a universe's entities + threads wholesale (JSON import). */
  importUniverse(
    universeId: string,
    payload: { entities: Entity[]; threads: Thread[] },
  ): Promise<UniverseSnapshot>;

  // ── Atlas analyses (Phase 9) ──────────────────────────────────────────────
  listAnalyses(universeId: string): Promise<AtlasAnalysis[]>;
  addAnalyses(
    universeId: string,
    drafts: Omit<AtlasAnalysis, "id" | "universeId" | "createdAt">[],
  ): Promise<AtlasAnalysis[]>;
  updateAnalysis(
    id: string,
    patch: Partial<Pick<AtlasAnalysis, "status">>,
  ): Promise<AtlasAnalysis | null>;
}

export const DEV_OWNER = "owner_dev";
