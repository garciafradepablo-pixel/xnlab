# Relevos — el walkie-talkie que resume y escupe

Comunicación asíncrona entre las dos personas del equipo, sin hablar en directo.
Uno suelta una sesión hablando; el delfín (`/relevo`) la destila a lo mínimo
accionable; el otro lo recibe aquí. Es un partido de pimpón: cada fichero es un
turno.

## Cómo se usa (gratis, sin API)

1. **Hablas.** Dicta tu sesión con el dictado del navegador (Web Speech API, gratis)
   o cualquier transcripción que tengas. Pega el texto en bruto en el terminal,
   o déjalo como fichero en `relevos/_inbox/`.
2. **`/relevo`.** Claude Code (que ya pagas) lo destila aplicando el contrato y los
   perfiles, y escribe el relevo para la otra persona.
3. **El otro lo abre** aquí, en `relevos/`. Lee, y graba su vuelta.

El cerebro es Claude Code, no una API de pago. La transcripción es del navegador.
La sincronización es git. Coste nuevo: cero.

## Ficheros

- `NNNN-de-X-para-Y.md` — cada relevo (un turno del partido), correlativos.
- `perfiles.example.md` — plantilla de perfiles. Cópiala a `perfiles.local.md`.
- `perfiles.local.md` — perfiles reales (nombres + estilos). **No se sube** al
  repo (gitignored): el estudio es anónimo y esto es dato personal.
- `_inbox/` — transcripciones en bruto antes de destilar. **No se sube.**

## El espíritu

Un delfín: ecolocalización (envío un pulso, leo el rebote), social (protege el
vínculo) e inteligente (filtra la señal del ruido). El delfín se queda la
fricción y entrega la sustancia.
