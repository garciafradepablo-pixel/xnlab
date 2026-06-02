/**
 * Offline repository — a full in-browser backend for the static / PWA build.
 * Mirrors the REST API surface in api/client.ts, holds the world in memory,
 * and persists to localStorage so edits survive reloads. No server required.
 */
import {
  emptyMeta,
  type AtlasAnalysis,
  type Entity,
  type Thread,
  type Universe,
  type UniverseSnapshot,
} from "../types/domain";
import { buildLocalWorld } from "./seed";

interface World {
  rootUniverseId: string;
  universes: Universe[];
  entities: Entity[];
  threads: Thread[];
  analyses: AtlasAnalysis[];
}

const KEY = "neural-cosmos:world:v1";
const now = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}_${(crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))}`;

let world: World = load();

function load(): World {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const w = JSON.parse(raw) as World;
      if (!w.analyses) w.analyses = [];
      for (const e of w.entities) if (!e.meta) e.meta = emptyMeta();
      return w;
    }
  } catch {
    /* fall through to fresh seed */
  }
  return { ...buildLocalWorld(), analyses: [] };
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(world));
  } catch {
    /* storage full / private mode — stay in memory */
  }
}

/** Wipe local edits and reseed (handy from Settings). */
export function resetLocalWorld() {
  world = { ...buildLocalWorld(), analyses: [] };
  save();
}

function snapshot(u: Universe): UniverseSnapshot {
  return {
    universe: u,
    entities: world.entities.filter((e) => e.universeId === u.id),
    threads: world.threads.filter((t) => t.universeId === u.id),
  };
}

export async function loadRootUniverse(): Promise<UniverseSnapshot> {
  const u = world.universes.find((x) => x.id === world.rootUniverseId)!;
  return snapshot(u);
}

export async function loadUniverse(id: string): Promise<UniverseSnapshot> {
  const u = world.universes.find((x) => x.id === id);
  if (!u) throw new Error("universe not found");
  return snapshot(u);
}

export async function createEntity(
  universeId: string,
  patch: Partial<Entity> & { name: string },
): Promise<Entity> {
  const e: Entity = {
    id: uid("e"),
    universeId,
    name: patch.name,
    kind: patch.kind ?? "company",
    state: patch.state ?? "nebula",
    archetype: patch.archetype ?? { animal: "none", color: "#b06cff", energy: "forming" },
    position: patch.position ?? { x: 0, y: 0, z: 0 },
    sizeHint: patch.sizeHint ?? 0,
    parentEntityId: patch.parentEntityId ?? null,
    childUniverseId: patch.childUniverseId ?? null,
    region: patch.region ?? null,
    meta: patch.meta ?? emptyMeta(),
    docs: patch.docs ?? [],
    decisions: patch.decisions ?? [],
    history: patch.history ?? [
      { id: uid("h"), kind: "created", message: "created", createdAt: now() },
    ],
    createdAt: now(),
    updatedAt: now(),
  };
  world.entities.push(e);
  save();
  return e;
}

export async function updateEntity(
  id: string,
  patch: Partial<Entity>,
): Promise<Entity> {
  const e = world.entities.find((x) => x.id === id);
  if (!e) throw new Error("entity not found");
  const { id: _i, universeId: _u, createdAt: _c, ...safe } = patch;
  void _i; void _u; void _c;
  Object.assign(e, safe);
  e.updatedAt = now();
  save();
  return e;
}

export async function createThread(
  universeId: string,
  patch: Pick<Thread, "fromId" | "toId" | "type"> & Partial<Thread>,
): Promise<Thread> {
  const t: Thread = {
    id: uid("t"),
    universeId,
    fromId: patch.fromId,
    toId: patch.toId,
    type: patch.type,
    seed: patch.seed ?? Math.random() * 1000,
    label: patch.label,
  };
  world.threads.push(t);
  save();
  return t;
}

export async function deleteThread(id: string): Promise<void> {
  world.threads = world.threads.filter((t) => t.id !== id);
  save();
}

export async function ensureChildUniverse(
  entityId: string,
): Promise<{ childUniverseId: string }> {
  const e = world.entities.find((x) => x.id === entityId);
  if (!e) throw new Error("entity not found");
  if (e.childUniverseId) return { childUniverseId: e.childUniverseId };
  const u: Universe = {
    id: uid("u"),
    ownerId: "owner_local",
    name: e.name,
    parentEntityId: entityId,
    version: 1,
    createdAt: now(),
    updatedAt: now(),
  };
  world.universes.push(u);
  e.childUniverseId = u.id;
  save();
  return { childUniverseId: u.id };
}

export async function importUniverse(
  universeId: string,
  payload: { entities: Entity[]; threads: Thread[] },
): Promise<UniverseSnapshot> {
  const u = world.universes.find((x) => x.id === universeId);
  if (!u) throw new Error("universe not found");
  world.entities = world.entities.filter((e) => e.universeId !== universeId);
  world.threads = world.threads.filter((t) => t.universeId !== universeId);
  const ids = new Set((payload.entities ?? []).map((e) => e.id));
  for (const e of payload.entities ?? [])
    world.entities.push({ ...e, universeId, meta: e.meta ?? emptyMeta() });
  for (const t of payload.threads ?? [])
    if (ids.has(t.fromId) && ids.has(t.toId)) world.threads.push({ ...t, universeId });
  save();
  return snapshot(u);
}

// ── Atlas (client-side heuristic) ───────────────────────────────────────────

export async function listAtlas(universeId: string): Promise<AtlasAnalysis[]> {
  return world.analyses.filter((a) => a.universeId === universeId);
}

export async function generateAtlas(
  universeId: string,
): Promise<{ provider: string; created: AtlasAnalysis[] }> {
  const ents = world.entities.filter((e) => e.universeId === universeId);
  const ths = world.threads.filter((t) => t.universeId === universeId);
  const named = ents.filter((e) => e.region == null);
  const drafts: Omit<AtlasAnalysis, "id" | "universeId" | "createdAt">[] = [];
  const D = (
    kind: AtlasAnalysis["kind"], region: AtlasAnalysis["region"],
    tier: AtlasAnalysis["tier"], subject: string, title: string, body: string,
  ) => drafts.push({ kind, region, tier, subject, title, body, status: "open", source: "heuristic" });

  for (const g of named.filter((e) => e.state === "galaxy"))
    D("hypothesis", "success", "superior", g.name, `${g.name} compounds via its own cosmos`,
      `${g.name} spawns sub-systems. Its edge is likely the loop between them, not any one product.`);
  for (const t of ths.filter((x) => x.type === "dependency")) {
    const from = ents.find((e) => e.id === t.fromId)?.name ?? "?";
    const to = ents.find((e) => e.id === t.toId)?.name ?? "?";
    D("alert", "failure", "parity", `${from} → ${to}`, `Critical dependency: ${from} → ${to}`,
      `Single-point dependency — premortem this link before it breaks a quarter.`);
  }
  for (const n of named.filter((e) => e.state === "nebula"))
    D("opportunity", "parity", "inferior", n.name, `${n.name} is still an idea`,
      `Unvalidated. Run the cheapest killing test this cycle; promote only on signal.`);
  const biggest = named
    .map((e) => ({ e, score: ents.filter((c) => c.parentEntityId === e.id).length * 2 + ths.filter((t) => t.fromId === e.id || t.toId === e.id).length }))
    .sort((a, b) => b.score - a.score)[0];
  if (biggest) {
    D("premortem", "blackhole", "superior", biggest.e.name, `If ${biggest.e.name} collapses, why?`,
      `It carries the most connections — most likely failure is over-coupling. Decouple its two heaviest threads.`);
    D("recommendation", "success", "superior", biggest.e.name, `Protect ${biggest.e.name}'s focus`,
      `Concentrate direction here; let smaller bodies stay compact until they earn expansion.`);
  }

  const created = drafts.map((d) => ({ ...d, id: uid("a"), universeId, createdAt: now() }));
  world.analyses.push(...created);
  save();
  return { provider: "heuristic (offline)", created };
}

export async function addAnalysis(
  universeId: string,
  patch: Partial<AtlasAnalysis> & { kind: string; title: string },
): Promise<AtlasAnalysis> {
  const a: AtlasAnalysis = {
    id: uid("a"),
    universeId,
    kind: patch.kind as AtlasAnalysis["kind"],
    region: (patch.region ?? "parity") as AtlasAnalysis["region"],
    tier: (patch.tier ?? "parity") as AtlasAnalysis["tier"],
    subject: patch.subject ?? "",
    title: patch.title,
    body: patch.body ?? "",
    status: "open",
    source: "manual",
    createdAt: now(),
  };
  world.analyses.push(a);
  save();
  return a;
}

export async function setAnalysisStatus(
  id: string,
  status: AtlasAnalysis["status"],
): Promise<AtlasAnalysis> {
  const a = world.analyses.find((x) => x.id === id);
  if (!a) throw new Error("analysis not found");
  a.status = status;
  save();
  return a;
}
