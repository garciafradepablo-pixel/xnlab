# Connect · Arquitectura de producto

> Centro operativo interno de un atelier de ~6 personas. **No** es un CRM, ni un
> gestor de tareas, ni un chat: es donde el equipo encuentra todo en segundos sin
> abrir otra pestaña. Este documento fija la arquitectura, sus principios y su
> hoja de ruta — y, sobre todo, **lo que no se debe construir**.

## Principios

1. **Una única fuente de verdad.** Hoy parcialmente rota a nivel de producto (ver
   el fork chat-vs-async, `connect-merge-plan.md`). Resolver eso es P0.
2. **Menos superficie, mejor conectada.** El valor no son 12 módulos; es que 6
   personas no cambien de contexto. Tres líneas parecidas antes que una
   abstracción prematura.
3. **Reconstruye tu ventaja, enlaza lo genérico.** CRM + presencia + el saber del
   oficio son tuyos. Video, almacenamiento masivo, observabilidad de agentes →
   herramienta externa con un enlace. Cada módulo propio es mantenimiento eterno.

## 1 · La columna vertebral (y su techo)

| Capa | Mecanismo | Veredicto |
|---|---|---|
| Identidad/acceso | `users`: invites, roles, tiers, tags, token opaco 30d | Sólida. No tocar |
| Verdad operativa | `connect_state`: **un JSONB único** + polling con `rev` optimista | Elegante hoy, techo mañana |
| Dominios de volumen | tabla por dominio tras Edge Function (`chat`, `presence`, `drive`, `eco`, `activity`) | El patrón correcto |

> **Regla de arquitectura #1.** El doc compartido guarda solo el *working set* del
> CRM (oportunidades, pipeline, notas, config). Todo lo que cambia >1×/min o crece
> sin techo (mensajes, presencia, archivos, feed, leads crudos) **vive en su
> propia tabla tras una función**, nunca en el doc. Violarla reintroduce R2.

## 2 · Mapa: lo pedido vs. lo que ya existe (anti-duplicidad)

| Módulo pedido | Ya existe | Veredicto |
|---|---|---|
| Dashboard | `Hoy` (pulso personal) | Falta vista global → construir, fina, **sobre el Feed** |
| Presence Layer | ✅ `presence` | Extender: proyecto/cliente actual, rol, tiempo conectado |
| Internal Comm | `chat`/`mejoras`/DM | Reconciliar fork + menciones/reacciones |
| File Layer | ✅ `drive` (carpetas) | Unificar: adjuntos = referencia a Drive, no copia |
| Knowledge Engine | `eco`, `lab-records`, Dossiers | Ya hay 3 cosas solapadas → consolidar en "Dossier" |
| CRM | ✅ `crm`/`pipeline`/`proposal`/`contacts` | Maduro. Contratos/factura → externo de momento |
| Task Engine | ✅ `tasks` | + prioridad y flag de bloqueo. **No** grafo de dependencias |
| AI Agents | `autopilot`/`agent` | Panel coste/rendimiento = CORTADO (R3). Una línea en el Feed |
| Activity Feed | parcial (`productivity`) | **Construir** — pegamento de trazabilidad (Fase 1) |
| Search Layer | ⌘K (navegación) | Extender a búsqueda de contenido |
| Future (video, LangGraph) | — | Aparcar casi todo (R4) |

## 3 · Arquitectura objetivo (capas, no módulos sueltos)

```
SHELL          ⌘K Search · Activity Feed · riel de Presencia   ← transversales
TRABAJO        Hoy · Dashboard · Tareas · Agenda
CAPTAR/CERRAR  Oportunidades · CRM · Pipeline · Propuesta       ← el corazón
EQUIPO         Ahora · Chat · Privados · Drive · Saber · Feed
EDGE FUNCTIONS users · chat · presence · drive · eco · activity · …
DATOS          connect_state (CRM) + tablas por dominio
```

Búsqueda global, Feed y Presencia **viven en el shell**, no son pestañas: eso es
lo que de verdad reduce el cambio de contexto.

## 4 · Flujos clave

- **Presencia:** entras → latido cada 30s {estado, vista actual} → otros leen
  cada 15s → caída a offline a los 75s sin latido. Extensión: "vista" → "cliente
  abierto".
- **Comunicación:** mensaje → adjunto firma subida en Drive y guarda solo la
  *referencia* → `@mención` notifica vía presencia → reacción = fila ligera. El
  binario nunca se duplica.
- **Conocimiento:** sesión útil → `eco` destila → **aprobación humana** → Dossier.
  Un pipeline, no cuatro generadores.
- **Trazabilidad:** toda función que muta emite evento a `connect_activity` → el
  Feed lo lee. Append-only, una tabla.

## 5 · Dependencias (orden obligado)

```
Reconciliar fork (P0)
  └─ Presence v2
  └─ connect_activity ──> Activity Feed ──> Dashboard global
  └─ Chat: menciones/reacciones ──> Adjuntos (Chat × Drive)
  └─ Search v2 (necesita contenido indexable: chat+drive+crm)
```

Dashboard **no** antes que el Feed (es su materia prima). Search **no** antes que
existan los dominios.

## 6 · Riesgos — RED TEAM

- **R1 — Reconstruir Slack+Notion+Linear+Zoom+Salesforce para 6 personas.** El
  mayor riesgo. Reconstruye tu ventaja; enlaza lo genérico.
- **R2 — `connect_state` JSON único.** Bomba de relojería a escala. Mitigación:
  Regla #1.
- **R3 — Panel de AI Agents (coste/rendimiento).** Teatro para un atelier que no
  es ni empresa. CORTADO → una línea en el Feed.
- **R4 — Video/screen share/WebRTC propio.** Meses de infra, ROI negativo.
  CORTADO → botón a Meet/Whereby. *AI summaries* sí, vía `eco`.
- **R5 — Knowledge Engine cuádruple.** SOP/Playbook/Runbook/FAQ = un "Dossier"
  con etiqueta. No cuatro tablas.
- **R6 — Dependencias/bloqueos de tareas.** "Bloqueado por" es una etiqueta a 6
  personas, no un DAG.
- **R7 — Canales por proyecto.** General+Mejoras+DM ya cubre. Posponer.
- **R8 — Facturación/contratos.** No sois entidad legal aún; no inventar
  andamiaje. Externo por ahora.

## 7 · Prioridades

| Nivel | Qué | Por qué |
|---|---|---|
| P0 | Reconciliar fork (ver `connect-merge-plan.md`) | Sin esto nada se publica |
| P1 | Activity Feed + Presence v2 | Trazabilidad + materia prima del Dashboard |
| P2 | Chat: menciones/reacciones/adjuntos-vía-Drive | Cierra "la comunicación vive en Connect" |
| P2 | Dashboard global (sobre el Feed) | Vista de mando |
| P3 | Search v2 (contenido) | Cuando haya qué buscar |
| PARK | AI panel, video, LangGraph, canales-proyecto, task-DAG | R3/R4/R6/R7 |

## 8 · Roadmap

- **Fase 0 — Reconciliación (días).** Decidir Muelle + fusión por capas + publicar
  Tareas/Drive/Presencia/Feed. Entrar Dani.
- **Fase 1 — Trazabilidad (1–2 sem).** `connect_activity` + Feed + Presence v2.
- **Fase 2 — Comunicación viva (2–3 sem).** Menciones, reacciones, adjuntos. AI
  summaries vía `eco`.
- **Fase 3 — Mando (2 sem).** Dashboard global. Tarea prioridad/bloqueo. Search v2.
- **Fase 4 — Cuando duela.** Canales-proyecto, facturación, lo aparcado.

## 9 · Backlog listo para Claude Code

```
P0 ─ RECONCILIACIÓN  (ver connect-merge-plan.md)
[ ] Decidir destino del Muelle (decisión humana)
[ ] Fusión por capas rama→main; suite verde + bundle; publicar; invitar a Dani

P1 ─ TRAZABILIDAD
[x] Tabla connect_activity (append-only) + RLS sin políticas
[x] Edge fn `activity` (emit + feed)
[x] activity.js (lógica pura) + logActivity() + test
[x] activityFeed() view (agrupar por día, icono por verbo)
[ ] presence v2: cliente/proyecto actual en el beat + tiempo conectado
[ ] emitir actividad desde más puntos (lead nuevo, cliente actualizado, autopilot)

P2 ─ COMUNICACIÓN
[ ] chat: @menciones (parseo puro) + notificación vía presence
[ ] connect_message_reactions + acción react/unreact
[ ] adjuntos: composer → drive.requestUpload → mensaje guarda {path,name}
[ ] messageList: preview de adjunto (reusar fileKind de drive.js)

P3 ─ MANDO
[ ] dashboardView(): presentes, tareas críticas, pipeline, feed reciente, alertas
[ ] tasks.js: priority + blocked; sortTasks lo respeta
[ ] Search v2: índice en memoria sobre chat+drive+crm
```

Las marcas `[x]` se completaron en la Fase 1 inicial (este commit). El resto son
tickets del tamaño de un commit, cada uno con su test de lógica pura, siguiendo
el patrón `tasks`/`drive`/`presence`.
