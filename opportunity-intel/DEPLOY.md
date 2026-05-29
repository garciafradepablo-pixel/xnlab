# Desplegar la app (URL pública para el móvil)

La app es **100% estática** (HTML + módulos JS + CSS, sin build). Eso la hace
trivial de publicar y abrir desde el móvil de Pablo y Javi. El estado (leads
añadidos, llamadas, verificaciones, aprendizaje) vive en el navegador de cada
uno y se comparte con el botón **Exportar / Importar registro** (pestaña
Aprendizaje).

> Importante: ábrela siempre servida por HTTP(S), no como `file://` — los
> módulos ES no cargan desde `file://`. Cualquiera de las opciones de abajo sirve.

---

## Opción A — GitHub Pages (recomendada: gratis y se actualiza sola)

Ya está el workflow en `.github/workflows/deploy-opportunity-intel.yml`. Es un
**pipeline de actualización automática**: en cada push a `opportunity-intel/**`

1. **corre los tests** (puerta de calidad — si fallan, NO se publica nada);
2. **construye** la app y los artefactos;
3. **publica** en GitHub Pages.

Así la app del móvil se actualiza sola con cada mejora o lead nuevo, y nunca
recibe una versión rota.

Lo que queda publicado en la URL:

| Ruta | Qué es |
|---|---|
| `/` (`index.html`) | La app completa interactiva (la del día a día). |
| `/app.html` | La app en **un solo archivo**. |
| `/lanzador.html` | **Lanzador auto-actualizable** (ver abajo). |
| `/snapshot.html` | Vista estática rápida (sin JS). |
| `/leads/` | Export de los 20 mejores leads (CSV, JSON, hoja de llamadas). |
| `/VERSION.txt` | Fecha/hora de la última actualización. |

### El "lanzador" — un archivo descargado que SÍ se actualiza solo

Un HTML descargado normal es estático: una vez guardado, no recibe mejoras. El
**lanzador** (`/lanzador.html`, o `npm run launcher`) resuelve eso:

- Lo descargáis **una vez** (o lo guardáis en pantalla de inicio).
- Cada vez que lo abrís, va a buscar la **última versión** a la URL pública
  (`/app.html`) → veis siempre las mejoras nuevas, sin volver a descargar nada.
- **Sin conexión**, arranca con la **copia offline** que lleva embebida dentro.

Es lo que conviene compartir con Pablo y Javi: un único archivo que siempre está
al día. (Requiere que GitHub Pages esté activo, porque ahí vive la versión que
descarga.)

Activación (una sola vez, en GitHub):

1. Repo → **Settings → Pages**.
2. En **Build and deployment → Source**, elige **GitHub Actions**.
3. Lanza el workflow: pestaña **Actions → Deploy Opportunity Intel → Run
   workflow** (o haz un push que toque `opportunity-intel/`).
4. La URL aparece en el job y en Settings → Pages. Tipo:
   `https://<usuario>.github.io/xnlab/`.

A partir de ahí: cada push → nueva versión en ~1-2 min, sin tocar nada.

> **Instalar en el móvil como app:** abre la URL en el móvil → menú del
> navegador → *Añadir a pantalla de inicio*. Gracias al `manifest.webmanifest`
> se abre a pantalla completa, como una app nativa.

> Nota: las rutas son relativas (`./src/...`), así que funciona bajo el subpath
> `/xnlab/` de Pages sin cambios.

---

## Opción B — Vercel (también auto-deploy en cada push)

Hay un `vercel.json` listo (sin build, sirve la carpeta tal cual).

1. En vercel.com → **Add New → Project** → importa el repo.
2. **Root Directory**: `opportunity-intel`.
3. Framework preset: **Other**. Build command: vacío. Output: `.`.
4. Deploy. Conecta la rama y cada push redeploya solo.

Da una URL `https://<proyecto>.vercel.app` ideal para el móvil.

---

## Opción C — rápida para probar ahora mismo (en tu equipo)

```bash
cd opportunity-intel
python3 -m http.server 4010
# abre http://localhost:4010  (o http://<tu-ip-local>:4010 desde el móvil
# en la misma wifi)
```

---

## Cómo trabajan Pablo y Javi en el día a día

- **Cada uno abre la URL** en su móvil. La app guarda su trabajo localmente.
- Para **juntar llamadas/leads**: uno pulsa *Exportar registro* (Aprendizaje),
  manda el JSON al otro, que pulsa *Importar registro*. Se fusionan resultados,
  verificaciones y leads añadidos (sin duplicar, el más reciente gana).
- **Buscar leads nuevos**: pestaña *Buscar leads* → atajos de búsqueda por
  sector y ciudad + formulario para añadirlos; entran al ranking al instante.
- **Subir mejoras de la herramienta**: cualquier push a `opportunity-intel/`
  republica la app — la siguiente vez que abran la URL, ya está actualizada.

> Sincronización en tiempo real (sin pasar archivos) = backend. El siguiente
> paso natural es Supabase: `store.js` está aislado para cambiarse sin tocar el
> resto (las funciones get/save/import mantienen su forma).
