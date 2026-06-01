/**
 * JSON-file-backed repository. This is the zero-infra fallback used when no
 * DATABASE_URL is set: the whole owner world lives in memory and is flushed to
 * server/.data/universe.json after every mutation, so a dev restart keeps state.
 */
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type {
  AtlasAnalysis,
  Entity,
  Thread,
  Universe,
  UniverseSnapshot,
  WorldState,
} from "../domain.js";
import { buildSeed } from "../seed-data.js";
import type { Repo } from "./types.js";

const nowISO = () => new Date().toISOString();

export class MemoryRepo implements Repo {
  private state: WorldState;
  private file: string;

  constructor(file: string) {
    this.file = file;
    if (existsSync(file)) {
      this.state = JSON.parse(readFileSync(file, "utf8")) as WorldState;
      // migrate files written before Atlas analyses existed
      if (!this.state.analyses) this.state.analyses = [];
    } else {
      this.state = buildSeed();
      this.flush();
    }
  }

  private flush() {
    mkdirSync(dirname(this.file), { recursive: true });
    writeFileSync(this.file, JSON.stringify(this.state, null, 2));
  }

  private universe(id: string): Universe | undefined {
    return this.state.universes.find((u) => u.id === id);
  }

  private snapshot(u: Universe): UniverseSnapshot {
    return {
      universe: u,
      entities: this.state.entities.filter((e) => e.universeId === u.id),
      threads: this.state.threads.filter((t) => t.universeId === u.id),
    };
  }

  private touch(universeId: string) {
    const u = this.universe(universeId);
    if (u) {
      u.version += 1;
      u.updatedAt = nowISO();
    }
  }

  async getRootSnapshot(): Promise<UniverseSnapshot> {
    const root = this.universe(this.state.rootUniverseId)!;
    return this.snapshot(root);
  }

  async getSnapshot(universeId: string): Promise<UniverseSnapshot | null> {
    const u = this.universe(universeId);
    return u ? this.snapshot(u) : null;
  }

  async createEntity(
    universeId: string,
    patch: Partial<Entity> & { name: string },
  ): Promise<Entity> {
    const e: Entity = {
      id: `e_${randomUUID()}`,
      universeId,
      name: patch.name,
      kind: patch.kind ?? "company",
      state: patch.state ?? "nebula",
      archetype: patch.archetype ?? {
        animal: "none",
        color: "#b06cff",
        energy: "forming",
      },
      position: patch.position ?? { x: 0, y: 0, z: 0 },
      sizeHint: patch.sizeHint ?? null,
      parentEntityId: patch.parentEntityId ?? null,
      childUniverseId: patch.childUniverseId ?? null,
      region: patch.region ?? null,
      docs: patch.docs ?? [],
      decisions: patch.decisions ?? [],
      history: patch.history ?? [
        { id: randomUUID(), kind: "created", message: "created", createdAt: nowISO() },
      ],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    this.state.entities.push(e);
    this.touch(universeId);
    this.flush();
    return e;
  }

  async updateEntity(
    id: string,
    patch: Partial<Entity>,
  ): Promise<Entity | null> {
    const e = this.state.entities.find((x) => x.id === id);
    if (!e) return null;
    // never let the client rewrite identity/ownership keys
    const { id: _i, universeId: _u, createdAt: _c, ...safe } = patch;
    void _i;
    void _u;
    void _c;
    Object.assign(e, safe);
    e.updatedAt = nowISO();
    this.touch(e.universeId);
    this.flush();
    return e;
  }

  async createThread(
    universeId: string,
    patch: Pick<Thread, "fromId" | "toId" | "type"> & Partial<Thread>,
  ): Promise<Thread> {
    const t: Thread = {
      id: `t_${randomUUID()}`,
      universeId,
      fromId: patch.fromId,
      toId: patch.toId,
      type: patch.type,
      seed: patch.seed ?? Math.random() * 1000,
      label: patch.label,
    };
    this.state.threads.push(t);
    this.touch(universeId);
    this.flush();
    return t;
  }

  async deleteThread(id: string): Promise<void> {
    const t = this.state.threads.find((x) => x.id === id);
    this.state.threads = this.state.threads.filter((x) => x.id !== id);
    if (t) this.touch(t.universeId);
    this.flush();
  }

  async ensureChildUniverse(
    entityId: string,
  ): Promise<{ childUniverseId: string }> {
    const e = this.state.entities.find((x) => x.id === entityId);
    if (!e) throw new Error("entity not found");
    if (e.childUniverseId) return { childUniverseId: e.childUniverseId };

    const u: Universe = {
      id: `u_${randomUUID()}`,
      ownerId: "owner_dev",
      name: e.name,
      parentEntityId: entityId,
      version: 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    this.state.universes.push(u);
    e.childUniverseId = u.id;
    e.updatedAt = nowISO();
    this.flush();
    return { childUniverseId: u.id };
  }

  async listAnalyses(universeId: string): Promise<AtlasAnalysis[]> {
    return this.state.analyses.filter((a) => a.universeId === universeId);
  }

  async addAnalyses(
    universeId: string,
    drafts: Omit<AtlasAnalysis, "id" | "universeId" | "createdAt">[],
  ): Promise<AtlasAnalysis[]> {
    const created = drafts.map((d) => ({
      ...d,
      id: `a_${randomUUID()}`,
      universeId,
      createdAt: nowISO(),
    }));
    this.state.analyses.push(...created);
    this.flush();
    return created;
  }

  async updateAnalysis(
    id: string,
    patch: Partial<Pick<AtlasAnalysis, "status">>,
  ): Promise<AtlasAnalysis | null> {
    const a = this.state.analyses.find((x) => x.id === id);
    if (!a) return null;
    if (patch.status) a.status = patch.status;
    this.flush();
    return a;
  }
}
