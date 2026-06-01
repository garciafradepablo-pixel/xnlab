/**
 * Seeds a real Postgres via Prisma (no-op if already seeded). Run after
 * `prisma db push` with DATABASE_URL set: `npm run seed`.
 */
import { createPrismaRepo } from "./repo/prisma.js";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set — nothing to seed (memory repo seeds itself).");
    process.exit(1);
  }
  const repo = await createPrismaRepo();
  await repo.getRootSnapshot(); // triggers ensureSeeded()
  console.log("[neural-cosmos] seed complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
