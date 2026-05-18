"use client";
import { R, Label, serif, ts, tsS } from "./atoms";
import { worlds } from "./worlds";

// Signals of Execution — the home page's proof-of-method beat. Sits
// between Method (how we think) and Services (what we sell). It is
// NOT a portfolio grid, NOT case-study cards, NOT thumbnails. Each
// signal is an editorial fragment that reads as "this is happening
// inside the lab right now" — a discipline name, an atmospheric note
// in the voice of the studio, a technical line that proves we have
// already touched the material, and a coloured stripe drawn from the
// world the signal belongs to. No client names. No fake testimonials.
//
// Six rows, one per discipline named in the brief, vertically stacked
// — the rhythm IS the proof. Restraint over density.

type Signal = {
  index: string;
  discipline: { en: string; es: string };
  // Atmospheric note in the studio's voice — italic serif, the
  // commercial wager of the row.
  note: { en: string; es: string };
  // Material line — small caps, the technical evidence that the
  // studio has already operated this register.
  material: { en: string; es: string };
  // Slug of the world whose colour signs the row.
  worldSlug: typeof worlds[number]["slug"];
};

const SIGNALS: Signal[] = [
  {
    index: "S/01",
    discipline: {
      en: "Product Voice & Motion",
      es: "Voz y Animación de Producto",
    },
    note: {
      en: "Eight seconds modeled before the home screen exists. The first launch has to feel before any pixel resolves.",
      es: "Ocho segundos modelados antes de que exista la pantalla principal. La primera apertura tiene que sentirse antes de que un solo píxel se resuelva.",
    },
    material: {
      en: "Launch sequence study · loading micro-motion · empty-state tone direction",
      es: "Secuencia de apertura · micro-animación de carga · dirección de tono en estados vacíos",
    },
    worldSlug: "product",
  },
  {
    index: "S/02",
    discipline: {
      en: "Editorial Tempo · Owned Surfaces",
      es: "Tempo Editorial · Superficies Propias",
    },
    note: {
      en: "A breath of 240 milliseconds between two thoughts. The pause sustains the brand, not the cut.",
      es: "Una respiración de 240 milisegundos entre dos pensamientos. La pausa sostiene la marca, no el corte.",
    },
    material: {
      en: "Easing curve [0.22, 1, 0.36, 1] · 6.5s loop · audio-tied motion",
      es: "Curva de easing [0.22, 1, 0.36, 1] · bucle de 6.5s · animación atada al audio",
    },
    worldSlug: "owned-digital",
  },
  {
    index: "S/03",
    discipline: {
      en: "Threshold Choreography",
      es: "Coreografía de Umbral",
    },
    note: {
      en: "Three meters before the floor — lit, dampened and paced before the camera reads a single sign.",
      es: "Tres metros antes de pisar la tienda — iluminados, atenuados y pautados antes de que la cámara lea un solo rótulo.",
    },
    material: {
      en: "Lighting cue · ambient sound floor · staff register at the door",
      es: "Pauta lumínica · suelo sonoro ambiental · registro del personal en la puerta",
    },
    worldSlug: "retail-physical",
  },
  {
    index: "S/04",
    discipline: {
      en: "Service Voice · Off-Hours",
      es: "Voz de Servicio · Fuera de Horario",
    },
    note: {
      en: "What was decoration falls away. What remains has nothing in front of it — and answers at eleven.",
      es: "Lo que era decoración se cae. Lo que queda no tiene nada delante — y contesta a las once.",
    },
    material: {
      en: "ORUN pass · response-time atmosphere · three-line template rewrite",
      es: "Pasada ORUN · atmósfera del tiempo de respuesta · reescritura de plantilla a tres líneas",
    },
    worldSlug: "customer-operations",
  },
  {
    index: "S/05",
    discipline: {
      en: "Communication · Spatial Direction",
      es: "Comunicación · Dirección Espacial",
    },
    note: {
      en: "A campaign reduced to one material and one shadow. Geometry, before the words arrive.",
      es: "Una campaña reducida a un material y una sombra. Geometría, antes de que lleguen las palabras.",
    },
    material: {
      en: "Lighting direction · single-mineral palette · negative-space study",
      es: "Dirección lumínica · paleta de un solo mineral · estudio del vacío",
    },
    worldSlug: "communication",
  },
  {
    index: "S/06",
    discipline: {
      en: "Atmosphere Deployment",
      es: "Despliegue Atmosférico",
    },
    note: {
      en: "The brand walks into the room before the founder does. Then it stays — even when no one from the studio is left.",
      es: "La marca entra en la sala antes que el fundador. Y se queda — incluso cuando ya no queda nadie del estudio.",
    },
    material: {
      en: "Tone register · gesture system · cultural co-ordinates",
      es: "Registro de tono · sistema gestual · coordenadas culturales",
    },
    worldSlug: "community-culture",
  },
];

const COPY = {
  en: {
    label: "Signals · From the lab",
    headlineA: "What is happening",
    headlineB: "inside the lab.",
    intro:
      "Fragments from the studio's working surface — typography studies, motion briefs, identity passes, atmospheric scaffolding. No client names, no thumbnails. Proof of register, not of portfolio.",
  },
  es: {
    label: "Señales · Desde el laboratorio",
    headlineA: "Qué está pasando",
    headlineB: "dentro del laboratorio.",
    intro:
      "Fragmentos de la superficie de trabajo del estudio — estudios tipográficos, briefs de animación, pasadas de identidad, andamiajes atmosféricos. Sin nombres de cliente, sin thumbnails. Prueba de registro, no de portfolio.",
  },
};

export function Signals({ lang }: { lang: "en" | "es" }) {
  const t = COPY[lang];
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(72px,9vw,128px) clamp(20px,5vw,64px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Soft radial wash so the section reads as its own atmospheric
          chapter without an image. Subtle, drawn from the warm spine
          of the site rather than a single world's accent. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 22%, rgba(70,45,20,0.18) 0%, rgba(22,14,8,0.05) 45%, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 5, maxWidth: 1180, margin: "0 auto" }}>
        <R style={{ marginBottom: "clamp(36px,4.4vw,64px)", textAlign: "center" }}>
          <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.label}</Label>
          <h2
            style={{
              fontSize: "clamp(2rem,4.6vw,4.6rem)",
              fontWeight: 400,
              lineHeight: 0.98,
              letterSpacing: "-0.05em",
              textShadow: tsS,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
              margin: 0,
            }}
          >
            <span>{t.headlineA}</span>
            <span
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.65)",
                fontSize: "1.18em",
              }}
            >
              {t.headlineB}
            </span>
          </h2>
          <p
            style={{
              maxWidth: 620,
              margin: "clamp(18px,2.4vw,28px) auto 0",
              fontSize: "clamp(0.95rem,1.18vw,1.08rem)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 300,
              textShadow: ts,
              textWrap: "balance",
            }}
          >
            {t.intro}
          </p>
        </R>

        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {SIGNALS.map((s, i) => {
            const world = worlds.find((w) => w.slug === s.worldSlug);
            const c = world?.color;
            const isLast = i === SIGNALS.length - 1;
            return (
              <R key={s.index} delay={0.06 * i}>
                <li
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "minmax(80px, 120px) 1fr",
                    gap: "clamp(20px,2.8vw,40px)",
                    padding: "clamp(28px,3.4vw,48px) 0 clamp(28px,3.4vw,48px) clamp(20px,2.4vw,28px)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    borderBottom: isLast ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "baseline",
                  }}
                  onMouseEnter={(e) => {
                    const stripe = e.currentTarget.querySelector("[data-stripe]") as HTMLElement | null;
                    if (stripe) {
                      stripe.style.opacity = "1";
                      stripe.style.height = "calc(100% - clamp(40px, 5vw, 72px))";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const stripe = e.currentTarget.querySelector("[data-stripe]") as HTMLElement | null;
                    if (stripe) {
                      stripe.style.opacity = "0.45";
                      stripe.style.height = "clamp(28px, 4vw, 56px)";
                    }
                  }}
                >
                  {/* Colour stripe — the discipline's world signs this row. */}
                  <span
                    data-stripe
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "clamp(28px,3.4vw,48px)",
                      width: 2,
                      height: "clamp(28px, 4vw, 56px)",
                      borderRadius: 2,
                      background: c?.hex ?? "rgba(232,183,131,0.7)",
                      boxShadow: c ? `0 0 14px ${c.glow}` : "none",
                      opacity: 0.45,
                      transition: "opacity 0.5s ease, height 0.6s cubic-bezier(0.22,1,0.36,1)",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span
                      style={{
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: "clamp(1.4rem,2vw,1.9rem)",
                        lineHeight: 1,
                        color: c?.hex ?? "rgba(232,183,131,0.7)",
                        opacity: 0.85,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {s.index}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {s.discipline[lang]}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(14px,1.6vw,22px)" }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: "clamp(1.2rem,1.78vw,1.7rem)",
                        lineHeight: 1.35,
                        color: "rgba(255,255,255,0.92)",
                        letterSpacing: "-0.005em",
                        textShadow: tsS,
                        maxWidth: 760,
                        textWrap: "balance",
                      }}
                    >
                      {s.note[lang]}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 10.5,
                        fontWeight: 500,
                        letterSpacing: "0.26em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.42)",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.material[lang]}
                    </p>
                  </div>
                </li>
              </R>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
