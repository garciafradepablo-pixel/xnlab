# EC · Eco — el walkie-talkie que resume y escupe

El delfín de XNLAB. Comunicación asíncrona entre las dos personas del equipo para
**los huecos en que no coincidís**: uno suelta una sesión hablando, el delfín
(`/eco`) la destila a lo mínimo accionable, el otro la recoge aquí. Es un partido
de pimpón: cada fichero es un turno, un eco.

Familia: **XN** lab · **CN** connect · **EC** eco.

## Cómo se usa (gratis, sin API)

1. **Hablas.** Dicta tu sesión con el dictado del navegador (Web Speech API, gratis)
   o cualquier transcripción que tengas. Pega el texto en bruto en el terminal,
   o déjalo como fichero en `ecos/_inbox/`.
2. **`/eco`.** Claude Code (que ya pagas) lo destila aplicando el contrato y los
   perfiles, y escribe el eco para la otra persona.
3. **El otro lo abre** aquí, en `ecos/`. Lee, y graba su vuelta.

El cerebro es Claude Code, no una API de pago. La transcripción es del navegador.
La sincronización es git. Coste nuevo: cero.

## Ficheros

- `NNNN-de-X-para-Y.md` — cada eco (un turno del partido), correlativos.
- `perfiles.example.md` — plantilla de perfiles. Cópiala a `perfiles.local.md`.
- `perfiles.local.md` — perfiles reales (nombres + estilos). **No se sube** al
  repo (gitignored): el estudio es anónimo y esto es dato personal.
- `_inbox/` — transcripciones en bruto antes de destilar. **No se sube.**

## El espíritu

Un delfín: ecolocalización (mando un pulso, leo el rebote → el eco), social
(protege el vínculo) e inteligente (filtra la señal del ruido). El delfín se queda
la fricción y entrega la sustancia.
