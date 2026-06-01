/**
 * The seed universe. 01 sits at the centre as the largest body; the major
 * galaxies orbit it, each linked by a thread of the right meaning. Each galaxy
 * holds its own inner cosmos (subsystems) — that's the infinite-zoom seed. Atlas
 * additionally carries its four intelligence regions as a navigable sub-cosmos.
 */
import type {
  Archetype,
  Entity,
  EntityMeta,
  Thread,
  Universe,
  Vec3,
  WorldState,
} from "./domain.js";
import { emptyMeta } from "./domain.js";

const T = "2026-01-01T00:00:00.000Z";

function universe(
  id: string,
  name: string,
  opts: { isRoot?: boolean; parentEntityId?: string } = {},
): Universe {
  return {
    id,
    ownerId: "owner_dev",
    name,
    parentEntityId: opts.parentEntityId ?? null,
    version: 1,
    createdAt: T,
    updatedAt: T,
  };
}

function entity(
  id: string,
  universeId: string,
  name: string,
  opts: {
    kind?: string;
    state?: string;
    archetype?: Partial<Archetype>;
    position?: Vec3;
    childUniverseId?: string;
    sizeHint?: number;
    region?: string;
    meta?: Partial<EntityMeta>;
  } = {},
): Entity {
  return {
    id,
    universeId,
    name,
    kind: opts.kind ?? "company",
    state: opts.state ?? "star",
    archetype: {
      animal: opts.archetype?.animal ?? "none",
      color: opts.archetype?.color ?? "#b06cff",
      energy: opts.archetype?.energy ?? "stellar",
    },
    position: opts.position ?? { x: 0, y: 0, z: 0 },
    sizeHint: opts.sizeHint ?? null,
    parentEntityId: null,
    childUniverseId: opts.childUniverseId ?? null,
    region: opts.region ?? null,
    meta: { ...emptyMeta(), createdBy: "Pablo", ...opts.meta },
    docs: [],
    decisions: [],
    history: [{ id: `${id}-h0`, kind: "created", message: "seeded", createdAt: T }],
    createdAt: T,
    updatedAt: T,
  };
}

function thread(
  id: string,
  universeId: string,
  fromId: string,
  toId: string,
  type: string,
  seed: number,
): Thread {
  return { id, universeId, fromId, toId, type, seed };
}

function ring(count: number, radius: number, yJitter = 6): Vec3[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return {
      x: Math.cos(a) * radius,
      y: (((i * 37) % 100) / 100 - 0.5) * yJitter,
      z: Math.sin(a) * radius,
    };
  });
}

export function buildSeed(): WorldState {
  const universes: Universe[] = [];
  const entities: Entity[] = [];
  const threads: Thread[] = [];

  const root = universe("u-root", "01 · Cosmos", { isRoot: true });
  universes.push(root);

  // child cosmoses (declared first so galaxies can link to them)
  const uXnlab = universe("u-xnlab", "XNLAB", { parentEntityId: "e-xnlab" });
  const uConnect = universe("u-connect", "Connect", { parentEntityId: "e-connect" });
  const uXcap = universe("u-xcap", "XCAP", { parentEntityId: "e-xcap" });
  const uHunter = universe("u-hunter", "Hunter Network", { parentEntityId: "e-hunter" });
  const uAtlas = universe("u-atlas", "Atlas", { parentEntityId: "e-atlas" });
  universes.push(uXnlab, uConnect, uXcap, uHunter, uAtlas);

  // ── root bodies ──────────────────────────────────────────────────────────
  entities.push(
    entity("e-01", root.id, "01", {
      kind: "company",
      state: "galaxy",
      archetype: { animal: "lion", color: "#f2c14e", energy: "the core" },
      position: { x: 0, y: 0, z: 0 },
      sizeHint: 3.4, // enormous: generates every ecosystem
      meta: {
        status: "active",
        role: "Núcleo",
        description:
          "Agencia digital B2B que entra en empresas, detecta necesidades y activa soluciones internas.",
        purpose:
          "Detectar necesidades de negocio y orquestar el ecosistema que las resuelve.",
        tags: ["núcleo", "b2b", "orquestación"],
        priority: "high",
        potential: "very-high",
        risk: "medium",
      },
    }),
    entity("e-xnlab", root.id, "XNLAB", {
      kind: "company",
      state: "galaxy",
      archetype: { animal: "eagle", color: "#b06cff", energy: "violet constellations" },
      position: { x: -17, y: 4, z: -7 },
      childUniverseId: uXnlab.id,
      meta: {
        status: "development",
        role: "Creatividad",
        description:
          "Rama creativa que adopta las necesidades creativas detectadas por 01.",
        purpose:
          "Desarrolla soluciones creativas, branding, contenido, experiencias y sistemas visuales para todo el ecosistema.",
        tags: ["creatividad", "diseño", "contenido", "branding"],
        priority: "high",
        potential: "very-high",
        risk: "medium",
      },
    }),
    entity("e-connect", root.id, "Connect", {
      kind: "connector",
      state: "galaxy",
      archetype: { animal: "wolf", color: "#4ea6ff", energy: "neural mist" },
      position: { x: 15, y: 6, z: -11 },
      childUniverseId: uConnect.id,
      meta: {
        status: "active",
        role: "Comunicación · Operación",
        description: "Galaxia de comunicación y operación del ecosistema.",
        purpose: "Conectar y operar los flujos de comunicación entre nodos.",
        tags: ["comunicación", "operación"],
        priority: "high",
        potential: "high",
        risk: "low",
      },
    }),
    entity("e-xcap", root.id, "XCAP", {
      kind: "financial",
      state: "galaxy",
      archetype: { animal: "bull", color: "#ff5470", energy: "cosmic storms" },
      position: { x: -13, y: -7, z: 13 },
      childUniverseId: uXcap.id,
      meta: {
        status: "active",
        role: "Finanzas · Inversión",
        description: "Galaxia financiera y de inversión.",
        purpose: "Capital, inversión y disciplina financiera del ecosistema.",
        tags: ["finanzas", "inversión", "capital"],
        priority: "high",
        potential: "high",
        risk: "high",
      },
    }),
    entity("e-hunter", root.id, "Hunter Network", {
      kind: "flow",
      state: "galaxy",
      archetype: { animal: "wolf", color: "#3ddc84", energy: "tracking fields" },
      position: { x: 17, y: -4, z: 9 },
      childUniverseId: uHunter.id,
      meta: {
        status: "development",
        role: "Captación Comercial",
        description: "Galaxia comercial de captación y análisis.",
        purpose: "Detectar y captar oportunidades comerciales.",
        tags: ["comercial", "captación", "ventas"],
        priority: "medium",
        potential: "high",
        risk: "medium",
      },
    }),
    entity("e-atlas", root.id, "Atlas", {
      kind: "intelligence",
      state: "galaxy",
      archetype: { animal: "lion", color: "#ffcf5c", energy: "golden stellar dust" },
      position: { x: 0, y: 11, z: 17 },
      childUniverseId: uAtlas.id,
      meta: {
        status: "active",
        role: "Inteligencia Empresarial",
        description:
          "Fuerza de inteligencia: estudia empresas superiores, iguales e inferiores.",
        purpose:
          "Generar hipótesis, alertas, oportunidades, premortems y recomendaciones.",
        tags: ["inteligencia", "análisis", "estrategia"],
        priority: "high",
        potential: "very-high",
        risk: "low",
      },
    }),
  );

  // ── root threads (01 ↔ galaxies, with the right meaning) ──────────────────
  threads.push(
    thread("t-01-xnlab", root.id, "e-01", "e-xnlab", "creative", 1.2),
    thread("t-01-connect", root.id, "e-01", "e-connect", "data", 2.7),
    thread("t-01-xcap", root.id, "e-01", "e-xcap", "capital", 0.5),
    thread("t-01-hunter", root.id, "e-01", "e-hunter", "commercial", 3.1),
    thread("t-01-atlas", root.id, "e-01", "e-atlas", "intelligence", 1.9),
    // XCAP is a critical dependency back into 01
    thread("t-xcap-01", root.id, "e-xcap", "e-01", "dependency", 2.2),
  );

  // ── XNLAB inner cosmos ─────────────────────────────────────────────────────
  const xnNames = ["Avatars", "Oyster", "Pearl", "Parrot", "Butterfly"];
  ring(xnNames.length, 9).forEach((p, i) =>
    entities.push(
      entity(`e-xn-${i}`, uXnlab.id, xnNames[i], {
        kind: "product",
        state: i === 0 ? "system" : "star",
        archetype: { animal: "none", color: "#b06cff", energy: "violet" },
        position: p,
      }),
    ),
  );

  // ── Connect inner cosmos ──────────────────────────────────────────────────
  ["Echo", "Magma"].forEach((name, i) =>
    entities.push(
      entity(`e-cn-${i}`, uConnect.id, name, {
        kind: "service",
        state: "star",
        archetype: { animal: "none", color: "#4ea6ff", energy: "signal" },
        position: { x: i === 0 ? -8 : 8, y: 0, z: 0 },
      }),
    ),
  );

  // ── XCAP inner cosmos ─────────────────────────────────────────────────────
  ["Treasury", "Ledger"].forEach((name, i) =>
    entities.push(
      entity(`e-xc-${i}`, uXcap.id, name, {
        kind: "financial",
        state: "star",
        archetype: { animal: "none", color: "#ff5470", energy: "capital flow" },
        position: { x: i === 0 ? -7 : 7, y: 0, z: 2 },
      }),
    ),
  );

  // ── Hunter inner cosmos ───────────────────────────────────────────────────
  ["Wall", "Sonar"].forEach((name, i) =>
    entities.push(
      entity(`e-hu-${i}`, uHunter.id, name, {
        kind: "tool",
        state: "star",
        archetype: { animal: "none", color: "#3ddc84", energy: "scan" },
        position: { x: i === 0 ? -7 : 7, y: 1, z: 0 },
      }),
    ),
  );

  // ── Atlas inner cosmos: the four intelligence regions ─────────────────────
  entities.push(
    entity("e-at-planets", uAtlas.id, "Planets", {
      kind: "intelligence",
      state: "system",
      archetype: { animal: "lion", color: "#ffcf5c", energy: "observatory" },
      position: { x: 0, y: 0, z: 0 },
      region: "scan",
    }),
    entity("e-at-success", uAtlas.id, "Success", {
      kind: "intelligence",
      state: "constellation",
      archetype: { animal: "none", color: "#3ddc84", energy: "what works" },
      position: { x: -11, y: 3, z: -4 },
      region: "success",
    }),
    entity("e-at-parity", uAtlas.id, "Parity", {
      kind: "intelligence",
      state: "constellation",
      archetype: { animal: "none", color: "#9aa0c8", energy: "the field" },
      position: { x: 0, y: 4, z: -9 },
      region: "parity",
    }),
    entity("e-at-failure", uAtlas.id, "Failure", {
      kind: "intelligence",
      state: "constellation",
      archetype: { animal: "none", color: "#ff5470", energy: "what breaks" },
      position: { x: 11, y: 3, z: -4 },
      region: "failure",
    }),
    entity("e-at-blackhole", uAtlas.id, "Black Hole", {
      kind: "intelligence",
      state: "blackhole",
      archetype: { animal: "none", color: "#1a0030", energy: "absorption" },
      position: { x: 0, y: -6, z: 8 },
      region: "blackhole",
    }),
  );

  return {
    rootUniverseId: root.id,
    universes,
    entities,
    threads,
    analyses: [],
  };
}
