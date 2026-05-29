# 01 Agency · XN LAB — Opportunity Intelligence System

> Detects business **moments**, not companies. A cold, conservative, elite
> creative strategist in software form: it starts from a large candidate pool
> and filters it down to a ranked Top‑N of opportunities worth calling — each
> backed by a thesis, concrete evidence, a timing reason and a call angle.

This is an **internal operational tool**. It is intentionally separate from the
public XNLAB brand site (different directory, different rules). Prices and
internal sales language live here freely; the public-site pricing rules do not
apply to this instrument.

---

## What it does

1. Takes ~1,000 candidate companies (target pool) and runs them through a
   six-stage funnel: **discovered → enriched → filtered → scored → shortlisted
   → final Top N**.
2. Evaluates every candidate against **ten qualification filters** (transition,
   economic capacity, tension, lever, active pain, why-now, reachable decision
   maker, budget priority, strategic fit, brutal final cut).
3. Produces a conservative score model: Opportunity Confidence, Evidence
   Strength, Conversation / Meeting / Closing probability, Economic Potential,
   and a **01 / XN LAB / discard** classification.
4. Renders a full **opportunity card** per lead — thesis, evidence with
   sources, tensions, why-now, blind spot, first lever, suggested offer, call
   opening, objection + response, devil's-advocate reasons, and invalidators.
5. Tracks call **status**, **notes**, and a **learning loop** of outcomes that
   reports calibration hints over time.
6. **Exports** the final list as CSV, JSON, a PDF report, or a printable call
   sheet.

The full reasoning model is documented in
[`OPPORTUNITY_SYSTEM_LOGIC.md`](./OPPORTUNITY_SYSTEM_LOGIC.md).

---

## Run it

Zero dependencies, zero build step. It is plain ES modules + one stylesheet.

```bash
cd opportunity-intel
python3 -m http.server 4010     # or: npm run dev
# open http://localhost:4010
```

Any static server works (`npx serve`, etc.). Opening `index.html` directly via
`file://` will **not** work because browsers block ES‑module imports over
`file://` — use a local server.

### Run the engine tests

```bash
node test/scoring.test.mjs       # or: npm test
```

These exercise the scoring engine and the full pipeline with no install.

---

## Architecture

```
opportunity-intel/
├── index.html                 # app shell (module entry)
├── src/
│   ├── models.js              # data schema, the 10 filters, enums, weights, explainers
│   ├── scoring.js             # the scoring engine (pure, testable, the brain)
│   ├── enrichment.js          # source adapters / connectors (the live-data seam)
│   ├── pipeline.js            # discover → enrich → filter → score → shortlist → final
│   ├── store.js               # localStorage persistence + the learning loop
│   ├── export.js              # CSV / JSON / PDF / call sheet
│   ├── seed.js                # demonstration dataset (synthetic, see below)
│   └── ui/
│       ├── app.js             # shell: config panel, pipeline, table, filters, exports
│       ├── card.js            # full opportunity card renderer
│       ├── dom.js             # tiny DOM helpers
│       └── styles.css         # styling (function over decoration)
└── test/scoring.test.mjs      # zero-install engine + pipeline tests
```

**The logic is not hardcoded in the UI.** `models.js`, `scoring.js` and
`pipeline.js` are framework-free and import cleanly under Node, so the engine
can be reused by a CLI, a cron job, or a server with no changes.

---

## About the seeded data (read this)

The dataset in `src/seed.js` is **synthetic** — realistic Spanish business
*archetypes*, not verified leads, with illustrative placeholder citation URLs.

This is deliberate and follows the system's own first rule: **"No evidence = do
not claim it."** Attaching real company names to unverified "evidence" would
violate the evidence discipline the whole tool is built on. The honest path is:
demonstrate the engine on archetypes here, and attach *real, cited* evidence
through the connector layer once live (below). The UI marks the data as
`DEMO DATA` for exactly this reason.

---

## Connecting real data sources

All external research happens through **adapters** in `src/enrichment.js`. Each
is a class with a single `async enrich(candidate)` method that returns
`{ evidence[], signalHints{}, fields{} }`. The demo adapters are no-ops; to go
live you implement them (server-side, with API keys) and **nothing else in the
pipeline changes**.

| Adapter | Live implementation should return | Feeds filters |
|---|---|---|
| `GoogleMapsAdapter` | Places API: name, address, phone, website, rating, **review text** (mine for booking/waiting/communication complaints), multi-location detection | active pain, economic capacity |
| `WebsiteAdapter` | Fetch + audit: last-modified / copyright year, mobile/Lighthouse score, presence of a booking funnel, broken links, schema markup | tension, active pain, lever |
| `LinkedInAdapter` | Company page: headcount trend, recent hires (marketing/sales/admin), funding posts, **named decision makers + profile URLs** | transition, reachable DM, pain |
| `InstagramAdapter` | Follower count, posting cadence (abandoned-during-growth), production quality vs price, DM reachability | tension, pain, reachable DM |
| `PressAdapter` | News/PR: openings, expansions, funding, launches in last 24 months | transition, why-now |
| `JobsAdapter` | Job boards: active marketing/sales/ops roles | transition, active pain |
| `FundingAdapter` | Funding / registry feeds: rounds, new entities | transition, economic capacity |

**Discovery** (building the initial ~1,000 candidate pool) sits *before*
enrichment. Wire it by collecting `{ company, sector, city, website, ... }`
stubs from Google Maps / directories and passing the array to
`runPipeline(candidates, config, liveAdapters)`.

> Adapters must only attach evidence they can **cite**. An adapter that finds
> nothing returns nothing. The engine never fabricates evidence.

A natural production backend for status/notes/learning is the included Supabase
MCP project (swap the `store.js` localStorage calls for table reads/writes —
the record shapes are unchanged).

---

## Configuration

The search-config panel (and `DEFAULT_CONFIG` in `models.js`) controls:

- **country**, **sectors** (include/exclude), **candidate volume**, **final
  lead count**
- **conservatism** — the 80/20 conservative-vs-aggressive blend dial
- **minimum score** to enter the shortlist
- **01 → XN LAB threshold** — confidence at which a very-high-economic,
  XN-scoped lead is classified XN LAB

---

## Tone

The system is built to behave like a cold, conservative strategist: when in
doubt it **downgrades**. Grey ("we don't know") counts as "probably not", not as
neutral. Four red flags discard a lead outright. Every score carries a built-in
explanation of what moves it up and down, so no recommendation is ever naked.
The Top N should feel like *selected* opportunities, not scraped rows.
