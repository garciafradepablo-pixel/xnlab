/**
 * Prisma / PostgreSQL repository. Active when DATABASE_URL is set.
 *
 * The Prisma client is imported dynamically and typed loosely so the server
 * type-checks and runs even before `prisma generate` has been executed (the
 * memory repo is the default; this only engages when a DB is configured).
 */
import type {
  Entity,
  Thread,
  Universe,
  UniverseSnapshot,
} from "../domain.js";
import { emptyMeta } from "../domain.js";
import { buildSeed } from "../seed-data.js";
import { DEV_OWNER, type Repo } from "./types.js";

const iso = (d: Date | string) =>
  typeof d === "string" ? d : d.toISOString();

function toEntity(row: any): Entity {
  return {
    id: row.id,
    universeId: row.universeId,
    name: row.name,
    kind: row.kind,
    state: row.state,
    archetype: row.archetype,
    position: row.position,
    sizeHint: row.sizeHint,
    parentEntityId: row.parentEntityId,
    childUniverseId: row.childUniverseId,
    region: row.region,
    notes: row.notes ?? undefined,
    meta: { ...emptyMeta(), ...(row.meta ?? {}) },
    docs: row.docs ?? [],
    decisions: row.decisions ?? [],
    history: row.history ?? [],
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function toUniverse(row: any): Universe {
  return {
    id: row.id,
    ownerId: row.ownerId,
    name: row.name,
    parentEntityId: row.parentEntityId,
    version: row.version,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function toThread(row: any): Thread {
  return {
    id: row.id,
    universeId: row.universeId,
    fromId: row.fromId,
    toId: row.toId,
    type: row.type,
    seed: row.seed,
    label: row.label ?? undefined,
  };
}

export async function createPrismaRepo(): Promise<Repo> {
  const mod: any = await import("@prisma/client");
  const prisma = new mod.PrismaClient();

  async function snapshot(universeId: string): Promise<UniverseSnapshot | null> {
    const universe = await prisma.universe.findUnique({
      where: { id: universeId },
    });
    if (!universe) return null;
    const [entities, threads] = await Promise.all([
      prisma.entity.findMany({ where: { universeId } }),
      prisma.thread.findMany({ where: { universeId } }),
    ]);
    return {
      universe: toUniverse(universe),
      entities: entities.map(toEntity),
      threads: threads.map(toThread),
    };
  }

  /** First boot with an empty DB: import the seed world verbatim. */
  async function ensureSeeded() {
    const count = await prisma.universe.count();
    if (count > 0) return;
    const seed = buildSeed();
    await prisma.$transaction([
      ...seed.universes.map((u) =>
        prisma.universe.create({
          data: {
            id: u.id,
            ownerId: u.ownerId,
            name: u.name,
            isRoot: u.id === seed.rootUniverseId,
            parentEntityId: u.parentEntityId ?? null,
            version: u.version,
          },
        }),
      ),
      ...seed.entities.map((e) =>
        prisma.entity.create({
          data: {
            id: e.id,
            universeId: e.universeId,
            name: e.name,
            kind: e.kind,
            state: e.state,
            archetype: e.archetype as any,
            position: e.position as any,
            sizeHint: e.sizeHint ?? null,
            parentEntityId: e.parentEntityId ?? null,
            childUniverseId: e.childUniverseId ?? null,
            region: e.region ?? null,
            meta: e.meta as any,
            docs: e.docs as any,
            decisions: e.decisions as any,
            history: e.history as any,
          },
        }),
      ),
      ...seed.threads.map((t) =>
        prisma.thread.create({
          data: {
            id: t.id,
            universeId: t.universeId,
            fromId: t.fromId,
            toId: t.toId,
            type: t.type,
            seed: t.seed,
            label: t.label ?? null,
          },
        }),
      ),
    ]);
  }

  return {
    async getRootSnapshot() {
      await ensureSeeded();
      const root = await prisma.universe.findFirst({
        where: { ownerId: DEV_OWNER, isRoot: true },
      });
      if (!root) throw new Error("no root universe");
      return (await snapshot(root.id))!;
    },

    getSnapshot: snapshot,

    async createEntity(universeId, patch) {
      const row = await prisma.entity.create({
        data: {
          universeId,
          name: patch.name,
          kind: patch.kind ?? "company",
          state: patch.state ?? "nebula",
          archetype: (patch.archetype ?? {
            animal: "none",
            color: "#b06cff",
            energy: "forming",
          }) as any,
          position: (patch.position ?? { x: 0, y: 0, z: 0 }) as any,
          sizeHint: patch.sizeHint ?? null,
          parentEntityId: patch.parentEntityId ?? null,
          childUniverseId: patch.childUniverseId ?? null,
          region: patch.region ?? null,
          meta: (patch.meta ?? emptyMeta()) as any,
          docs: (patch.docs ?? []) as any,
          decisions: (patch.decisions ?? []) as any,
          history: (patch.history ?? [
            {
              id: crypto.randomUUID(),
              kind: "created",
              message: "created",
              createdAt: new Date().toISOString(),
            },
          ]) as any,
        },
      });
      await prisma.universe.update({
        where: { id: universeId },
        data: { version: { increment: 1 } },
      });
      return toEntity(row);
    },

    async updateEntity(id, patch) {
      const { id: _i, universeId: _u, createdAt: _c, ...safe } = patch;
      void _i;
      void _u;
      void _c;
      const row = await prisma.entity.update({
        where: { id },
        data: {
          ...(safe.name !== undefined && { name: safe.name }),
          ...(safe.kind !== undefined && { kind: safe.kind }),
          ...(safe.state !== undefined && { state: safe.state }),
          ...(safe.archetype !== undefined && { archetype: safe.archetype as any }),
          ...(safe.position !== undefined && { position: safe.position as any }),
          ...(safe.sizeHint !== undefined && { sizeHint: safe.sizeHint }),
          ...(safe.parentEntityId !== undefined && {
            parentEntityId: safe.parentEntityId,
          }),
          ...(safe.childUniverseId !== undefined && {
            childUniverseId: safe.childUniverseId,
          }),
          ...(safe.region !== undefined && { region: safe.region }),
          ...(safe.notes !== undefined && { notes: safe.notes }),
          ...(safe.meta !== undefined && { meta: safe.meta as any }),
          ...(safe.docs !== undefined && { docs: safe.docs as any }),
          ...(safe.decisions !== undefined && { decisions: safe.decisions as any }),
          ...(safe.history !== undefined && { history: safe.history as any }),
        },
      });
      return toEntity(row);
    },

    async createThread(universeId, patch) {
      const row = await prisma.thread.create({
        data: {
          universeId,
          fromId: patch.fromId,
          toId: patch.toId,
          type: patch.type,
          seed: patch.seed ?? Math.random() * 1000,
          label: patch.label ?? null,
        },
      });
      return toThread(row);
    },

    async deleteThread(id) {
      await prisma.thread.delete({ where: { id } }).catch(() => undefined);
    },

    async listAnalyses(universeId) {
      const rows = await prisma.atlasAnalysis.findMany({
        where: { universeId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map((r: any) => ({
        id: r.id,
        universeId: r.universeId,
        kind: r.kind,
        region: r.region,
        tier: r.tier,
        subject: r.subject,
        title: r.title,
        body: r.body,
        status: r.status,
        source: r.source,
        createdAt: iso(r.createdAt),
      }));
    },

    async addAnalyses(universeId, drafts) {
      const created = await prisma.$transaction(
        drafts.map((d) =>
          prisma.atlasAnalysis.create({
            data: {
              universeId,
              kind: d.kind,
              region: d.region,
              tier: d.tier,
              subject: d.subject,
              title: d.title,
              body: d.body,
              status: d.status,
              source: d.source,
            },
          }),
        ),
      );
      return created.map((r: any) => ({
        id: r.id,
        universeId: r.universeId,
        kind: r.kind,
        region: r.region,
        tier: r.tier,
        subject: r.subject,
        title: r.title,
        body: r.body,
        status: r.status,
        source: r.source,
        createdAt: iso(r.createdAt),
      }));
    },

    async updateAnalysis(id, patch) {
      const r = await prisma.atlasAnalysis
        .update({ where: { id }, data: { ...(patch.status && { status: patch.status }) } })
        .catch(() => null);
      if (!r) return null;
      return {
        id: r.id,
        universeId: r.universeId,
        kind: r.kind,
        region: r.region,
        tier: r.tier,
        subject: r.subject,
        title: r.title,
        body: r.body,
        status: r.status,
        source: r.source,
        createdAt: iso(r.createdAt),
      };
    },

    async ensureChildUniverse(entityId) {
      const e = await prisma.entity.findUnique({ where: { id: entityId } });
      if (!e) throw new Error("entity not found");
      if (e.childUniverseId) return { childUniverseId: e.childUniverseId };
      const u = await prisma.universe.create({
        data: {
          ownerId: e.universeId ? DEV_OWNER : DEV_OWNER,
          name: e.name,
          parentEntityId: entityId,
        },
      });
      await prisma.entity.update({
        where: { id: entityId },
        data: { childUniverseId: u.id },
      });
      return { childUniverseId: u.id };
    },
  };
}
