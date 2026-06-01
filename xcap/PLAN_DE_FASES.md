# xcap / Capital — Plan de fases hasta "real con edge"

> Documento vivo. Mapa honesto del estado de Capital y la escalera de fases
> hasta un agente que pueda operar dinero real en Binance — **si y solo si**
> se gana el derecho en cada peldaño. Hereda la disciplina de los registros
> de cierre de Capital (`signal_quality_baseline_001_RESULT.md`,
> `CASE_002_EVAL.md`): pre-registro, gates que pueden fallar, prohibido
> declarar edge sin prueba out-of-sample, prohibido tocar dinero hasta el final.

---

## 0. La foto real de Capital (reconstruida desde las actas de cierre)

Capital **no es un bot**. Es un **sistema de investigación de trading** montado
como un *Agent Graph* de nodos, con una cultura de honestidad estructural poco
común. Lo que sabemos a partir de los dos documentos accesibles:

| Pieza | Estado documentado |
|---|---|
| **Nodo técnico** (Price Confirmation · momentum + volume) | **DEGRADADO.** `baseline_001` = INCONCLUSO: no distinguió tendencia de ruido. Fuera como motor principal. Prohibido optimizar/tunear/llevar a real. |
| **Nodo narrativo** (Narrative Agent) | Vivo, **sin validar**. 2 casos (CEG→watch, ATXG→reject). Buen rechazo cualitativo del hype, pero **outcome de precio sin verificar**, N=2, cero scoring cuantitativo. |
| **Harness de backtest** | Runner + replay determinista, `journal.jsonl`, `report.json`, `ReplayConfig(lookback_bars=60)`, métrica oficial *mean-of-datasets expectancy*. |
| **Datasets sintéticos** | `build_noise.py` / `build_trend.py`, con invariante de equivalencia byte-idéntico (drift=0 ⇒ trend reproduce noise). |
| **Deuda conocida** | Bug de duplicación del journal bajo verificación de determinismo (×2 en pooled; la métrica oficial es inmune). |
| **Dominio de la evidencia** | **Renta variable US dirigida por noticias** (PRNewswire, tickers CEG/ATXG, micro/small-caps). **Nada de cripto/Binance.** |
| **Capa de ejecución / broker** | **No existe**, por regla explícita del propio sistema. |

**Lectura honesta:** Capital hoy es un **banco de pruebas con una hipótesis sin
validar**, no un agente rentable. El único componente medido falló en mostrar
edge; el otro tiene 2 casos cualitativos. El salto a "un banco que opera solo en
Binance real" es enorme — y el propio Capital ya lo dice.

### Lo que falta para tener la foto completa
No accesible desde esta sesión (vive en terminales/Mac o chats): el código real
(`runner`, `build_*.py`, el grafo), `CASE_001`, `TEMPLATE_FINAL`,
`CURATION_PROTOCOL`, y el spec del Agent Graph. Este plan se reconstruye desde
las **actas de cierre**; se afinará cuando llegue el código o los docs que faltan.

### La cuestión de dominio (equities → cripto)
Lo que **transfiere** a Binance no es un edge probado: es la **metodología** (el
harness disciplinado, el grafo de nodos, el protocolo de validación ciega con
outcomes sellados). El nodo narrativo *podría* transferir bien — cripto es
intensamente narrativo (listings, partnerships, unlocks, anuncios) — pero la
microestructura "press release → small-cap" no se traslada literal. **Se asume
que hay que re-validar desde cero sobre datos de cripto.**

---

## 1. Principio rector (no negociable en ninguna fase)

> Probabilidad de éxito **probada** por encima del volumen y de la prisa.
> Cada peldaño tiene un *gate* que puede fallar. "No lo sé" nunca se infla.
> No se declara edge sin prueba **out-of-sample**. No se toca dinero real hasta
> que un nodo haya batido a sus baselines triviales fuera de muestra.

Si una fase no pasa su gate, **no se avanza** — se degrada el componente y se
itera o se mata. Igual que `baseline_001`.

---

## 2. Las fases

### Fase 0 — Cimiento: reconstruir el harness (esqueleto Python limpio)
**Objetivo:** un banco de pruebas honesto que corra un experimento
pre-registrado de punta a punta y emita un informe inmune a auto-engaño.
**Construye:**
- Repo/carpeta `xcap/` Python, 0 dependencias de trading en runtime al principio.
- *Agent Graph* como scaffold: nodos = funciones puras, salida tipada
  (opportunity card: tesis, scores, decisión, invalidación).
- Runner + replay **determinista**, `journal.jsonl`, `report.json`, extractor de
  *mean-of-datasets expectancy* — **con el bug de duplicación corregido de raíz**
  (dedupe por `replay_id` / una sola pasada).
- `build_noise.py` / `build_trend.py` con el **invariante de equivalencia** como
  test (drift=0 ⇒ idéntico). El gate de tests manda: nada se mergea en rojo.
- **Sin broker. Sin claves. Sin dinero real.** (Regla heredada de `baseline_001`.)

**Gate:** reproduce la línea base conocida (p.ej. `noise_99 = 4 trades`) y el
informe sale honesto. Método de arranque elegido: **reconstruir desde los docs**.

### Fase 1 — Re-instaurar el protocolo de validación, sobre datos de cripto
**Objetivo:** poder evaluar el sistema sobre Binance sin tocar ejecución.
**Construye:**
- Ingesta de **OHLCV público de Binance** (REST/websocket de klines —
  **read-only, sin API key**). Cacheado y versionado.
- Re-creación de `TEMPLATE_FINAL` + `CURATION_PROTOCOL` para cripto: unidad de
  análisis = "momentos" (listings, movimientos grandes, picos de funding,
  anuncios), con **outcome sellado** y **scoring ciego**.
- Pipeline de curación de casos (CASE_xxx) idéntico en espíritu al de equities,
  pero con outcomes de precio **verificables y verificados** desde el inicio.

**Gate:** ≥ N casos curados con outcome sellado y reproducible.

### Fase 2 — Validar el nodo narrativo en cripto, con outcomes verificados
**Objetivo:** el crux honesto. ¿Hay edge?
**Hace:**
- El agente decide **a ciegas** sobre cada caso; outcome se revela después.
- Comparación contra **baselines triviales**: always-watch, entrada aleatoria,
  buy-and-hold. Out-of-sample obligatorio.
**Gate:** bate a los baselines fuera de muestra **o el nodo queda DEGRADADO**
(misma regla que el detector técnico). Sin esto, **no hay Fase 4**.

### Fase 3 — Capa técnica/timing como *control*, nunca como cerebro
**Objetivo:** rescatar el detector técnico solo en su rol legítimo.
**Hace (según `baseline_001` §10):** fake-breakout control, random-entry control,
buy-and-hold comparison, historical real-trend-days. Es timing, no motor.
**Gate:** pasa los controles o sigue fuera del grafo de decisión.

### Fase 4 — Riesgo + ejecución simulada (paper) en Binance **Testnet**
**Objetivo:** circuito completo con cero euros en riesgo. **Solo si Fase 2 pasó.**
**Construye:**
- Motor de riesgo: sizing, **caps duros** (posición máxima, stop de pérdida
  diaria, kill-switch), límites por activo.
- Ejecución contra **Binance Testnet** (ccxt) — ciclo completo de órdenes,
  dinero de juguete. Medición de expectancy **en vivo** vs backtest.
**Gate:** la expectancy en vivo (out-of-sample en el tiempo) no se desploma
respecto al backtest.

### Fase 5 — Capital real mínimo, fuertemente gateado
**Objetivo:** primera exposición real, diseñada para no doler. **Solo si Fase 4
aguantó out-of-sample.**
- API key **sin permiso de retirada** (jamás). Secretos en entorno, nunca en repo.
- Tamaño micro. Kill-switch por pérdida diaria. Halt automático ante *drift*.
- Escalar **solo** con números sostenidos y defendibles.

### Fase 6 — "Banco" / autonomía
El endpoint, no el principio. Un agente lo bastante solvente como para correr con
supervisión mínima — **ganado, no declarado**. Ambiciones de market-making /
"ser la casa" viven aquí, condicionadas a todo lo anterior.

---

## 3. Riesgos que se nombran, no se esconden

- **Transferencia de dominio:** el edge (si lo hubo) era equities-noticia; cripto
  es otro animal. Se re-valida desde cero.
- **El edge narrativo está sin probar.** N=2 cualitativo no es nada todavía.
- **Apalancamiento (Futures):** amplifica errores a velocidad de máquina. Spot
  primero; Futures solo con caps brutales y edge probado.
- **Autonomía = el último y más peligroso paso.** "Soltar a operar" sin
  supervisión es Fase 6, no Fase 1.
- **Regulación/fiscalidad:** operar real tiene implicaciones legales/fiscales que
  son decisión tuya, fuera del alcance del código.

---

## 4. Estado de ejecución (vivo)

| Fase | Estado |
|---|---|
| 0 — Reconstruir harness | ⏳ Siguiente, a tu OK (método: reconstruir desde docs) |
| 1 — Protocolo sobre cripto | ⏳ |
| 2 — Validar narrativo (cripto, outcomes) | ⏳ |
| 3 — Técnica como control | ⏳ |
| 4 — Riesgo + paper (Testnet) | ⏳ |
| 5 — Capital real mínimo | ⏳ |
| 6 — Banco / autonomía | ⏳ |

> Próximo paso a decidir por ti: arrancar **Fase 0** (esqueleto Python desde los
> docs) o esperar a traer el código real de Capital para afinar este plan antes
> de construir.
