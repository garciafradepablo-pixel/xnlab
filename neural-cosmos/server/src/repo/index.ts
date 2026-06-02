import { join } from "node:path";
import type { Repo } from "./types.js";
import { MemoryRepo } from "./memory.js";

/**
 * Pick the repository. With a DATABASE_URL we use Postgres via Prisma; without
 * one we fall back to the JSON-file repo so the app runs with zero infra.
 */
export async function makeRepo(): Promise<Repo> {
  if (process.env.DATABASE_URL) {
    const { createPrismaRepo } = await import("./prisma.js");
    console.log("[neural-cosmos] repo: prisma (postgres)");
    return createPrismaRepo();
  }
  const file = join(process.cwd(), ".data", "universe.json");
  console.log(`[neural-cosmos] repo: json-file → ${file}`);
  return new MemoryRepo(file);
}

export type { Repo };
