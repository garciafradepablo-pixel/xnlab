/**
 * REST client with an offline fallback. In the static / PWA build
 * (VITE_STATIC=1) every call runs against the in-browser repo (no server). In
 * the normal build it talks to the API and, if the backend can't be reached,
 * transparently falls back to the offline repo so the app never dies.
 */
import type {
  AtlasAnalysis,
  Entity,
  Thread,
  UniverseSnapshot,
} from "../types/domain";
import * as local from "../local/repo";

const BASE = "/api";
const STATIC = import.meta.env.VITE_STATIC === "1";
let forcedLocal = STATIC;

/** Are we serving everything from the in-browser repo? */
export const isOffline = () => forcedLocal;

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Run `remote`, but fall back to `offline` on a network error (or static build). */
async function call<T>(remote: () => Promise<T>, offline: () => Promise<T>): Promise<T> {
  if (forcedLocal) return offline();
  try {
    return await remote();
  } catch (e) {
    // fetch rejects with TypeError when the backend is unreachable
    if (e instanceof TypeError) {
      forcedLocal = true;
      return offline();
    }
    throw e;
  }
}

export function loadRootUniverse(): Promise<UniverseSnapshot> {
  return call(
    () => fetch(`${BASE}/universe`).then((r) => json<UniverseSnapshot>(r)),
    () => local.loadRootUniverse(),
  );
}

export function loadUniverse(id: string): Promise<UniverseSnapshot> {
  return call(
    () => fetch(`${BASE}/universe/${id}`).then((r) => json<UniverseSnapshot>(r)),
    () => local.loadUniverse(id),
  );
}

export function createEntity(
  universeId: string,
  patch: Partial<Entity> & { name: string },
): Promise<Entity> {
  return call(
    () =>
      fetch(`${BASE}/universe/${universeId}/entities`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => json<Entity>(r)),
    () => local.createEntity(universeId, patch),
  );
}

export function updateEntity(id: string, patch: Partial<Entity>): Promise<Entity> {
  return call(
    () =>
      fetch(`${BASE}/entities/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => json<Entity>(r)),
    () => local.updateEntity(id, patch),
  );
}

export function createThread(
  universeId: string,
  patch: Pick<Thread, "fromId" | "toId" | "type"> & Partial<Thread>,
): Promise<Thread> {
  return call(
    () =>
      fetch(`${BASE}/universe/${universeId}/threads`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => json<Thread>(r)),
    () => local.createThread(universeId, patch),
  );
}

export function deleteThread(id: string): Promise<void> {
  return call(
    () => fetch(`${BASE}/threads/${id}`, { method: "DELETE" }).then(() => undefined),
    () => local.deleteThread(id),
  );
}

export function ensureChildUniverse(
  entityId: string,
): Promise<{ childUniverseId: string }> {
  return call(
    () =>
      fetch(`${BASE}/entities/${entityId}/child-universe`, { method: "POST" }).then(
        (r) => json<{ childUniverseId: string }>(r),
      ),
    () => local.ensureChildUniverse(entityId),
  );
}

export function importUniverse(
  universeId: string,
  payload: { entities: Entity[]; threads: Thread[] },
): Promise<UniverseSnapshot> {
  return call(
    () =>
      fetch(`${BASE}/universe/${universeId}/import`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => json<UniverseSnapshot>(r)),
    () => local.importUniverse(universeId, payload),
  );
}

// ── Atlas ─────────────────────────────────────────────────────────────────

export function listAtlas(universeId: string): Promise<AtlasAnalysis[]> {
  return call(
    () => fetch(`${BASE}/universe/${universeId}/atlas`).then((r) => json<AtlasAnalysis[]>(r)),
    () => local.listAtlas(universeId),
  );
}

export function generateAtlas(
  universeId: string,
): Promise<{ provider: string; created: AtlasAnalysis[] }> {
  return call(
    () =>
      fetch(`${BASE}/universe/${universeId}/atlas/generate`, { method: "POST" }).then(
        (r) => json<{ provider: string; created: AtlasAnalysis[] }>(r),
      ),
    () => local.generateAtlas(universeId),
  );
}

export function addAnalysis(
  universeId: string,
  patch: Partial<AtlasAnalysis> & { kind: string; title: string },
): Promise<AtlasAnalysis> {
  return call(
    () =>
      fetch(`${BASE}/universe/${universeId}/atlas/analyses`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      }).then((r) => json<AtlasAnalysis>(r)),
    () => local.addAnalysis(universeId, patch),
  );
}

export function setAnalysisStatus(
  id: string,
  status: AtlasAnalysis["status"],
): Promise<AtlasAnalysis> {
  return call(
    () =>
      fetch(`${BASE}/atlas/analyses/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => json<AtlasAnalysis>(r)),
    () => local.setAnalysisStatus(id, status),
  );
}
