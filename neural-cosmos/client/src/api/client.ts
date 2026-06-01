/**
 * Thin REST client. The dev server proxies /api → :4020 (see vite.config.ts),
 * so everything is same-origin relative.
 */
import type { Entity, Thread, UniverseSnapshot } from "../types/domain";

const BASE = "/api";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Load the root universe for the (single, dev) owner. */
export function loadRootUniverse(): Promise<UniverseSnapshot> {
  return fetch(`${BASE}/universe`).then((r) => json<UniverseSnapshot>(r));
}

/** Load a specific universe by id (used when zooming into a child cosmos). */
export function loadUniverse(id: string): Promise<UniverseSnapshot> {
  return fetch(`${BASE}/universe/${id}`).then((r) =>
    json<UniverseSnapshot>(r),
  );
}

export function createEntity(
  universeId: string,
  patch: Partial<Entity> & { name: string },
): Promise<Entity> {
  return fetch(`${BASE}/universe/${universeId}/entities`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  }).then((r) => json<Entity>(r));
}

export function updateEntity(
  id: string,
  patch: Partial<Entity>,
): Promise<Entity> {
  return fetch(`${BASE}/entities/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  }).then((r) => json<Entity>(r));
}

export function createThread(
  universeId: string,
  patch: Pick<Thread, "fromId" | "toId" | "type"> & Partial<Thread>,
): Promise<Thread> {
  return fetch(`${BASE}/universe/${universeId}/threads`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
  }).then((r) => json<Thread>(r));
}

export function deleteThread(id: string): Promise<void> {
  return fetch(`${BASE}/threads/${id}`, { method: "DELETE" }).then(() =>
    undefined,
  );
}

/** Create a child universe for an entity (infinite zoom) and return its id. */
export function ensureChildUniverse(
  entityId: string,
): Promise<{ childUniverseId: string }> {
  return fetch(`${BASE}/entities/${entityId}/child-universe`, {
    method: "POST",
  }).then((r) => json<{ childUniverseId: string }>(r));
}
