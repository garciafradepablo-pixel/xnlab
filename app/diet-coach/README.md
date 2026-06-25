# Diet Coach OS

A mobile-first, local-first PWA to plan, execute and log a clean-bulk diet.
Built on the existing Next.js + TypeScript + Tailwind stack. No backend, no
login, no database — everything persists in `localStorage`.

> Goal: gain weight (62 → 77 kg) maximising hypertrophy, minimising fat, while
> travelling and eating out (currently Thailand, hotel with fridge + kettle).

## Run

From the repo root:

```bash
npm install
npm run dev
```

Then open **http://localhost:3000/diet-coach** on your phone (same Wi-Fi, use
your machine's LAN IP, e.g. `http://192.168.x.x:3000/diet-coach`).

## Install on iPhone (Safari)

1. Open `/diet-coach` in **Safari**.
2. Tap **Share → Add to Home Screen**.
3. Launch it from the home screen — it opens full-screen (standalone), with its
   own icon and theme.

PWA config lives in `public/diet-coach/manifest.webmanifest`, the icons are
generated as PNG by `icon.tsx` / `apple-icon.tsx`, and a conservative
network-first service worker (`public/diet-coach/sw.js`) gives a basic offline
shell.

## Screens

- **Hoy** — dashboard: weight + goal, calorie band (3.400–3.800), protein band
  (150–170 g), meals/supplements done, water, day status (Por debajo / En rango
  / Excelente) and coaching alerts.
- **Comidas** — the 8-block plan; tap to expand foods + quantities, check off,
  and adjust the portion (*comí menos / normal / comí más*).
- **Compra** — shopping list by duration (3 / 4 / 7 / 14 / 30 days) with
  quantities scaled automatically, by category, with priority + alternatives.
- **Fuera** — quick high-protein orders for Thailand (what to order, add, avoid).
- **Supl.** — daily supplement checklist (conditional ones flagged).
- **Registro** — log weight, hunger/energy/digestion/sleep (1–5), training and a
  free comment. Weight trend + alerts.

## Coaching rules

- Weight flat for 14 days → "sube 200–300 kcal/día".
- Protein < 150 g → alert.
- Calories < 3.400 kcal → alert.
- Digestion low several days → reduce fat / check dairy / split meals.

## Structure

```
app/diet-coach/
  layout.tsx            PWA metadata (manifest, apple, viewport)
  page.tsx              client entry, registers the service worker
  _components/          Shell, TabBar, Dashboard, MealPlan, Shopping,
                        EatingOut, Supplements, Tracking, ui (primitives)
  _data/                meals, supplements, shopping, eatingOut (hardcoded TS)
  _lib/                 types, store (localStorage + context), nutrition
public/diet-coach/      manifest.webmanifest, sw.js
```

## Daily reset

The daily fields (meals, supplements, water) auto-reset at midnight (local
date), and can be reset manually with **Reset día** in the header. Weight,
shopping and the tracking log persist.
