-- =============================================================================
-- MACMA CORE — esquema de base de datos (DESTINO, no aún desplegado).
--
-- El MVP guarda todo en localStorage por usuario (src/macma.js). Esto documenta
-- a dónde va cuando MACMA necesite servidor: cada entidad PRIVADA por usuario,
-- nunca visible al equipo (a diferencia de connect_state, que sí es compartido).
--
-- Principio rector: la materia prima de una persona — su biografía, sus miedos,
-- sus conflictos — es lo más íntimo del sistema. RLS estricta: una fila solo la
-- ve y la escribe su dueño. Ni siquiera un admin del equipo la lee.
--
-- Las puntuaciones y patrones (macma_identity_scores, macma_patterns) son
-- DERIVADOS: hoy se calculan en vivo desde la biografía (macma-engine.js). Se
-- materializan en tabla solo cuando un modelo de IA los genere y convenga
-- cachearlos. Marcadas con `-- [IA]`.
--
-- Aplicar con: supabase migration new macma_core  (y pegar este contenido).
-- =============================================================================

-- Perfil: el contenedor. Uno por usuario.
create table if not exists macma_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  voice_linked  boolean not null default false,   -- enlace con Voz ID (EC · Eco)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id)
);

-- Biografía: la materia prima. Cada fila es un fragmento con un ángulo (kind).
create table if not exists macma_biographies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null default 'free',       -- life-event | failure | success | relationship | leadership | fear | ambition | free
  prompt      text,
  body        text not null,
  source      text not null default 'text',       -- text | voice
  voice_ref   uuid,                                -- futura referencia a la nota de voz (función eco)
  created_at  timestamptz not null default now()
);
create index if not exists macma_bio_user_idx on macma_biographies (user_id, created_at desc);

-- [IA] Puntuaciones de identidad — DERIVADAS. Hoy se calculan en vivo; esta tabla
-- solo cobra sentido cuando un modelo las genere y cachee. Una fila por lectura.
create table if not exists macma_identity_scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  scores        jsonb not null,                   -- { vision, execution, communication, ... } 0–100
  confidence    int not null default 0,           -- 0–100: cuánta materia prima sostiene la lectura
  model         text,                             -- qué generó la lectura (heurística | nombre del modelo)
  computed_at   timestamptz not null default now()
);
create index if not exists macma_scores_user_idx on macma_identity_scores (user_id, computed_at desc);

-- [IA] Patrones observados — DERIVADOS. Fortalezas, cuello de botella, riesgo,
-- punto ciego, oportunidad, siguiente habilidad. Lenguaje SIEMPRE tentativo.
create table if not exists macma_patterns (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  payload         jsonb not null,                 -- { strengths[], bottleneck, blindSpot, risk, opportunity, nextSkill }
  confidence_level text,                           -- baja | media | alta
  computed_at     timestamptz not null default now()
);

-- Conflictos: lo que el usuario describe + el análisis devuelto (claridad, no juicio).
create table if not exists macma_conflicts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  body        text not null,
  analysis    jsonb,                               -- { facts[], assumptions[], emotional[], operational[], misunderstanding, conversation[], action }
  created_at  timestamptz not null default now()
);
create index if not exists macma_conflicts_user_idx on macma_conflicts (user_id, created_at desc);

-- Retos diarios: uno al día. El registro alimenta la racha de evolución.
create table if not exists macma_challenges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         date not null,
  body        text not null,
  dimension   text,                                -- dimensión que aborda (cuello de botella)
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, day)
);

-- ---------------------------------------------------------------------------
-- RLS — privacidad por usuario. Una fila solo la ve y la toca su dueño.
-- ---------------------------------------------------------------------------
alter table macma_profiles       enable row level security;
alter table macma_biographies    enable row level security;
alter table macma_identity_scores enable row level security;
alter table macma_patterns       enable row level security;
alter table macma_conflicts      enable row level security;
alter table macma_challenges     enable row level security;

-- Política idéntica para todas: dueño = auth.uid(). (Repetir por tabla.)
do $$
declare t text;
begin
  foreach t in array array[
    'macma_profiles','macma_biographies','macma_identity_scores',
    'macma_patterns','macma_conflicts','macma_challenges'
  ] loop
    execute format($f$
      create policy %1$s_owner_select on %1$s for select using (user_id = auth.uid());
      create policy %1$s_owner_write  on %1$s for all    using (user_id = auth.uid()) with check (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;
