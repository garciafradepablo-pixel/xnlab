# Caja Negra Comercial — arquitectura

Convierte cada llamada comercial (que hace un humano) en datos útiles y
acumulables: historial por lead, transcripción, análisis estructurado,
objeciones, dolores, señales, scoring y memoria de mercado. **No** llama sola:
el humano llama, Connect recoge, ordena y aprende.

## Qué se entregó (v1, funcional)

| Pieza | Fichero | Qué hace |
|---|---|---|
| Vocabulario de llamada | `src/models.js` | `CALL_CHANNELS`, `CALL_RESULTS` |
| Registro + análisis local | `src/calls.js` | `newCall()`, `analyzeTranscript()` (determinista, puro) |
| Memoria comercial | `src/commercialmemory.js` | `buildMemory()`, `buildDashboard()` (puros) |
| Persistencia | `src/store.js` | colección `calls` en el documento compartido |
| Capa de IA (servidor) | `supabase/functions/call-analysis` | Gemini → fallback al analizador local |
| Capa de IA (cliente) | `src/callai.js` | `analyzeCall()`: LLM con caída limpia al local |
| UI lead | `src/ui/card.js` | panel **Caja Negra**: llamadas, pegar transcripción, analizar, mensaje de seguimiento |
| UI dashboard | `src/ui/app.js` | vista **Caja Negra** (Cerrar): embudo, leads calientes, patrones |
| Tests | `test/calls.test.mjs`, `test/commercialmemory.test.mjs` | 43 asserts |

## Decisión de almacenamiento

La app persiste **un único documento JSON compartido** (`store.exportState` ↔
`connect-state`), con control optimista por `rev`, RBAC en el servidor y
export/import como espina dorsal del trabajo en equipo. La Caja Negra se monta
como **una colección `calls` más dentro de ese documento** (igual que `tasks` y
`posits`): viaja por el sync existente, funciona offline, se exporta y respeta
el RBAC sin infraestructura nueva.

Cada llamada:

```js
{ id, leadId, at, durationMin, channel, result, transcript,
  audioUrl, by, leadSector, analysis, createdAt, updatedAt }
```

`analysis` (de `calls.analyzeTranscript` o del LLM, mismo shape):

```js
{ engine, summary, wants, pains[], objections[], buySignals[], lossSignals[],
  inferred[], services[], authority, budget, urgency, nextStep, followUp,
  scores:{interest,fit,close}, closeProbability, learnings[] }
```

## La capa de IA

`call-analysis` (Edge Function) usa **Gemini** (`gemini-2.0-flash`) si hay
`GEMINI_API_KEY` en los secrets — mismo patrón que `eco`/`taxonomy`. Sin clave,
red caída o respuesta inválida, el cliente cae al **analizador determinista
local** (`analyzeTranscript`), que da el mismo shape. El flujo nunca se rompe;
con clave, afina.

Para activar el LLM: añade `GEMINI_API_KEY` a los secrets del proyecto Supabase
y despliega `supabase functions deploy call-analysis`. Sin ese paso, el sistema
ya funciona con el motor local.

## Paso de escala — esquema relacional (NO creado todavía)

Cuando el volumen de llamadas lo justifique (miles de registros, consultas
analíticas pesadas), la colección `calls` migra a tablas relacionales. El
documento compartido seguiría llevando el estado vivo del CRM; las llamadas
pasarían a tablas indexadas. DDL de referencia (diseñado, pendiente de aplicar):

```sql
create table connect_leads (
  id text primary key,
  company text, sector text, phone text, email text, web text,
  city text, source text, status text, priority text, owner text,
  notes text, created_at timestamptz default now(),
  last_interaction timestamptz, next_action text
);

create table connect_calls (
  id text primary key,
  lead_id text references connect_leads(id) on delete cascade,
  at timestamptz default now(), duration_min int,
  channel text, result text, audio_url text, transcript text,
  by_name text, created_at timestamptz default now()
);

create table connect_call_analysis (
  id bigint generated always as identity primary key,
  call_id text references connect_calls(id) on delete cascade,
  engine text, summary text, wants text, authority text, budget text,
  urgency text, next_step text, follow_up text,
  interest int, fit int, close int, close_probability int,
  created_at timestamptz default now()
);

create table connect_objections (
  id bigint generated always as identity primary key,
  call_id text references connect_calls(id) on delete cascade,
  label text, quote text );

create table connect_pain_points (
  id bigint generated always as identity primary key,
  call_id text references connect_calls(id) on delete cascade,
  label text, quote text );

create table connect_opportunities (
  id bigint generated always as identity primary key,
  call_id text references connect_calls(id) on delete cascade,
  service text, note text );

create table connect_follow_ups (
  id bigint generated always as identity primary key,
  lead_id text references connect_leads(id) on delete cascade,
  due_at timestamptz, message text, done boolean default false );

create table connect_commercial_insights (
  id bigint generated always as identity primary key,
  kind text,            -- objection | pain | buy_phrase | loss_phrase | sector | price
  label text, count int, sector text,
  updated_at timestamptz default now() );
```

Todas con RLS activado sin políticas (acceso solo vía Edge Function con
`service_role`), igual que `connect_state` y `connect_ecos`. Los `analysis`
ya tienen exactamente esta forma, así que la migración es un volcado, no un
rediseño.

## Riesgos conocidos

- **Tamaño del documento compartido.** Las transcripciones son texto largo;
  miles de llamadas inflarían el JSON de `connect-state`. Mitigación: migrar a
  las tablas de arriba cuando el documento pase de ~1–2 MB.
- **Calidad del análisis local.** El fallback es honesto pero heurístico (léxico
  ES). Sube la `GEMINI_API_KEY` para análisis fino. Nunca inventa: sin señal,
  puntúa bajo y lo dice.
- **PII en transcripciones.** Son datos de clientes. El acceso ya está tras RBAC
  + RLS; al migrar a tablas, mantener el mismo cierre y considerar retención.
