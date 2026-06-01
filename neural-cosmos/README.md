# Neural Cosmos

A living business universe — a visual operating system where ideas, companies,
products, flows, intelligence systems and opportunities evolve as celestial
bodies in deep, navigable 3D space. Not a dashboard, not a graph editor:
**strategic clarity** rendered as a cosmos.

> This is an isolated sub-project inside the `xnlab` repo. It has its own
> toolchain and does **not** share the Next.js studio site's build, brand rules,
> or typography.

## Architecture — three strict layers

```
Store (Zustand)  ─►  Scene (R3F / three.js)  ─►  UI / HUD (React DOM overlay)
   ▲                      │ emits events              │ dispatches actions
   └──────────────────────┴───────────────────────────┘
```

- **Store** (`client/src/store`) is the single source of truth: entities, threads,
  camera, selection, mode, current universe, breadcrumbs.
- **Scene** (`client/src/engine`) only *reads* the store and renders. It never
  mutates state directly.
- **UI** (`client/src/ui`) only *dispatches* store actions. It never draws into
  the scene.

## Stack

- **Client:** React + Vite + TypeScript + Three.js via `@react-three/fiber` +
  `@react-three/drei`. Mobile-first (priority zero).
- **Server:** Node + Express + Prisma + PostgreSQL. Falls back to a JSON-file repo
  when `DATABASE_URL` is absent, so it runs with zero infra in dev.

## Run

```bash
# Terminal 1 — API (http://localhost:4020)
cd server && npm install && npm run dev

# Terminal 2 — client (http://localhost:5173)
cd client && npm install && npm run dev
```

With a real Postgres, set `DATABASE_URL` in `server/.env` and run
`npm run prisma:push && npm run seed`. Without it, the server seeds an in-memory /
JSON-file universe automatically on first boot.

## Build phases

See `PROMPT.md` lineage. Implemented: skeleton + types + Prisma schema + CRUD API
+ store (1), full-viewport R3F scene with parallax starfield, fog, calibrated
touch controls and a 3D compass (2), celestial bodies by stage and expansion-size
with tap-select + bottom-sheet inspector (3), neural threads with travelling
pulses and a weave mode (4), lifecycle advance/retreat + archetype nebulae + color
editor (5), black-hole absorption / rebirth (6), infinite zoom into child cosmoses
with breadcrumbs (7), per-entity documents / decisions / history persisted to the
backend (8), and Atlas intelligence-region scaffolding (9).
