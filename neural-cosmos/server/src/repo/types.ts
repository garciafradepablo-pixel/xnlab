import type {
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
}

export const DEV_OWNER = "owner_dev";
