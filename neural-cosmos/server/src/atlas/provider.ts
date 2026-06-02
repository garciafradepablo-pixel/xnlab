/**
 * Atlas analysis provider — the pluggable seam for Phase 9.
 *
 * The brief: "leave the interface hooked up so a model can later generate the
 * analyses. No real AI yet, but the scaffolding must exist." This is that seam.
 *
 * `AtlasProvider.generate` receives the universe context and returns draft
 * analyses. The shipping default is a HEURISTIC stub (no AI) that reads the
 * scene and proposes hypotheses / alerts / opportunities / premortems /
 * recommendations. To wire a real model later, implement `AtlasProvider` and
 * return it from `makeAtlasProvider()` (e.g. switch on an env var) — nothing
 * else in the API or storage layer changes.
 */
import type {
  AtlasAnalysis,
  AtlasKind,
  AtlasRegion,
  AtlasTier,
  Entity,
  Thread,
} from "../domain.js";

export interface AtlasContext {
  universeId: string;
  entities: Entity[];
  threads: Thread[];
}

export type AtlasDraft = Omit<
  AtlasAnalysis,
  "id" | "universeId" | "createdAt"
>;

export interface AtlasProvider {
  readonly name: string;
  generate(ctx: AtlasContext): Promise<AtlasDraft[]>;
}

function draft(
  kind: AtlasKind,
  region: AtlasRegion,
  tier: AtlasTier,
  subject: string,
  title: string,
  body: string,
): AtlasDraft {
  return {
    kind,
    region,
    tier,
    subject,
    title,
    body,
    status: "open",
    source: "heuristic",
  };
}

/**
 * Reads the universe and proposes analyses from simple, explainable signals.
 * Deliberately not AI — it exists so the interface is live and the regions fill
 * with believable content until a model is plugged in.
 */
export class HeuristicAtlasProvider implements AtlasProvider {
  readonly name = "heuristic";

  async generate(ctx: AtlasContext): Promise<AtlasDraft[]> {
    const out: AtlasDraft[] = [];
    const { entities, threads } = ctx;
    const named = entities.filter((e) => e.region == null); // skip region markers

    // Galaxies = mature ecosystems → study them as superiors.
    for (const g of named.filter((e) => e.state === "galaxy")) {
      out.push(
        draft(
          "hypothesis",
          "success",
          "superior",
          g.name,
          `${g.name} compounds via its own cosmos`,
          `${g.name} already spawns sub-systems. Hypothesis: its edge is the ` +
            `feedback loop between them, not any single product.`,
        ),
      );
    }

    // Critical-dependency threads → alerts (failure region).
    for (const t of threads.filter((x) => x.type === "critical")) {
      const from = entities.find((e) => e.id === t.fromId)?.name ?? "?";
      const to = entities.find((e) => e.id === t.toId)?.name ?? "?";
      out.push(
        draft(
          "alert",
          "failure",
          "parity",
          `${from} → ${to}`,
          `Critical dependency: ${from} → ${to}`,
          `A single-point dependency. Premortem this link before it becomes the ` +
            `reason a quarter fails.`,
        ),
      );
    }

    // Nebula-stage bodies = unproven ideas → opportunities (parity region).
    for (const n of named.filter((e) => e.state === "nebula")) {
      out.push(
        draft(
          "opportunity",
          "parity",
          "inferior",
          n.name,
          `${n.name} is still an idea`,
          `Unvalidated. Opportunity: run the cheapest test that could kill it ` +
            `this cycle; promote to protostar only on signal.`,
        ),
      );
    }

    // Largest body by expansion → a premortem.
    const biggest = named
      .map((e) => ({
        e,
        score:
          entities.filter((c) => c.parentEntityId === e.id).length * 2 +
          threads.filter((t) => t.fromId === e.id || t.toId === e.id).length,
      }))
      .sort((a, b) => b.score - a.score)[0];
    if (biggest) {
      out.push(
        draft(
          "premortem",
          "blackhole",
          "superior",
          biggest.e.name,
          `If ${biggest.e.name} collapses, why?`,
          `It carries the most connections. Most likely failure: over-coupling — ` +
            `everything routes through it. Decouple the two heaviest threads.`,
        ),
      );
      out.push(
        draft(
          "recommendation",
          "success",
          "superior",
          biggest.e.name,
          `Protect ${biggest.e.name}'s focus`,
          `Concentrate direction here; let smaller bodies stay compact until they ` +
            `earn expansion.`,
        ),
      );
    }

    return out;
  }
}

/**
 * Factory. Swap the returned provider for a model-backed one here when ready
 * (e.g. `if (process.env.ATLAS_MODEL) return new ModelAtlasProvider()`).
 */
export function makeAtlasProvider(): AtlasProvider {
  return new HeuristicAtlasProvider();
}
