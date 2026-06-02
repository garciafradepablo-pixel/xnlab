/**
 * The store IS the truth. The scene reads it and renders; the UI dispatches
 * these actions. Neither the scene nor the UI mutates state by any other path.
 *
 * Writes are optimistic: we patch local state immediately for a live feel, then
 * reconcile with the server. Server errors surface on `error` but never roll the
 * universe back mid-gesture (the next full load reconciles).
 */
import { create } from "zustand";
import * as api from "../api/client";
import {
  STAGES,
  type AtlasAnalysis,
  type AtlasKind,
  type Entity,
  type EntityDecision,
  type EntityDoc,
  type HistoryEvent,
  type LifeState,
  type Thread,
  type ThreadType,
  type Universe,
  type UniverseSnapshot,
  type Vec3,
  stageIndex,
} from "../types/domain";

export type Mode = "navigate" | "weave" | "move";
export type Lang = "en" | "es";
export type View = "galaxy" | "oracle";

interface Crumb {
  universeId: string;
  name: string;
}

let uidCounter = 0;
const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}_${(uidCounter++).toString(36)}`;

const nowISO = () => new Date().toISOString();

function event(
  kind: HistoryEvent["kind"],
  message: string,
): HistoryEvent {
  return { id: uid("h"), kind, message, createdAt: nowISO() };
}

interface UniverseState {
  // ── data (current universe) ─────────────────────────────────────────────
  universe: Universe | null;
  entities: Entity[];
  threads: Thread[];

  // ── status ──────────────────────────────────────────────────────────────
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;

  // ── view / interaction ──────────────────────────────────────────────────
  mode: Mode;
  lang: Lang;
  view: View;
  selectedId: string | null;
  focusId: string | null; // entity the camera should ease toward
  weaveFromId: string | null; // first endpoint while weaving
  weaveType: ThreadType;
  breadcrumbs: Crumb[]; // zoom trail (root … current)
  inspectorOpen: boolean;
  lowPower: boolean; // degrade effects on weak devices
  bloom: boolean; // optional post-processing glow (off by default for safety)

  // ── Atlas (Phase 9) ───────────────────────────────────────────────────────
  atlasOpen: boolean;
  atlasUniverseId: string | null;
  atlasBusy: boolean;
  atlas: AtlasAnalysis[];

  // ── lifecycle ─────────────────────────────────────────────────────────────
  loadRoot: () => Promise<void>;
  enterChildUniverse: (entityId: string) => Promise<void>;
  goToCrumb: (index: number) => Promise<void>;

  // ── selection / view ──────────────────────────────────────────────────────
  select: (id: string | null) => void;
  setMode: (m: Mode) => void;
  setLang: (l: Lang) => void;
  setView: (v: View) => void;
  setFocus: (id: string | null) => void;
  setWeaveType: (t: ThreadType) => void;
  setInspectorOpen: (open: boolean) => void;
  setLowPower: (v: boolean) => void;
  setBloom: (v: boolean) => void;

  // ── entity mutations ────────────────────────────────────────────────────
  addEntity: (patch: Partial<Entity> & { name: string }) => Promise<void>;
  patchEntity: (id: string, patch: Partial<Entity>) => void;
  moveEntity: (id: string, position: Vec3) => void;
  commitMove: (id: string) => void;
  advanceState: (id: string) => void;
  retreatState: (id: string) => void;
  sendToBlackHole: (id: string) => void;
  rebirth: (id: string) => void;
  addDoc: (id: string, doc: Pick<EntityDoc, "title" | "body">) => void;
  addDecision: (
    id: string,
    d: Pick<EntityDecision, "title" | "rationale">,
  ) => void;

  // ── threads ───────────────────────────────────────────────────────────────
  tapForWeave: (id: string) => void;
  removeThread: (id: string) => void;

  // ── import / export ───────────────────────────────────────────────────────
  exportSnapshot: () => UniverseSnapshot | null;
  importIntoCurrent: (payload: {
    entities: Entity[];
    threads: Thread[];
  }) => Promise<void>;

  // ── Atlas ─────────────────────────────────────────────────────────────────
  openAtlas: (universeId: string) => Promise<void>;
  closeAtlas: () => void;
  generateAtlas: () => Promise<void>;
  addAnalysis: (
    a: { kind: AtlasKind; title: string } & Partial<AtlasAnalysis>,
  ) => Promise<void>;
  setAnalysisStatus: (id: string, status: AtlasAnalysis["status"]) => void;

  // internal
  _entity: (id: string) => Entity | undefined;
}

export const useUniverse = create<UniverseState>((set, get) => ({
  universe: null,
  entities: [],
  threads: [],
  status: "idle",
  error: null,

  mode: "navigate",
  lang: "es",
  view: "galaxy",
  selectedId: null,
  focusId: null,
  weaveFromId: null,
  weaveType: "data",
  breadcrumbs: [],
  inspectorOpen: false,
  lowPower:
    typeof navigator !== "undefined" &&
    (navigator.hardwareConcurrency ?? 8) <= 4,
  bloom: false,

  atlasOpen: false,
  atlasUniverseId: null,
  atlasBusy: false,
  atlas: [],

  _entity: (id) => get().entities.find((e) => e.id === id),

  async loadRoot() {
    set({ status: "loading", error: null });
    try {
      const snap = await api.loadRootUniverse();
      set({
        universe: snap.universe,
        entities: snap.entities,
        threads: snap.threads,
        breadcrumbs: [{ universeId: snap.universe.id, name: snap.universe.name }],
        status: "ready",
        selectedId: null,
        focusId: null,
      });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  async enterChildUniverse(entityId) {
    const entity = get()._entity(entityId);
    if (!entity) return;
    set({ status: "loading", error: null });
    try {
      let childId = entity.childUniverseId;
      if (!childId) {
        const res = await api.ensureChildUniverse(entityId);
        childId = res.childUniverseId;
        // reflect the new link on the parent in the (outgoing) universe
        get().patchEntity(entityId, { childUniverseId: childId });
      }
      const snap = await api.loadUniverse(childId);
      set((s) => ({
        universe: snap.universe,
        entities: snap.entities,
        threads: snap.threads,
        breadcrumbs: [
          ...s.breadcrumbs,
          { universeId: snap.universe.id, name: entity.name },
        ],
        status: "ready",
        selectedId: null,
        focusId: null,
        inspectorOpen: false,
        mode: "navigate",
      }));
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  async goToCrumb(index) {
    const crumbs = get().breadcrumbs;
    const target = crumbs[index];
    if (!target || index === crumbs.length - 1) return;
    set({ status: "loading", error: null });
    try {
      const snap = await api.loadUniverse(target.universeId);
      set({
        universe: snap.universe,
        entities: snap.entities,
        threads: snap.threads,
        breadcrumbs: crumbs.slice(0, index + 1),
        status: "ready",
        selectedId: null,
        focusId: null,
        inspectorOpen: false,
        mode: "navigate",
      });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  select(id) {
    set({
      selectedId: id,
      focusId: id,
      inspectorOpen: id != null,
    });
  },

  setMode(mode) {
    set({ mode, weaveFromId: null });
  },
  setLang(lang) {
    set({ lang });
  },
  setView(view) {
    set({ view });
  },
  setFocus(focusId) {
    set({ focusId });
  },
  setWeaveType(weaveType) {
    set({ weaveType });
  },
  setInspectorOpen(inspectorOpen) {
    set({ inspectorOpen });
  },
  setLowPower(lowPower) {
    set({ lowPower });
  },
  setBloom(bloom) {
    set({ bloom });
  },

  async addEntity(patch) {
    const u = get().universe;
    if (!u) return;
    try {
      const created = await api.createEntity(u.id, patch);
      set((s) => ({
        entities: [...s.entities, created],
        selectedId: created.id,
        focusId: created.id,
        inspectorOpen: true,
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  patchEntity(id, patch) {
    set((s) => ({
      entities: s.entities.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: nowISO() } : e,
      ),
    }));
    api.updateEntity(id, patch).catch((e) =>
      set({ error: (e as Error).message }),
    );
  },

  moveEntity(id, position) {
    // local-only during drag; commitMove persists
    set((s) => ({
      entities: s.entities.map((e) =>
        e.id === id ? { ...e, position } : e,
      ),
    }));
  },

  commitMove(id) {
    const e = get()._entity(id);
    if (!e) return;
    api
      .updateEntity(id, { position: e.position })
      .catch((err) => set({ error: (err as Error).message }));
  },

  advanceState(id) {
    const e = get()._entity(id);
    if (!e) return;
    const i = stageIndex(e.state);
    if (i < 0 || i >= STAGES.length - 1) return;
    const next = STAGES[i + 1] as LifeState;
    applyState(get, id, next, `→ ${next}`);
  },

  retreatState(id) {
    const e = get()._entity(id);
    if (!e) return;
    const i = stageIndex(e.state);
    if (i <= 0) return;
    const prev = STAGES[i - 1] as LifeState;
    applyState(get, id, prev, `← ${prev}`);
  },

  sendToBlackHole(id) {
    applyState(get, id, "blackhole", "absorbed into the black hole", "absorbed");
  },

  rebirth(id) {
    applyState(get, id, "nebula", "reborn from the black hole", "rebirth");
  },

  addDoc(id, doc) {
    const e = get()._entity(id);
    if (!e) return;
    const next: EntityDoc = {
      id: uid("d"),
      title: doc.title,
      body: doc.body,
      createdAt: nowISO(),
    };
    get().patchEntity(id, {
      docs: [...e.docs, next],
      history: [...e.history, event("note", `doc: ${doc.title}`)],
    });
  },

  addDecision(id, d) {
    const e = get()._entity(id);
    if (!e) return;
    const next: EntityDecision = {
      id: uid("dec"),
      title: d.title,
      rationale: d.rationale,
      createdAt: nowISO(),
    };
    get().patchEntity(id, {
      decisions: [...e.decisions, next],
      history: [...e.history, event("note", `decision: ${d.title}`)],
    });
  },

  tapForWeave(id) {
    const { weaveFromId, weaveType, universe } = get();
    if (!universe) return;
    if (!weaveFromId) {
      set({ weaveFromId: id });
      return;
    }
    if (weaveFromId === id) {
      set({ weaveFromId: null });
      return;
    }
    const optimistic: Thread = {
      id: uid("t"),
      universeId: universe.id,
      fromId: weaveFromId,
      toId: id,
      type: weaveType,
      seed: Math.random() * 1000,
    };
    set((s) => ({ threads: [...s.threads, optimistic], weaveFromId: null }));
    api
      .createThread(universe.id, {
        fromId: optimistic.fromId,
        toId: optimistic.toId,
        type: optimistic.type,
        seed: optimistic.seed,
      })
      .then((real) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === optimistic.id ? real : t,
          ),
        })),
      )
      .catch((e) => set({ error: (e as Error).message }));
  },

  removeThread(id) {
    set((s) => ({ threads: s.threads.filter((t) => t.id !== id) }));
    api.deleteThread(id).catch((e) => set({ error: (e as Error).message }));
  },

  exportSnapshot() {
    const { universe, entities, threads } = get();
    if (!universe) return null;
    return { universe, entities, threads };
  },

  async importIntoCurrent(payload) {
    const u = get().universe;
    if (!u) return;
    set({ status: "loading", error: null });
    try {
      const snap = await api.importUniverse(u.id, payload);
      set({
        universe: snap.universe,
        entities: snap.entities,
        threads: snap.threads,
        status: "ready",
        selectedId: null,
        focusId: null,
        inspectorOpen: false,
      });
    } catch (e) {
      set({ status: "ready", error: (e as Error).message });
    }
  },

  async openAtlas(universeId) {
    set({ atlasOpen: true, atlasUniverseId: universeId, atlasBusy: true });
    try {
      const list = await api.listAtlas(universeId);
      set({ atlas: list, atlasBusy: false });
    } catch (e) {
      set({ atlasBusy: false, error: (e as Error).message });
    }
  },

  closeAtlas() {
    set({ atlasOpen: false });
  },

  async generateAtlas() {
    const id = get().atlasUniverseId;
    if (!id) return;
    set({ atlasBusy: true });
    try {
      const { created } = await api.generateAtlas(id);
      set((s) => ({ atlas: [...created, ...s.atlas], atlasBusy: false }));
    } catch (e) {
      set({ atlasBusy: false, error: (e as Error).message });
    }
  },

  async addAnalysis(a) {
    const id = get().atlasUniverseId;
    if (!id) return;
    try {
      const created = await api.addAnalysis(id, a);
      set((s) => ({ atlas: [created, ...s.atlas] }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  setAnalysisStatus(id, status) {
    set((s) => ({
      atlas: s.atlas.map((a) => (a.id === id ? { ...a, status } : a)),
    }));
    api
      .setAnalysisStatus(id, status)
      .catch((e) => set({ error: (e as Error).message }));
  },
}));

/** Shared helper for state transitions: updates state + appends history. */
function applyState(
  get: () => UniverseState,
  id: string,
  state: LifeState,
  message: string,
  kind: HistoryEvent["kind"] = "stage",
) {
  const e = get()._entity(id);
  if (!e) return;
  get().patchEntity(id, {
    state,
    history: [...e.history, event(kind, message)],
  });
}
