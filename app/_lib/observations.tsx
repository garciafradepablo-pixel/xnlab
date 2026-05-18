"use client";
import { R, Label, serif, ts, tsS } from "./atoms";

// OBSERVATIONS — the home page's strategic-intelligence beat. Sits
// between Signals (proof of execution) and 003 Systems (the offer).
//
// Each observation is a tight, dense reading of one piece of hidden
// leverage inside modern hospitality. Three pieces, ~110-140 words
// each. Written in the studio's voice — published intelligence, not
// blog posts and not case studies.
//
// Voice: editorial, sharp, declarative. The visitor should think
// "these people see what others miss," and that thought should be
// available in 90 seconds of reading.

type Observation = {
  index: string;
  title: { en: string; es: string };
  body: { en: string[]; es: string[] };
  signature: { en: string; es: string };
};

const OBSERVATIONS: Observation[] = [
  {
    index: "Obs/01",
    title: {
      en: "The first-screen budget",
      es: "El presupuesto de la primera pantalla",
    },
    body: {
      en: [
        "Most brands spend their budget on the home page. The screen that decides whether the customer comes back is the one they open forty times a week — the dashboard, the account, the recurring email.",
        "Default type, neutral spacing, an icon that means nothing. The surface with the highest density of touch, treated as utility. By the time the customer reaches it, the brand has already lost its second chance to be remembered.",
        "An inevitable brand models that returning screen as the first beat of every visit: warmer than the marketing site, quieter than the campaign, with a tempo calibrated to the customer's daily attention. The customer is inside the brand before the page has finished loading.",
      ],
      es: [
        "La mayoría de las marcas gastan su presupuesto en la home. La pantalla que decide si el cliente vuelve es la que abre cuarenta veces por semana — el dashboard, la cuenta, el email recurrente.",
        "Tipografía por defecto, espaciados neutros, un icono que no significa nada. La superficie con mayor densidad de contacto, tratada como utilidad. Cuando el cliente llega a ella, la marca ya ha perdido su segunda oportunidad de ser recordada.",
        "Una marca inevitable modela esa pantalla a la que se vuelve como el primer compás de cada visita: más cálida que el sitio de marketing, más callada que la campaña, con un tempo calibrado para la atención diaria del cliente. El cliente está dentro de la marca antes de que la página termine de cargar.",
      ],
    },
    signature: {
      en: "This is where the budget should sit.",
      es: "Ahí es donde debería estar el presupuesto.",
    },
  },
  {
    index: "Obs/02",
    title: {
      en: "The review you cannot buy",
      es: "La reseña que no se puede comprar",
    },
    body: {
      en: [
        "Every company chases the five-star review. The reviews that change a brand's trajectory are the ones written in a register the marketing department could not have authored.",
        "“The way it loads.” “The tone of the email after the refund.” “The font on the receipt.”",
        "These are not aesthetic compliments. They are perception artefacts — the customer naming a sensation the brand calibrated for. When reviews start describing atmosphere instead of features, the brand has crossed the threshold from being good to being remembered.",
      ],
      es: [
        "Cada empresa persigue la reseña de cinco estrellas. Las reseñas que cambian la trayectoria de una marca están escritas en un registro que el departamento de marketing no habría podido redactar.",
        "«Cómo carga.» «El tono del email tras la devolución.» «La tipografía del recibo.»",
        "No son cumplidos estéticos. Son artefactos de percepción — el cliente nombrando una sensación que la marca calibró. Cuando las reseñas empiezan a describir atmósfera en vez de funcionalidades, la marca ha cruzado el umbral de ser buena a ser recordada.",
      ],
    },
    signature: {
      en: "Atmosphere systems are designed to make these sentences possible.",
      es: "Los sistemas de atmósfera están diseñados para hacer esas frases posibles.",
    },
  },
  {
    index: "Obs/03",
    title: {
      en: "The surface that does not screenshot",
      es: "La superficie que no se captura",
    },
    body: {
      en: [
        "The current visible trend rewards brands that look like every other brand on the algorithm. The next decade belongs to brands that hold their atmosphere when the screenshot is closed.",
        "The unscreenshotted moment is the moment with the highest repeat rate. Loading rhythm that does not photograph, tempo of email that cannot be quoted out of context, a service voice the customer hears the night the order goes wrong. These elements do not screen-grab — they do not need to.",
        "Word of mouth from the unscreenshotted moment outperforms paid reach for brands operating at this scale. It cannot be bought, only built.",
      ],
      es: [
        "La tendencia visible actual premia a las marcas que se parecen a todas las demás del algoritmo. La próxima década pertenece a las marcas que sostienen su atmósfera cuando se cierra la captura de pantalla.",
        "El momento no capturado es el momento con la tasa de repetición más alta. Ritmo de carga que no fotografía, tempo del email que no se puede citar fuera de contexto, voz de servicio que el cliente oye la noche en la que el pedido sale mal. Estos elementos no se capturan — no lo necesitan.",
        "El boca a boca del momento no capturado supera al alcance pagado para marcas que operan a esta escala. No se puede comprar, sólo construir.",
      ],
    },
    signature: {
      en: "The most valuable surface in a brand is the one nobody screenshots.",
      es: "La superficie más valiosa de una marca es la que nadie captura.",
    },
  },
];

const COPY = {
  en: {
    label: "Observations · Brand intelligence",
    headlineA: "Hidden leverage,",
    headlineB: "named in advance.",
    intro:
      "Three readings from inside the practice. Not predictions, not opinions — the operational logic of how a brand becomes culturally inevitable across every surface it touches. Published so the team can stop guessing.",
  },
  es: {
    label: "Observaciones · Inteligencia de marca",
    headlineA: "Palancas ocultas,",
    headlineB: "nombradas a tiempo.",
    intro:
      "Tres lecturas desde dentro de la práctica. No son predicciones, no son opiniones — la lógica operativa por la que una marca se vuelve culturalmente inevitable en cada superficie que toca. Publicadas para que el equipo deje de adivinar.",
  },
};

export function Observations({ lang }: { lang: "en" | "es" }) {
  const t = COPY[lang];
  return (
    <section
      style={{
        position: "relative",
        padding: "clamp(72px,9vw,128px) clamp(20px,5vw,64px)",
        overflow: "hidden",
      }}
    >
      {/* Section atmosphere — warm light entering from top-left, cool
          counter-light from bottom-right. Reads as one room with two
          windows. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 65% 55% at 15% 12%, rgba(216,147,42,0.08) 0%, rgba(180,110,40,0.025) 40%, transparent 72%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 55% 50% at 88% 88%, rgba(124,140,224,0.05) 0%, rgba(80,110,220,0.015) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(232,183,131,0.18), transparent)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 5, maxWidth: 1180, margin: "0 auto" }}>
        <R style={{ marginBottom: "clamp(48px,5.6vw,84px)", textAlign: "center" }}>
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
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.18em",
              }}
            >
              {t.headlineB}
            </span>
          </h2>
          <p
            style={{
              maxWidth: 620,
              margin: "clamp(20px,2.6vw,32px) auto 0",
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
          {OBSERVATIONS.map((obs, i) => {
            const isLast = i === OBSERVATIONS.length - 1;
            return (
              <R key={obs.index} delay={0.06 * i}>
                <li
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "minmax(110px, 160px) 1fr",
                    gap: "clamp(28px,3.4vw,56px)",
                    padding: "clamp(40px,4.8vw,72px) 0 clamp(40px,4.8vw,72px) clamp(20px,2.4vw,32px)",
                    borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    borderBottom: isLast ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.04)",
                    alignItems: "start",
                  }}
                  onMouseEnter={(e) => {
                    const stripe = e.currentTarget.querySelector("[data-obs-stripe]") as HTMLElement | null;
                    if (stripe) {
                      stripe.style.height = "72px";
                      stripe.style.opacity = "1";
                      stripe.style.boxShadow = "0 0 18px rgba(232,183,131,0.55)";
                    }
                    const sig = e.currentTarget.querySelector("[data-obs-sig]") as HTMLElement | null;
                    if (sig) sig.style.color = "rgba(232,183,131,1)";
                  }}
                  onMouseLeave={(e) => {
                    const stripe = e.currentTarget.querySelector("[data-obs-stripe]") as HTMLElement | null;
                    if (stripe) {
                      stripe.style.height = "32px";
                      stripe.style.opacity = "0.85";
                      stripe.style.boxShadow = "0 0 14px rgba(232,183,131,0.35)";
                    }
                    const sig = e.currentTarget.querySelector("[data-obs-sig]") as HTMLElement | null;
                    if (sig) sig.style.color = "rgba(232,183,131,0.82)";
                  }}
                >
                  {/* Numbered index + amber stripe — the dossier register */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
                    <span
                      data-obs-stripe
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 8,
                        width: 2,
                        height: 32,
                        borderRadius: 2,
                        background: "rgba(232,183,131,0.7)",
                        boxShadow: "0 0 14px rgba(232,183,131,0.35)",
                        opacity: 0.85,
                        transition: "height 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.5s, box-shadow 0.6s",
                      }}
                    />
                    <span
                      style={{
                        paddingLeft: 18,
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: "clamp(1.4rem,2vw,1.9rem)",
                        lineHeight: 1,
                        color: "rgba(232,183,131,0.85)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {obs.index}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(18px,2.2vw,28px)" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "clamp(1.5rem,2.4vw,2.4rem)",
                        fontWeight: 400,
                        lineHeight: 1.12,
                        letterSpacing: "-0.025em",
                        color: "white",
                        textShadow: tsS,
                        textWrap: "balance",
                      }}
                    >
                      {obs.title[lang]}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px,1.4vw,18px)" }}>
                      {obs.body[lang].map((p, pi) => (
                        <p
                          key={pi}
                          style={{
                            margin: 0,
                            fontSize: "clamp(0.98rem,1.18vw,1.1rem)",
                            lineHeight: 1.7,
                            color: "rgba(255,255,255,0.74)",
                            fontWeight: 300,
                            letterSpacing: "0.005em",
                            textShadow: ts,
                            maxWidth: 720,
                            textWrap: "balance",
                          }}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                    <p
                      data-obs-sig
                      style={{
                        margin: "clamp(8px,1vw,14px) 0 0",
                        fontFamily: serif,
                        fontStyle: "italic",
                        fontSize: "clamp(1.05rem,1.4vw,1.35rem)",
                        lineHeight: 1.35,
                        color: "rgba(232,183,131,0.82)",
                        letterSpacing: "-0.005em",
                        textShadow: ts,
                        maxWidth: 640,
                        textWrap: "balance",
                        transition: "color 0.5s cubic-bezier(0.22,1,0.36,1)",
                      }}
                    >
                      {obs.signature[lang]}
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
