# P0 · Plan de fusión ejecutable — reconciliar el fork de Connect

> **Estado:** plan, NO ejecutado. La fusión a `main` espera tu visto bueno.
> **Decisión de dirección ya tomada:** Connect va a **chat + presencia en vivo**
> (no a solo-asíncrono). Este documento dice cómo traer eso a `main` sin
> destruir lo que el otro agente añadió (Agenda, Dossiers, Muelle).

## El problema en una frase

Mientras la rama `claude/admin-roles-team-tagging-Q7A2d` añadía **Tareas, Drive,
Presencia y Activity Feed (chat vivo)**, `main` corrió 25 commits a **v49** por la
dirección **opuesta**: comunicación asíncrona *sin chat* (Muelle/posits), más
Agenda, Dossiers de formación, horarios y el tipo de cuenta "Vendedor para Dani".

Una fusión a ciegas produce un Frankenstein (chat **y** Muelle conviviendo) o
borra trabajo. Hay que fusionar **con criterio**, archivo por archivo.

## Decisiones humanas que bloquean la fusión

1. **Dirección de comunicación** → ✅ DECIDIDO: chat + presencia en vivo.
2. **¿Qué pasa con el Muelle (posits) de `main`?** → PENDIENTE. Tres opciones:
   - **(A) Absorber su valor, retirar lo redundante (recomendado).** El
     *pulse strip* de "Hoy" (racha 🔥 / acciones ⚡ / reconocimiento 🚀) es
     genuinamente bueno y barato — se queda. Los posits como buzón asíncrono se
     solapan con chat+feed → se retiran o se pliegan dentro de "Mejoras".
   - (B) Coexisten: posits = reconocimiento async, chat = directo. Más superficie.
   - (C) Fuera el Muelle entero. Pierde el pulse strip (mala idea).
3. **Agenda vs Tareas.** `main` añadió "Agenda" (agenda de llamadas de Dani);
   la rama añadió "Tareas". **No compiten** — Agenda = llamadas programadas,
   Tareas = quién hace qué. Ambas se quedan en la zona "Trabajar".

## Estrategia general

Fusionar **`origin/main` dentro de la rama** (no al revés), resolver ahí con la
suite de tests como puerta, y solo entonces `main` avanza por fast-forward. Así
`main` nunca queda a medias.

```
git checkout claude/admin-roles-team-tagging-Q7A2d
git merge --no-commit --no-ff origin/main   # entra en conflicto a propósito
# resolver (ver tabla) → npm test → commit → push rama
# luego, con tu OK: main fast-forward a la rama
```

## Resolución archivo por archivo (5 conflictos)

| Archivo | Conflicto | Resolución |
|---|---|---|
| `package.json` | script `test`: cada lado añadió sus tests | **UNIÓN.** Mantener todos: `agenda`, `posits` (main) + `tasks`, `drive`, `presence`, `activity` (rama) |
| `src/store.js` | constantes de clave: `TASKS_KEY` (rama) vs `TRAIN_KEY`,`SCHED_KEY` (main) | **UNIÓN.** Las tres claves coexisten; son colecciones distintas del doc |
| `src/ui/styles.css` | bloques CSS añadidos a la cola | **UNIÓN.** Concatenar ambos bloques |
| `supabase/functions/users/index.ts` | main añadió manejo de "tipo de cuenta Vendedor" en invitaciones | **TOMAR MAIN.** Es más nuevo y es la feature de Dani. Verificar después que los endpoints que la UI de la rama llama (`setUserTags`, `setUserTier`, `setUserRole`) siguen existiendo |
| `src/ui/app.js` | 8 hunks (ver abajo) | Caso por caso |

### Los 8 hunks de `app.js`

| Hunk | Qué chocan | Resolución |
|---|---|---|
| Config panel | main lo envuelve en `allow("manage_roles")` | **TOMAR MAIN** (superset: oculta config técnica a no-admins) |
| Invite UI | main: `ACCOUNT_TYPES` (Vendedor/Analista/Lectura) | **TOMAR MAIN** (feature de Dani, más rica) |
| Invite labels | copy del selector de invitación | **TOMAR MAIN** (coherente con lo anterior) |
| **ZONES** | main: work=Hoy+Agenda, +Muelle, +Saber(Dossiers), team=solo Usuarios. rama: work=Hoy+Tareas, team=Ahora/Chat/Mejoras/Privados/Drive/Productividad | **UNIÓN dirigida:** work = Hoy+**Tareas**+**Agenda**; mantener Captar/Cerrar; añadir **Saber**(Aprendizaje+Dossiers); zona **Equipo** = la de la rama (Ahora/Chat/Mejoras/Privados/Drive/Feed/Productividad) + Usuarios(admin). Muelle → según decisión 2 |
| Dispatch (`state.view===`) | main: agenda/training/muelle. rama: tasks/chat/board/dms/drive/presence/(activity) | **UNIÓN.** Todos los `else if`. Si decisión 2A: quitar la rama de `muelle`, conservar el pulse strip moviéndolo a Hoy |
| tierLabel/openTagEditor vs muelle helpers | ambos añaden funciones distintas | **UNIÓN.** Conservar las dos familias de funciones (no chocan en realidad) |
| Case bar | main rediseñó cabecera de ficha (`case-subject`: empresa como sujeto). rama: botón "Compartir" | **FUSIÓN MANUAL.** Tomar `case-subject` de main **y** conservar el botón Compartir de la rama dentro de la nueva barra |

### El pulse strip de "Hoy" (decisión 2A)

Si se retira el Muelle, **no perder** `todayPulseStrip()`: mover la función a la
vista "Hoy" y alimentar racha/acciones desde lo que ya hay (`productivity`,
`tasks`). El "reconocimiento 🚀" puede colgar de una reacción del chat en vez de
un posit. Es la pieza de mayor valor del trabajo de `main`.

## Puerta de calidad (obligatoria antes de tocar `main`)

```
npm test            # toda la suite verde, incluidos agenda/posits/tasks/drive/presence/activity
node bin/bundle.mjs --out /tmp/app.html   # el bundle de un archivo compila
```

Si algo falla, **se para aquí**. `main` nunca recibe una versión rota (es la
razón de ser del workflow de deploy: tests = puerta).

## Backend tras la fusión

Las Edge Functions ya desplegadas (drive, presence, activity) son **aditivas** y
ya están vivas; la fusión de código no las redespliega. La de `main` para Agenda/
Dossiers/horarios (si las tiene) ya están en producción. **Verificar** que
ninguna función que la UI fusionada llama quedó sin desplegar.

## Orden de ejecución (cuando des el OK)

1. `git merge --no-commit --no-ff origin/main`
2. Resolver según las tablas de arriba.
3. `npm test` + bundle. Verde obligatorio.
4. `git commit` (narrativa editorial corta).
5. `git push` a la rama.
6. **Tu OK explícito** → `main` fast-forward a la rama.
7. Pages publica desde `main`. Tareas+Drive+Presencia+Feed llegan al equipo.
8. Invitar a Dani.

## Lo que NO hace este plan

- No borra los redirects/legados (no aplica aquí, es Connect, no el site).
- No toca `main` sin tu OK explícito (paso 6).
- No decide el destino del Muelle por ti (decisión 2).
