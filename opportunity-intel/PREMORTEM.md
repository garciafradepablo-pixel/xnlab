# Connect · 01 ↔ XN — Premortem, auditoría y dirección (ciclo MMXXVI)

> Documento vivo. Acompaña a `AUDITORIA_Y_FASES.md` (que se ha quedado algo
> desfasado) y mira más allá del código: **por qué podría fracasar esto**, qué
> dice la auditoría hoy, dónde está la competencia y el entorno, y qué exige la
> dirección interna. Honestidad estructural también aquí: lo que no sabemos, se
> dice.

---

## 1. Premortem — estamos en MMXXVII y Connect se abandonó. ¿Por qué?

No imaginamos un fallo técnico espectacular. Imaginamos lo más probable: que la
herramienta se quede **sin uso** y muera por inercia. Causas ordenadas por
probabilidad real, cada una con su **señal temprana** y su **antídoto**.

| # | Causa de muerte | Señal temprana (vigílala) | Antídoto |
|---|---|---|---|
| **PM1** | **Nadie cierra el bucle.** El motor predice, pero entran pocos resultados reales de llamada → la calibración no aprende → sigue siendo opinión con barniz de dato. | Semanas sin "Registrar resultado". Índice de Éxito sin moverse. | Ritual semanal: cada llamada, su resultado. El aprendizaje es el único foso defendible (ver §4). |
| **PM2** | **Los datos reales nunca salen del gris.** El piloto investigado tiene techo ~80 porque media señal está sin verificar. Leads no accionables → desconfianza → se deja de abrir. | Top del ranking estancado bajo 80. Muchos puntos grises en las fichas. | Terminar Fase 3 (enriquecimiento desde la web) y Fase 4 (detección de momento). Es el desbloqueo de valor #1. |
| **PM3** | **La mesa compartida diverge.** `connect_state` existe (v16), pero buena parte del estado sigue en `localStorage` por navegador. Pablo y Javi ven cosas distintas → discuten el dato en vez de usarlo. | "A mí no me aparece ese lead." Estados que no cuadran entre los dos. | Completar Fase 1: que CRM, verificaciones y aprendizaje vivan en servidor con resolución de conflictos clara, no solo las cuentas. |
| **PM4** | **Una regresión silenciosa rompe producción.** `app.js` es un monolito (~1.500 líneas) **sin tests de UI**. El gate solo prueba el motor. Un cambio de UI tumba el login y nadie lo caza hasta que Javi no puede entrar. | Ya pasó una vez con el login. Cambios de UI que "parecen ir" en local. | Fase 2: smoke test headless (montar `app.js` en jsdom, render login/ranking/caso, disparar handlers) al gate. Partir `app.js` por vistas. |
| **PM5** | **Incidente de seguridad / cuota.** Las 3 Edge Functions son abiertas (`verify_jwt:false`); `discover` puede ser invocada por cualquiera → factura de Google Places. Hash sin estiramiento y tokens sin caducidad si la BD se filtra. | Pico de invocaciones en `discover`. Coste Places inesperado. | Rate-limit + origen en `discover`; tokens con expiración; migrar el hash a bcrypt/argon (ver §3). |
| **PM6** | **Pulimos en vez de distribuir.** Cero clientes entraron *por* Connect porque el tiempo se fue en estética y features, no en llamar. La herramienta se vuelve un fin, no un medio. | Muchos commits de pulido, cero diagnósticos agendados atribuibles. | Métrica norte (§6): diagnósticos agendados/semana vía Connect. Si no sube, parar de construir y empezar a llamar. |
| **PM7** | **Bus factor = 1.** Una persona sostiene el conocimiento del motor. Si se va o se satura, nadie lo evoluciona. | Solo una persona toca `scoring/calibration`. | Documentar el modelo (ya empezado), y que el segundo admin haga al menos un cambio guiado al motor. |

**Lectura de conjunto:** el riesgo dominante **no es técnico, es de uso y de
foco** (PM1, PM2, PM6). La tecnología ya está sorprendentemente madura para un
equipo de dos. Lo que mata proyectos así es que el volante de aprendizaje nunca
arranca y que se construye en lugar de vender.

---

## 2. Auditoría al día — qué ha cambiado desde `AUDITORIA_Y_FASES.md`

El documento de fases marca H3/H4 como abiertos. **Ya no del todo:**

- **H3 (estado compartido)** — parcialmente resuelto: existe `connect_state` y la
  "mesa de trabajo compartida" (v16). Falta llevar *todo* el estado operativo
  (CRM, verificaciones, aprendizaje), no solo cuentas. **Estado: en curso, no abierto.**
- **H4 (auth real)** — muy avanzado: cuentas durables en `connect_users`, **RBAC
  con roles reforzado en servidor** (v17), login *remote-first* con token y
  **cambio de contraseña** (v17.1). Falta robustez criptográfica (§3).
  **Estado: funcional; queda el endurecimiento.**
- **H6 (accesibilidad)** — ya no es "casi nula": hay **foco visible por teclado,
  `prefers-reduced-motion`, foco de formulario unificado y cursores de
  deshabilitado** (pase de pulido reciente). Falta ARIA/roles y un repaso con
  lector de pantalla. **Estado: a medias.**
- **Nuevo activo:** **vista de caso a pantalla completa** (panel de mando por
  oportunidad, con firma de marca). Eleva la percepción de producto.

**Sigue abierto y duele:** H1 (monolito `app.js`), H2 (sin tests de UI), H7
(datos en gris), H8 (descubridor no persiste), H9 (sin telemetría real), H10
(bundle ~480 KB). De estos, **H2 y H7 son los que más arriesgan el negocio.**

---

## 3. Seguridad — hallazgos en vivo (Supabase advisors + funciones)

Comprobado contra el proyecto real, no estimado:

1. **RLS activado pero SIN políticas** en `app_config`, `connect_state` y
   `connect_users`. Efecto: el acceso directo con la clave publishable está
   denegado por defecto (bien), pero **toda la autorización descansa en la lógica
   de las Edge Functions**, que usan service-role y **se saltan RLS**. No hay
   defensa en profundidad: un solo fallo de lógica = acceso total.
   → [database-linter 0008](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
2. **Las 3 Edge Functions con `verify_jwt:false`** (`discover`, `users`,
   `connect-state`). Sin auth de plataforma; solo el token propio. `discover`
   abierta = **riesgo de abuso de cuota** (factura Google Places por invocación).
3. **Hash de contraseña = SHA-256(sal + pass), sin estiramiento.** Rápido de
   fuerza bruta si la tabla se filtra. Debería ser bcrypt/argon2/PBKDF2.
4. **Tokens de sesión sin caducidad visible.** Bearer largos = si se filtra uno,
   vale indefinidamente. Añadir expiración + rotación.

**Prioridad realista** (equipo de 2, datos no sensibles aún): no es urgencia roja,
pero **(2) rate-limit de `discover`** evita un susto en la factura, y **(3)+(4)**
son baratos de endurecer antes de meter datos de clientes reales. RLS con
políticas puede esperar mientras todo pase por funciones, pero conviene anotarlo.

---

## 4. Competencia y entorno

**El campo:** Apollo, Clay, ZoomInfo, Cognism (datos + secuencias); Instantly,
Lemlist, Smartlead (outbound a volumen); Common Room, Koala, Default (señales de
intención). Todos mejor financiados y con más datos que nosotros. **No se gana
por volumen ni por base de datos.**

**Dónde Connect sí es distinto (y defendible):**
- **Momento, no empresa.** El sistema cualifica *por qué ahora*, no scrapea listas.
- **Lentes por sector.** Mide distinto a una clínica que a una promotora de lujo.
  Apollo/Clay son agnósticos; nosotros tenemos criterio.
- **Honestidad estructural.** El gris que no se infla genera confianza — lo
  contrario del enriquecimiento basura de la competencia.
- **Curaduría de élite + reparto 01/XN.** No es una herramienta genérica: está
  cosida a *este* negocio de dos marcas.
- **Guion + dossier en la voz propia.** Cierra de "a quién" a "qué decir".

**El riesgo del entorno:** estas categorías se están comoditizando con LLMs. Lo
que no se comoditiza es **tu dato de cierre** (quién compró de verdad y por qué) y
**tu criterio de marca**. Ahí está el foso. La tecnología de scoring es replicable
en un fin de semana; **la calibración con resultados reales de 01 y XN, no.**

---

## 5. Oportunidades (en orden de palanca)

1. **Cerrar el bucle de aprendizaje (PM1).** Es la única ventaja que crece con el
   tiempo y nadie puede copiar. Todo lo demás es tablestakes.
2. **Terminar enriquecimiento + momento (Fase 3/4).** Saca los datos del gris y
   convierte el agente en una fuente caliente sin trabajo manual.
3. **Telemetría de uso (H9).** Saber qué leads se llaman y cuáles convierten para
   que la calibración coma de datos de verdad, no de tres muestras ruidosas.
4. **Productizar para otros estudios (más adelante).** Connect podría venderse
   como servicio a otras agencias-atelier. Tentador, pero **no antes** de probar
   que cierra clientes para nosotros: distribución antes que plataforma.

---

## 6. Estructura y dirección interna

**Composición:** equipo de 2 (Pablo, Javi), **ambos `admin`**. El RBAC tiene 4
roles (admin/editor/viewer/analyst) pero no se usa la gradación — todos pueden
borrar y gobernar. Para dos personas de confianza es defendible, pero:
- **No hay separación de poderes** ni rol de solo-lectura para un futuro tercero
  (becario, comercial externo). Está construido; falta usarlo.
- **Bus factor 1** en el motor (PM7).

**Modelo de trabajo:** ChatGPT diseña prompts ↔ Claude Code ejecuta. Ágil, pero
sin un **dueño de producto único** que diga no, el riesgo es deriva: muchas
features, poca dirección. La regla rectora ("claridad y probabilidad de éxito por
encima del volumen") es excelente — el problema es que **no hay una métrica que la
haga cumplir.**

**Lo que falta para dirigir, no solo construir:**
- **Una métrica norte:** *diagnósticos agendados por semana atribuibles a Connect.*
  Si no sube, ninguna feature importa.
- **Un "definition of done" por fase** que incluya "se usó en una llamada real".
- **Un ritual de cierre de bucle** (cada llamada → su resultado en la ficha).
- **Un dueño** que priorice distribución sobre pulido cuando ambos compitan.

---

## 7. Mejoras priorizadas (impacto / esfuerzo / riesgo)

| Prioridad | Mejora | Resuelve | Impacto | Esfuerzo |
|---|---|---|---|---|
| **P0** | Smoke test de UI en el gate (jsdom: render login/ranking/caso + handlers) | H2, PM4 | Alto | Bajo |
| **P0** | Rate-limit + verificación de origen en `discover` | Seg. (2), PM5 | Alto | Bajo |
| **P1** | Terminar Fase 3 (enriquecer desde la web) — sacar leads del gris | H7, PM2 | Muy alto | Medio |
| **P1** | Ritual + recordatorio de "registrar resultado" (cerrar el bucle) | PM1 | Muy alto | Bajo |
| **P1** | Tokens con expiración + hash a bcrypt/argon | Seg. (3,4) | Medio | Bajo |
| **P2** | Llevar CRM/verificaciones/aprendizaje a `connect_state` (no solo cuentas) | H3, PM3 | Alto | Medio |
| **P2** | Partir `app.js` por vistas | H1, PM4 | Medio | Medio |
| **P3** | Telemetría de uso real (qué se llama/convierte) | H9, PM1 | Alto | Medio |
| **P3** | Fase 4 — detección de momento (prensa/BORME/rondas) | PM2 | Muy alto | Alto |

---

## 8. La frase que lo resume

> Connect ya es bueno detectando. El próximo año no se gana construyendo más, sino
> **cerrando el bucle**: que cada llamada real alimente al motor, que los datos
> salgan del gris, y que una sola métrica — diagnósticos agendados — gobierne la
> dirección. La ballena azul ya sopla; falta medir el chorro.
