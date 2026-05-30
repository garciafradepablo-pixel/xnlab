# Contexto del proyecto — para ChatGPT (copiloto de prompts para Claude Code)

> Pega este documento entero en ChatGPT al empezar. Sirve para que ChatGPT
> entienda el proyecto y te ayude a redactar **prompts de mejora** que luego
> ejecutas con Claude Code. ChatGPT **no edita el repo**: diseña los prompts;
> Claude Code los ejecuta. Trabajamos en paralelo.

---

## 0. Lo más importante en 6 líneas

- Hay **DOS apps en un mismo repo privado** (`garciafradepablo-pixel/xnlab`). No las mezcles.
  - **A) Sitio de marca XNLAB** (Next.js 16) en la raíz: `app/`, `proxy.ts`, `next.config.ts`. Reglas de marca MUY estrictas (ver §8).
  - **B) Connect / Opportunity Intel** en `opportunity-intel/`: herramienta **interna** de captación de leads. Es la que estamos mejorando ahora.
- Connect es **JavaScript vanilla** (ES modules nativos, **0 dependencias de runtime**, sin framework, sin build de bundler — un bundler propio en `bin/bundle.mjs`).
- Backend = **Supabase** (Edge Functions + Postgres). Frontend = **GitHub Pages**, auto-deploy **gateado por tests** en cada push.
- Filosofía: **honestidad estructural**. El sistema dice "no lo sé" (señal gris) y nunca infla. Las mejoras deben respetar esto.

---

## 1. Qué es Connect (la app B)

Un **motor de inteligencia de oportunidades**: detecta *momentos* de negocio (no scrapea empresas a ciegas), evalúa cada candidato con **10 filtros de cualificación** y una **vara conservadora que aprende** de cierres reales, reparte los leads entre las dos marcas (**01 Agency ↔ XN LAB**) y los entrega como un **Top-N priorizado por probabilidad de éxito**, cada uno con: tesis, evidencia citada, razón de *timing*, ángulo de llamada, guion y dossier.

Embudo de 6 etapas: `descubierto → enriquecido → filtrado → puntuado → preseleccionado → Top N final`.

Señales por filtro con color: **verde** (confirmado con evidencia), **amarillo** (indicio citado), **gris** (no se sabe — nunca puntúa como si supiera). Evidencia con *tiers* (1–3) según fuente.

---

## 2. Enlaces (todo lo accesible)

| Qué | Enlace / dato |
|---|---|
| **App en vivo (modular)** | https://garciafradepablo-pixel.github.io/xnlab/ |
| **App en vivo (un solo archivo, BUNDLE)** | https://garciafradepablo-pixel.github.io/xnlab/app.html |
| **Repo (privado)** | github.com/garciafradepablo-pixel/xnlab |
| **Rama de trabajo de Connect** | `claude/opportunity-intelligence-app-vxWfo` (el deploy también sale de `main`) |
| **Supabase — Project URL** | https://fecfncfkkgzazuetcllx.supabase.co |
| **Supabase — ref** | `fecfncfkkgzazuetcllx` |
| **Clave publishable (segura, ya está en el cliente)** | `sb_publishable_GtToYg33N8bT7T6O3OEmQw_Wu_hEvkS` |

> **TRUCO DE ACCESO PARA CHATGPT:** el repo es privado, pero **`app.html` es público y contiene TODO el código fuente inline** (el bundle mete cada módulo como `data:` URL en un importmap). Si quieres que ChatGPT lea el código real, dile: *"abre https://garciafradepablo-pixel.github.io/xnlab/app.html y léelo"*. Es la forma de darle acceso hasta donde se puede sin compartir el repo.

> El **service role key** de Supabase **NUNCA** sale del servidor. No lo pegues en ningún sitio. La publishable de arriba sí es pública (ya viaja en el cliente).

---

## 3. Arquitectura (app B)

- **Sin framework.** ES modules nativos (`import`/`export`). Entrada: `index.html` → `src/ui/app.js` → `mount()`.
- **Bundler propio** `bin/bundle.mjs`: inlinea CSS y mete cada módulo como `data:` URL en un `<importmap>` con specifiers `oi:<ruta>`. Produce `app.html` (un archivo, abrible sin servidor) + **PWA** + **lanzador auto-actualizable**.
- **Persistencia:** `localStorage` por navegador (estado de leads, CRM, calibración) **+** Supabase para lo que debe ser durable/compartido (cuentas de usuario).
- **Despliegue:** GitHub Actions `.github/workflows/deploy-opportunity-intel.yml`. En cada push a `main` o a la rama de Connect que toque `opportunity-intel/**`: corre `npm test` (PUERTA), construye bundle + snapshot + exports, publica en Pages. **Si un test falla, NO se publica nada.**
- **0 dependencias de runtime. 0 `console.log` en producción.**

### Mapa de módulos (`opportunity-intel/src/`)
- **Motor:** `scoring.js` (10 filtros, colores, tiers, caps), `calibration.js` (pesos que aprenden + Índice de Éxito), `lenses.js` (lentes por sector), `diagnosis.js`, `pipeline.js`, `models.js`.
- **Datos / candidatos:** `seed.js`, `data/`, `discovery.js` (conector Google Places vía Edge Function `discover` + directorio interno), `newlead.js`, `enrichment.js`, `enrich.js` (**nuevo**: enriquecimiento honesto desde la web del lead — base, aún sin UI).
- **Operación:** `store.js` (estado, CRM, verificaciones), `today.js` (vista "Hoy"), `playbook.js` (guion + dossier), `followups.js` (secuencias multi-toque), `services.js`, `export.js`, `customsectors.js`.
- **Cuentas:** `auth.js` (login, cache local, hash) + `usersync.js` (cuentas durables en Supabase).
- **UI:** `src/ui/app.js` (orquestador — **monolito de ~1.180 líneas, el punto más débil**), `card.js`, `dom.js`, `styles.css`.
- **Tests:** `test/*.test.mjs` (15 suites, motor puro). La UI **no** tiene tests aún.

---

## 4. Backend Supabase (detalle)

- **Edge Functions:**
  - `discover` — llama a Google Places (API key de Google vive como secreto en el server). Devuelve candidatos reales del mapa.
  - `users` — cuentas: acciones `register` / `login` / `list`. Hash = `SHA-256(salt + "::" + password)`, sal por usuario. `verify_jwt: false` (función abierta, protegida por lógica propia).
- **Tablas (schema `public`):**
  - `connect_users` (id uuid, name, name_lower, color, pass_hash, salt, created_at).
  - `app_config` (configuración/secretos del descubridor).
- **Tooling:** Claude Code tiene MCP de Supabase (deploy de funciones, SQL, logs, advisors). ChatGPT NO; ChatGPT solo razona y redacta prompts.

---

## 5. Estado del roadmap (10 fases — doc vivo en `AUDITORIA_Y_FASES.md`)

**Ya en producción:** motor de scoring testeado, aprendizaje (calibración + Índice de Éxito), lentes por sector, conector 01↔XN, CRM, verificación con evidencia citada, frescura (anti-empresas muertas), agente que no para, radar de percepción, **usuarios con login + color de firma**, **sectores propios desde la app**, ranking en móvil, **vista "Hoy"** (centro de mando), **guion + dossier** por lead, **cuentas durables en backend**, **secuencias de seguimiento multi-toque**.

**En curso ahora mismo:**
- **Fase 3 — Enriquecimiento honesto desde la web** (núcleo recién subido; falta Edge Function de fetch + botón manual + auto-enriquecido selectivo).
- **Fase 4 — Detección de momento** desde prensa / rondas de financiación / BORME (siguiente).

**Hallazgos abiertos de la auditoría (buenos objetivos de mejora):**
- H1 `ui/app.js` monolito (1.180 líneas) → modularizar.
- H2 UI sin tests → añadir tests de UI / smoke.
- H6 Accesibilidad casi nula (ARIA, foco, teclado).
- H7 Datos reales enriquecidos a mano → muchas señales en gris (techo ~80).
- H8 El descubridor del mapa no persiste lo encontrado.
- H9 Sin telemetría de uso real.
- H10 Bundle ~480 KB en un archivo.

---

## 6. Reglas que Claude Code DEBE respetar en Connect (app B)

1. **El gate manda:** todo cambio pasa `npm test` verde o no se despliega. Lógica nueva del motor → test nuevo.
2. **Honestidad:** nunca inventar señales verdes. Indicio citado = amarillo. Desconocido = gris. No inflar puntuaciones.
3. **Sin dependencias nuevas de runtime.** Vanilla ES modules. Sin frameworks, sin npm install para el cliente.
4. **Cirugía, no refactor gratis.** Cambios mínimos y defendibles. No reescribir lo que no se pide.
5. **Rama:** desarrollar en `claude/opportunity-intelligence-app-vxWfo`. No tocar la app de marca (raíz) salvo que se pida explícitamente.
6. **Bilingüe ES/EN** donde la UI lo sea: traducir por significado, no literal.

---

## 7. Cómo pedir mejoras (plantilla de prompt para Claude Code)

Pásale a ChatGPT esta plantilla para que rellene prompts de calidad:

```
CONTEXTO: App "Connect" (opportunity-intel/), JS vanilla, deploy gateado por tests.
OBJETIVO: <qué resultado de negocio quiero, no la implementación>
ALCANCE: solo <módulos/archivos>. No refactorizar nada más.
RESTRICCIONES: sin dependencias nuevas; mantener honestidad de señales;
  añadir/actualizar tests; pasar `npm test`; commit + push a la rama de Connect.
ENTREGA: <qué debo ver funcionando> + resumen corto de qué cambió y por qué.
VERIFICACIÓN: <cómo lo compruebo yo en la app en vivo>.
```

**Buenas primeras tandas para ChatGPT** (alto impacto, bajo riesgo):
- Terminar Fase 3 (botón "Enriquecer con su web" + auto-enriquecido selectivo de los candidatos top).
- H2: primer test de humo de la UI (montar `app.js` en jsdom y comprobar que renderiza login/ranking).
- H6: pase de accesibilidad en login y tarjeta (roles, foco, teclado).
- H8: persistir en Supabase lo que descubre el mapa.

---

## 8. La OTRA app (marca XNLAB, raíz) — solo para que ChatGPT no la confunda

Next.js 16. Reglas innegociables (resumen de `AGENTS.md`): estudio **anónimo** (sin nombre/foto de fundador), fundación **MMXXII**, **no es empresa registrada** (no inventar NIF/registro), footer mínimo, **minimalismo radical**, **sin precios públicos** (atelier por cita), `/contact` es la URL canónica, bilingüe ES/EN por significado, tipografía Inter + Cormorant italic, `proxy.ts` (no `middleware.ts`), CSP con nonce. **Estas reglas NO aplican a Connect** (Connect sí puede hablar de precio y venta interna).

---

## 9. Qué hay en vuelo ahora (para que estéis sincronizados)

- **Login arreglado**: las cuentas no se guardaban en el servidor; ahora viven en `connect_users`. Pablo y Javi ya entran desde cualquier dispositivo. (Credenciales internas se comparten aparte, no van en este documento.)
- **Fase 3 base** subida (enriquecimiento honesto, código aún inerte). Siguiente: cablearlo + Fase 4.
