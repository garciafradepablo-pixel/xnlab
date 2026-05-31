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

### Generate the list headless (automation)

For the "wake up with 20 companies to call" workflow, run the pipeline without
the UI and write the exports to disk (cron-friendly):

```bash
node bin/run.mjs                         # Top 20 from the seed → ./out
node bin/run.mjs --final 10 --out /tmp/leads
node bin/run.mjs --enrich                # also run live adapters (needs network)
```

Flags: `--final N`, `--conservatism 0..1`, `--min-score N`, `--out DIR`,
`--enrich` (use live adapters), `--quiet`.

### Run the engine tests

```bash
npm test                                 # scoring + enrichment suites
# or individually:
node test/scoring.test.mjs
node test/enrichment.test.mjs
```

These exercise the scoring engine, the pipeline, and the website parsers with
no install.

---

## Architecture

```
opportunity-intel/
├── index.html                 # app shell (module entry)
├── bin/run.mjs                # headless runner → CSV/JSON/call-sheet (cron-friendly)
├── src/
│   ├── models.js              # data schema, the 10 filters, enums, weights, explainers
│   ├── scoring.js             # the scoring engine (pure, testable, the brain)
│   ├── enrichment.js          # source adapters + a real WebsiteAdapter (the live-data seam)
│   ├── pipeline.js            # discover → enrich → filter → score → shortlist → final
│   ├── store.js               # persistence + portable export/import of the call log
│   ├── calibration.js         # turns call outcomes into bounded scoring nudges
│   ├── export.js              # CSV / JSON / PDF / call sheet
│   ├── seed.js                # demonstration dataset (synthetic, see below)
│   └── ui/
│       ├── app.js             # shell: config panel, pipeline, table, filters, exports
│       ├── card.js            # full opportunity card renderer
│       ├── dom.js             # tiny DOM helpers
│       └── styles.css         # styling (function over decoration)
└── test/
    ├── scoring.test.mjs       # engine + pipeline tests
    └── enrichment.test.mjs    # website-parser + adapter tests
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

### Two datasets, switchable in the UI

The config panel has a **Dataset** selector:

- **Demo — synthetic** — the archetypes in `src/seed.js` (default).
- **Researched — Spain** — real, press-verified leads in `src/data/researched.js`.

The researched dataset holds a **pilot of 6 real Spanish opportunities**
(researched 2026-05-29 via web search): a boutique luxury hotel, a funded
foodtech brand, two premium restaurant groups, and two luxury developers. Each
carries a press-verified *moment* (opening / funding / expansion), a **verified
decision maker + contact channel**, and a real website — all with cited URLs:

| Lead | City | Moment | Decision maker |
|---|---|---|---|
| La Casa del Limonero | Sevilla | 15th-c palace hotel opened Mar 2025 | Martina Cam (owner/director) |
| FoodieFame | Madrid | €800k seed, Jul 2025 | Jesús Muñoz (founder/CEO) |
| Grupo Arzábal | Madrid | 100-seat Bernabéu flagship | Morales & Castellanos (founders) |
| Grupo GastroPortal · Manero | Alicante | Expansion incl. Lisbon | Carlos Bosch (founder/CEO) |
| Promora · Impulsa | Madrid | New expansion model | Carlos Morón Fernández (director) |
| Sierra Blanca Estates | Marbella | €500M luxury pipeline | Rodríguez family (direction) |

Honest limits, encoded in the scores: the **on-site tension, active pain and
exact budget priority are still grey** — they need an on-site/reviews check, not
a press article. So the conservative engine scores these **62–70** (vs the 90s
the synthetic all-green archetypes hit) and every one reads *"prepare a
mini-audit first"*. Each card's **Verification block** shows the verified
share and the exact "confirm before calling" checklist. A real, half-verified
moment is a *hypothesis*, not a closed case — and a lead is only ever added with
≥3 cited evidence points, never fabricated.

**Closing the gaps (manual verification → higher score).** Each gap chip in the
Verification block is clickable: the analyst checks the site/reviews (30s),
picks a verdict (green/yellow/red), and leaves a note + the URL they looked at.
That note becomes a **cited evidence point**, flips the signal, and the lead
**re-scores immediately** (e.g. Arzábal 71.3 → 84 after confirming two gaps).
Nothing is fabricated — the verification is real, attributed and dated
(`store.addVerification` / `applyVerifications`, unit-tested). This is the path
to raise scores when automatic enrichment can't reach a site (most sites here
return HTTP 403 to a plain server-side `fetch`, so a human or a headless-browser
adapter closes the gap).

A note on `--enrich` against these sites: several (e.g. the hotel) are
client-rendered SPAs that return a near-empty HTML shell to a plain `fetch`. The
`WebsiteAdapter` correctly emits **zero** evidence from a shell rather than
guessing — verifying the on-site gaps for JS-heavy sites needs a headless-browser
variant of the adapter (documented as the next connector step).

---

## Connecting real data sources

All external research happens through **adapters** in `src/enrichment.js`. Each
is a class with a single `async enrich(candidate)` method that returns
`{ evidence[], signalHints{}, fields{} }`.

The **`WebsiteAdapter` is already a working implementation**: given a reachable
URL it fetches the page and emits cited evidence — stale copyright year, missing
mobile viewport, absent booking/quote CTA, template builders (Wix/Squarespace/…).
Its analysis (`analyzeWebsiteHtml`) is pure and unit-tested. The remaining
API-backed adapters are documented stubs you implement; `liveAdapters()`
enables the website adapter by default and lets you toggle the rest:

```js
import { runPipeline } from "./src/pipeline.js";
import { liveAdapters } from "./src/enrichment.js";
const adapters = liveAdapters({ website: true, press: true }); // toggle sources
const result = await runPipeline(candidates, config, adapters);
```

(The demo uses `defaultAdapters()`, which are all **disabled** so the UI never
touches the network — the seeded URLs are placeholders.)

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

## The learning loop closes (calibration)

Call outcomes are not just reported — they **recalibrate scoring**, conservatively.

- Log an outcome on any card (result, objection, what worked/failed, was the
  hypothesis right, next action). The lead's signal snapshot is stored with it.
- `calibration.js` asks, per filter: *does a green signal here actually predict a
  good call?* A green that converts above the base rate earns that filter a small
  weight bump; one that converts below gets trimmed.
- **Guardrails** (in `CALIBRATION`): nothing happens below 6 decisive calls
  (interested/meeting vs rejected/wrong-fit); a filter needs ≥3 green
  observations to move; and every nudge is hard-capped at **±15%**. Weights are
  renormalised, so calibration changes the *balance* between filters, never the
  overall scale. A noisy first week cannot distort the model.
- The **Learning loop** tab shows whether calibration is ACTIVE, the base
  success rate, and exactly which filters moved and by how much.

**Sharing across people (Pablo + Javi).** State lives in `localStorage`
(per-browser), so the Learning tab has **Export / Import call log**: Pablo
exports a JSON file after his calls, Javi imports it, and the scoring they both
see reflects every call. Import is non-destructive (outcomes are de-duplicated;
status records merge with newest-wins). `store.exportState()` /
`store.importState()` are unit-tested.

---

## Entregar — del lead firmado al trabajo

Connect no termina al firmar. El arco **Captar → Cerrar** tenía un precipicio:
después de `Firmado` no había nada que gestionara el trabajo. La zona
**Entregar → Estudio** lo cierra.

- Un lead en estado `Firmado` muestra en el CRM un botón **«Llevar a Estudio»**
  que lo convierte en un **engagement de cliente** (atado al lead, con una tarea
  de kickoff sembrada). Si ya existe, el botón lo abre.
- Los **proyectos internos** (el software propio de la empresa — el mismo
  Connect, el site…) viven aquí también: botón **«+ Proyecto interno»**.
- Cada engagement tiene **tareas** (estado `Por hacer → En curso → Bloqueado →
  Hecho`, responsable, % de avance) y una **bitácora** de sesiones de trabajo,
  decisiones y notas, firmada por el color del usuario.

Una sola entidad (`kind: "client" | "internal"`) cubre las tres cosas:
seguimiento de cliente, gestión de tareas y registro de trabajo. La lógica vive
pura en [`src/engagements.js`](./src/engagements.js) (testeada en
`test/engagements.test.mjs`); la persistencia es la misma del resto del estado
operativo (`store.js`), así que **se sincroniza entre Pablo y Javi** vía
`export/importState` sin código extra — la misma mesa de trabajo en cualquier
dispositivo.

**Gestión real del trabajo.** Cada tarea admite **fecha límite** (se marca en
rojo si vence) y **dependencias** entre tareas: una tarea con dependencias sin
cerrar sale como *Bloqueada* y no avanza hasta que se cierran (sin auto-deps ni
ciclos, validado). El proyecto tiene **hitos** con fecha, **adjuntos** como
enlaces citados (Drive, Figma, un repo — no subimos binarios: el estado viaja
como un JSON sincronizado) y una bitácora que puede **vincular un commit de
git** (hash + URL), que se renderiza como un chip enlazado. Un KPI de
*Vencidos* resume tareas e hitos pasados.

**Tiempo real, sin websockets.** La mesa compartida se siente viva con tres
capas, todas sobre el canal de sync existente (cero infra nueva, cero deps):

- **Sondeo adaptativo.** Mientras estás activo y mirando, sondea cada ~4 s; si
  te quedas quieto, baja a ~15 s; con la pestaña oculta, se pausa; al volver a
  ella, refresca al instante. `pullSharedState` fusiona no-destructivo (lo más
  reciente por entidad gana), así que **no toca el modelo de sync optimista** ya
  probado ni abre la tabla a acceso directo — conserva la seguridad de la Edge
  Function. Nunca repinta mientras escribes (no te borra un input a medias).
- **Presencia de equipo.** Un latido ligero (`presence.js`, podado por TTL, que
  viaja por el mismo documento) muestra en la cabecera **quién está conectado y
  en qué vista**, con su color de firma. Se va solo a los 45 s sin señal.
- **Aviso de cambios.** Cuando entra un cambio del equipo, la tarjeta afectada
  del Estudio **destella** y salta un aviso efímero («Connect interno» se
  actualizó) — los cambios se sienten, no son silenciosos.
- **Realtime por websocket (<1 s).** Encima del sondeo, un canal de **Supabase
  Realtime (broadcast)** propaga un *nudge* en cuanto alguien sube un cambio; el
  otro lo recibe y trae al instante. El indicador pasa de «En vivo» a **«Tiempo
  real»**. Ver [`src/realtime.js`](./src/realtime.js) — cliente Phoenix mínimo,
  sin dependencias, con reconexión por backoff.

> **Por qué broadcast y no datos por el socket:** el broadcast es pub/sub puro
> entre clientes — no toca la tabla ni RLS, así que el cliente sigue llevando
> solo la clave publishable y la fuente durable sigue siendo la Edge Function
> (service role). El socket lleva un *aviso*, no el estado.
>
> **Aditivo y degradable:** si el websocket no conecta (red, política del
> entorno, server), el sondeo adaptativo sigue siendo el suelo — la app funciona
> igual, solo un poco menos instantánea. El nudge se emite SOLO tras un push
> propio confirmado (no en el pull de migración), así que no hay bucle de avisos
> entre los dos navegadores.
>
> **Validación en vivo pendiente:** la capa de protocolo está unit-testeada con
> un WebSocket falso (`test/realtime.test.mjs`), pero el handshake real no se ha
> probado contra Supabase (el entorno de desarrollo no tiene salida de red). La
> primera vez en dos navegadores se ve si el indicador llega a «Tiempo real».

**Ambiente colaborativo.** Tres capas más que hacen el taller compartido:

- **Edición concurrente.** Cada cliente publica en su latido QUÉ proyecto tiene
  abierto (`focus`); el Estudio muestra el avatar de quien también está en una
  tarjeta y un aviso «Javi también está aquí — cuidado al editar a la vez».
- **Actividad del equipo** (`Memoria → Actividad`). Feed cronológico derivado del
  trabajo real (proyectos creados, notas/commits de bitácora, hitos cumplidos,
  movimientos del CRM), firmado por color. No hay que registrar nada —
  [`src/activity.js`](./src/activity.js), puro y testeado.
- **Sonido de aviso.** Un timbre suave (WebAudio, sin assets) al llegar un
  cambio remoto. Apagado por defecto, con interruptor en la cabecera, recordado
  por dispositivo.

> El sector **Software y Producto Digital** se añadió a la taxonomía interna
> para que el funnel también detecte momentos en ese vertical. Es taxonomía del
> instrumento interno, independiente de los seis mundos públicos de la marca.

---

## Crecer — agenda y desarrollo personal

Más allá de captar y entregar, Connect cuida a quién hace el trabajo. La zona
**Crecer** tiene dos caras, ambas sincronizadas con el equipo:

**Agenda** (`src/agenda.js`). Cada persona tiene su **agenda personal** y existe
una **agenda común** del equipo. Una entrada puede **vincularse a una tarea del
Estudio** (la tarea de un proyecto entra en la agenda de quien la hará un día
concreto) y una entrada común puede **“tomarse”** para pasarla a tu agenda — así
se vinculan las agendas entre sí. Vista por días: Atrasado · Hoy · Mañana · …

**Desarrollo personal** (`src/growth.js`). Para cada trabajador (y el CEO):

- **Fortalezas** (pros / habilidades) con nivel 1–5 que sube según creces.
- **Frenos** (“perezas” / negativas) con recorrido *Detectado → En ello →
  Superado*. **Cerrar un freno puede convertirlo en una nueva potencia**: nace
  una fortaleza con la traza de su origen. Limando negativas aparecen fuerzas.
- **Pensamiento crítico** como pilar **acentuado y medible**: nivel propio, un
  **reto semanal compartido** (la misma provocación para todo el equipo esa
  semana), y un registro de *retos* (supuesto cuestionado, postura contraria
  defendida, evidencia exigida, decisión re-examinada). Cada tres retos sube el
  nivel, y **cada reto aparece en el feed de Actividad del equipo** — se valora,
  se ve y se reconoce, no se da por hecho.

Un selector de persona permite ver el desarrollo del equipo (cada uno edita el
suyo; el CEO puede ver/editar todos). Todo es lógica pura y testeada
(`test/agenda.test.mjs`, `test/growth.test.mjs`) y viaja por el mismo canal de
sync compartido.

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
