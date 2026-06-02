/**
 * Pure, side-effect-free derivations. Used by the scene to compute geometry
 * without mutating the store. "Size by expansion capacity": the more an entity
 * spawns (children, threads, an inner cosmos), the larger its celestial body.
 */
import type { Entity, LifeState, Thread } from "../types/domain";

const STATE_BASE: Record<LifeState, number> = {
  nebula: 0.9,
  protostar: 1.0,
  star: 1.2,
  system: 1.5,
  constellation: 1.8,
  galaxy: 2.4,
  absorbed: 0.5,
  blackhole: 1.3,
};

/**
 * Expansion capacity → radius. Counts direct children, incident threads and
 * whether the entity holds its own inner universe. Logarithmic so a galaxy with
 * many ecosystems (01) is clearly the largest without dwarfing everything else.
 */
export function computeRadius(
  entity: Entity,
  entities: Entity[],
  threads: Thread[],
): number {
  if (entity.sizeHint && entity.sizeHint > 0) return entity.sizeHint;

  const children = entities.filter(
    (e) => e.parentEntityId === entity.id,
  ).length;
  const incident = threads.filter(
    (t) => t.fromId === entity.id || t.toId === entity.id,
  ).length;
  const hasCosmos = entity.childUniverseId ? 3 : 0;

  const capacity = children * 2 + incident + hasCosmos;
  const base = STATE_BASE[entity.state] ?? 1;
  // log curve keeps the spread readable on a phone screen
  return base * (0.85 + Math.log2(1 + capacity) * 0.42);
}

/** Whether an entity should be hidden from the active universe view. */
export function isVisibleIn(entity: Entity, universeId: string): boolean {
  return entity.universeId === universeId;
}
