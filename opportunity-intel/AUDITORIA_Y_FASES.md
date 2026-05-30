# Connect · 01 ↔ XN — Auditoría y hoja de ruta (10 fases)

> Documento vivo. Auditoría técnica honesta del estado actual y diez fases de
> mejora ordenadas por impacto. Fecha de auditoría: ciclo MMXXVI.

---

## 0. Qué es Connect, en una frase

Un motor de inteligencia de oportunidades que **detecta momentos de negocio**
(no scrapea empresas), los **evalúa con una vara conservadora que aprende**, los
**reparte entre 01 Agency y XN LAB**, y los entrega como **clientes priorizados
por probabilidad de éxito** — todo en una app instalable que se actualiza sola.

## 1. La foto del sistema (medido, no estimado)

| Métrica | Valor |
|---|---|
| Líneas de código (src) | **~6.560** |
| Módulos | **19** (motor, datos, UI, conectores) |
| Tests automáticos | **212 checks** en **9 suites**, 100% verdes |
| Commits en `main` | **90** |
| `console.log` sueltos en producción | **0** |
| Dependencias de runtime | **0** (ES modules nativos, sin framework) |
| Backend | Supabase: Edge Function `discover` + tabla privada de secretos |
| Despliegue | GitHub Pages, **auto-deploy gateado por tests** en cada push |
| Formato de entrega | App modular + **un solo archivo** + **lanzador auto-actualizable** + PWA |

**Lo que ya es de verdad fuerte:**
- Motor de scoring **puro y testeado** (10 filtros, colores de señal, evidencia
  con tiers, caps de descarte) — defendible lead a lead.
- **Aprendizaje real**: calibración de pesos por filtro + Índice de Éxito que se
  corrige con cierres reales, con resolución fina (~0,5%) y guardarraíles.
- **Lentes por sector**: el mismo motor mide distinto a una clínica que a una
  promotora de lujo. Versatilidad que Apollo/Clay no tienen.
- **Conector 01↔XN** con valor de cartera, **CRM**, **verificación** que sube la
  puntuación con evidencia citada, **frescura** (anti-empresas muertas),
  **dificultad de conexión**, **agente** que no para hasta entregar, **radar de
  percepción** que explica qué piensa, y **usuarios con color de firma**.
- **Honestidad estructural**: "no lo sé" (gris) nunca se infla; el sistema dice
  lo que no sabe.

## 2. Hallazgos de la auditoría (lo flojo, sin maquillar)

| # | Hallazgo | Riesgo | Severidad |
|---|---|---|---|
| H1 | `app.js` es un monolito de **1.181 líneas / 83 funciones** | Difícil de mantener y testear | Alta |
| H2 | **La UI no tiene tests automáticos** (solo el motor) | Una regresión visual no la caza el gate | Alta |
| H3 | **Sin backend de datos compartido**: todo en `localStorage` por navegador | Pablo y Javi no ven el mismo estado | Alta |
| H4 | **Auth solo local**, contraseña con hash no criptográfico | No es login real; cuentas no portables | Media-alta |
| H5 | Clave pública Supabase **en el código** (es publishable, pero la Edge Function es abierta) | Posible abuso de cuota del descubridor | Media |
| H6 | **Accesibilidad casi nula** (sin roles ARIA, foco, navegación por teclado) | Excluye usos y baja calidad percibida | Media |
| H7 | Datos reales (`researched.js`) **enriquecidos a mano**; muchas señales en gris | Puntuaciones techo ~80 hasta enriquecer | Media |
| H8 | El descubridor del mapa **no persiste** lo encontrado entre sesiones/usuarios | Se re-descubre y se pierde trabajo | Media |
| H9 | Sin **telemetría** de uso real (qué se llama, qué convierte) más allá del log local | El aprendizaje se nutre de poco | Media |
| H10 | Bundle de **~480 KB** en un archivo (datos demo incluidos) | Carga algo pesada en móvil con red pobre | Baja |

---

## 3. Las diez fases de mejora

Ordenadas por **impacto sobre la prioridad del negocio** (claridad + probabilidad
de éxito amplificada), no por dificultad.

### Fase 1 — Cimientos compartidos (backend de datos real)
**Resuelve H3, H4, H8.** Mover estado (leads, llamadas, verificaciones, usuarios,
aprendizaje) a Supabase con RLS por usuario. Pablo y Javi ven y editan el mismo
pipeline en tiempo real. Auth real (Supabase Auth) manteniendo el color de firma.
*Resultado: deja de ser una app de un dispositivo y pasa a ser una herramienta de
equipo.*

### Fase 2 — Blindaje de calidad de la UI
**Resuelve H1, H2.** Partir `app.js` en vistas (cards/connector/crm/learning/…)
y añadir tests de render headless al gate (cada vista renderiza, cada acción
dispara su handler). *Resultado: se puede iterar rápido sin romper nada.*

### Fase 3 — Enriquecimiento automático de leads
**Resuelve H7.** Edge Functions que, dado un lead, leen su web (copyright,
booking, mobile), reseñas (dolor), LinkedIn (decisor) y prensa (momento) y
rellenan señales con cita. *Resultado: los leads suben de ~32 a 70+ solos; el
agente entrega oportunidades calientes sin trabajo manual.*

### Fase 4 — Señales de intención en vivo
Detección casi en tiempo real de "momentos" (aperturas, rondas, contrataciones,
cambios de web) por feeds/alertas. *Resultado: Connect avisa del momento antes
que la competencia — la esencia de "captar el momento, no la empresa".*

### Fase 5 — Vista "Hoy" (claridad ejecutiva) ✅ HECHA (v12)
Pantalla de entrada: las 3 mejores llamadas del día, el siguiente paso de cada
una, y el pulso del pipeline. *Resultado: cero fricción — abrir y saber a quién
llamar.* **Enviado:** `src/today.js` (lógica pura, 17 checks), tab "Hoy" por
defecto, pulso (vivas · por llamar · reuniones · cartera con reparto 01/XN), y
regla de venta cableada (una conversación viva se cierra antes que una fría).

### Fase 6 — Secuencias de seguimiento multi-toque
Tras "no contesta", Connect propone el siguiente toque (canal + cuándo + guion)
con recordatorio. *Resultado: cerramos el hueco frente a Apollo/Lemlist sin
perder nuestra selección de élite.*

### Fase 7 — Aprendizaje profundo del cierre
**Amplía H9.** Telemetría de resultados reales por sector/lente/servicio →
el Índice de Éxito y las lentes se recalibran con datos de verdad de 01 y XN.
*Resultado: con cada llamada, Connect predice mejor que nadie quién cierra.*

### Fase 8 — Sectores y lentes definibles desde la app ✅ HECHA (v11)
El usuario crea un sector nuevo (tatuaje, música…) y define su lente (qué pesa).
*Resultado: versatilidad total — Connect se adapta a cualquier nicho sin tocar
código.* **Enviado:** `src/customsectors.js` (53 checks), gestor de sectores en
"Buscar leads", consultas que alimentan al agente y lente que alimenta al motor.

### Fase 9 — Accesibilidad, rendimiento y pulido
**Resuelve H6, H10.** Roles ARIA, foco, teclado, contraste; separar datos demo
del bundle (carga diferida); auditoría Lighthouse. *Resultado: rápida, inclusiva,
nivel producto serio.*

### Fase 10 — Inteligencia generativa de guion y dossier ✅ HECHA (v13)
Generar, por lead y con su evidencia, el guion de llamada y un mini-dossier
listo para enviar — en la voz de 01/XN. *Resultado: de "a quién llamar" a "qué
decir y qué mandar", cerrando el círculo de captación a conversión.* **Enviado:**
`src/playbook.js` (16 checks). Botón "Guion" en "Hoy" y en cada ficha → apertura,
observación, oferta (SIN precio), cierre que agenda diagnóstico, objeción con
respuesta, mini-dossier y "huecos a confirmar". Prefiere la copia investigada del
lead; donde falta señal, lo dice — no inventa. Texto copiable listo para enviar.

---

## 3b. Estado de ejecución (vivo)

| Fase | Estado |
|---|---|
| 5 — Vista "Hoy" | ✅ Enviada (v12) |
| 8 — Sectores definibles | ✅ Enviada (v11) |
| 10 — Guion + dossier por lead | ✅ Enviada (v13) |
| 1 (parte: cuentas durables) — Login en backend | ✅ Enviada (v14): cuentas en Supabase, multi-dispositivo, con migración silenciosa de las locales |
| 6 — Secuencias de seguimiento | ✅ Enviada (v15): cadencia multi-toque (canal · cuándo · guion) + "Seguimientos para hoy" |
| 3 — Enriquecimiento automático de leads | 🔓 DESBLOQUEADA: Places API ya activa (devuelve 20 resultados). Falta el enriquecedor de web + detección de momento |
| 2 — Blindaje UI (partir `app.js` + tests de vista) | ⏳ |
| 1 — Backend compartido (Pablo y Javi mismo estado) | ⏳ Requiere decisión de infra |
| 4 — Señales de intención en vivo | ⏳ |
| 7 — Aprendizaje profundo del cierre | ⏳ |
| 9 — Accesibilidad + rendimiento | ⏳ |

**Móvil:** el ranking de 13 columnas que se recortaba por los lados ahora es de
tarjetas apiladas (empresa + confianza arriba, resto etiqueta→valor). Nada se
pierde. (v11)

## 4. Principio rector (no negociable en ninguna fase)

> Claridad y **probabilidad de éxito amplificada** por encima del volumen.
> Cada cifra es defendible. "No lo sé" nunca se infla. El sistema aprende del
> proceso y explica lo que piensa.
