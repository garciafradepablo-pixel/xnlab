/**
 * Neural Cosmos API. A small, clean REST surface over the repository. The
 * universe loads and saves per owner so it works across devices.
 */
import express from "express";
import cors from "cors";
import { makeRepo } from "./repo/index.js";
import { makeAtlasProvider } from "./atlas/provider.js";

const PORT = Number(process.env.PORT ?? 4020);

async function main() {
  const repo = await makeRepo();
  const atlas = makeAtlasProvider();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  // wrap async handlers so rejections become 500s, not unhandled crashes
  const h =
    (fn: (req: express.Request, res: express.Response) => Promise<unknown>) =>
    (req: express.Request, res: express.Response) =>
      fn(req, res).catch((e) => {
        console.error(e);
        res.status(500).json({ error: (e as Error).message });
      });

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.get(
    "/api/universe",
    h(async (_req, res) => res.json(await repo.getRootSnapshot())),
  );

  app.get(
    "/api/universe/:id",
    h(async (req, res) => {
      const snap = await repo.getSnapshot(req.params.id);
      if (!snap) return res.status(404).json({ error: "universe not found" });
      res.json(snap);
    }),
  );

  app.post(
    "/api/universe/:id/entities",
    h(async (req, res) => {
      if (!req.body?.name)
        return res.status(400).json({ error: "name required" });
      res.status(201).json(await repo.createEntity(req.params.id, req.body));
    }),
  );

  app.patch(
    "/api/entities/:id",
    h(async (req, res) => {
      const updated = await repo.updateEntity(req.params.id, req.body ?? {});
      if (!updated) return res.status(404).json({ error: "entity not found" });
      res.json(updated);
    }),
  );

  // Replace a universe's contents from an exported snapshot (JSON import).
  app.post(
    "/api/universe/:id/import",
    h(async (req, res) => {
      const { entities, threads } = req.body ?? {};
      if (!Array.isArray(entities) || !Array.isArray(threads))
        return res
          .status(400)
          .json({ error: "entities[] and threads[] required" });
      res.json(await repo.importUniverse(req.params.id, { entities, threads }));
    }),
  );

  app.post(
    "/api/entities/:id/child-universe",
    h(async (req, res) =>
      res.json(await repo.ensureChildUniverse(req.params.id)),
    ),
  );

  app.post(
    "/api/universe/:id/threads",
    h(async (req, res) => {
      const { fromId, toId, type } = req.body ?? {};
      if (!fromId || !toId || !type)
        return res.status(400).json({ error: "fromId, toId, type required" });
      res.status(201).json(await repo.createThread(req.params.id, req.body));
    }),
  );

  app.delete(
    "/api/threads/:id",
    h(async (req, res) => {
      await repo.deleteThread(req.params.id);
      res.status(204).end();
    }),
  );

  // ── Atlas — intelligence scaffolding (Phase 9) ────────────────────────────
  app.get(
    "/api/universe/:id/atlas",
    h(async (req, res) => res.json(await repo.listAnalyses(req.params.id))),
  );

  // Generate analyses for a universe via the (pluggable) provider, persist them.
  app.post(
    "/api/universe/:id/atlas/generate",
    h(async (req, res) => {
      const snap = await repo.getSnapshot(req.params.id);
      if (!snap) return res.status(404).json({ error: "universe not found" });
      const drafts = await atlas.generate({
        universeId: req.params.id,
        entities: snap.entities,
        threads: snap.threads,
      });
      const created = await repo.addAnalyses(req.params.id, drafts);
      res.status(201).json({ provider: atlas.name, created });
    }),
  );

  // Manual analysis (human-authored).
  app.post(
    "/api/universe/:id/atlas/analyses",
    h(async (req, res) => {
      const b = req.body ?? {};
      if (!b.kind || !b.title)
        return res.status(400).json({ error: "kind and title required" });
      const [created] = await repo.addAnalyses(req.params.id, [
        {
          kind: b.kind,
          region: b.region ?? "parity",
          tier: b.tier ?? "parity",
          subject: b.subject ?? "",
          title: b.title,
          body: b.body ?? "",
          status: "open",
          source: "manual",
        },
      ]);
      res.status(201).json(created);
    }),
  );

  app.patch(
    "/api/atlas/analyses/:id",
    h(async (req, res) => {
      const updated = await repo.updateAnalysis(req.params.id, req.body ?? {});
      if (!updated) return res.status(404).json({ error: "analysis not found" });
      res.json(updated);
    }),
  );

  app.listen(PORT, () =>
    console.log(`[neural-cosmos] API on http://localhost:${PORT}`),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
