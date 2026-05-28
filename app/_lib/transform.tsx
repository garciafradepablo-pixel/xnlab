"use client";
import Link from "next/link";
import { ts, tsS, serif, R, Label, Dust } from "./atoms";

// "What we transform" / "Lo que convertimos" — the honest proof
// interlude that closes the credibility gap BEFORE real public case
// studies exist.
//
// INTEGRITY CONTRACT (do not weaken):
//   • These are NOT case studies and never claim to be. The eyebrow
//     ("Transformation models · Illustrative") and the framing line
//     state it outright, and every card carries an "Illustrative
//     model" tag.
//   • No named clients, no logos, no metrics, no "we increased X%".
//     The commercial effect is stated as a DIRECTION (more desire,
//     more trust, less friction) — never a fabricated number.
//   • Language: "model", "illustrative", "transformation logic" —
//     never "portfolio", "client", "result".
//
// It shows the SHAPE of the perception transformation XNLAB designs,
// per sector: Before → the gap → what we rebuild → the commercial
// effect. Honest, premium, and convincing without a single fake.
//
// Performance: pure CSS/text, zero images, hover is opacity/transform
// only on its own GPU layer. Section background is transparent so the
// global AmbientBackdrop flows through — no scroll seam.

type Bi = { en: string; es: string };
type Model = { sector: Bi; before: Bi; gap: Bi; rebuild: Bi; effect: Bi };

const copy: {
  en: { eyebrow: string; h1a: string; h1b: string; framing: string; tag: string; lBefore: string; lGap: string; lRebuild: string; lEffect: string; ctaH: string; cta: string };
  es: typeof copy_en;
} & { models: Model[] } = {} as never;

const copy_en = {
  eyebrow: "Transformation models · Illustrative",
  h1a: "What we",
  h1b: "transform.",
  framing:
    "Not case studies — not yet. These are transformation models: illustrative systems showing how we diagnose a perception gap and rebuild it into desire, trust and commercial value. XNLAB does not sell content; it changes how a brand is perceived before the customer decides to book, visit or trust.",
  tag: "Illustrative model",
  lBefore: "Before",
  lGap: "The gap",
  lRebuild: "We rebuild",
  lEffect: "Effect",
  ctaH: "Want us to diagnose your perception gap?",
  cta: "Request a perception audit",
};
const copy_es = {
  eyebrow: "Modelos de transformación · Ilustrativo",
  h1a: "Lo que",
  h1b: "convertimos.",
  framing:
    "No son casos falsos. Son modelos de transformación: ejemplos claros de cómo detectamos una brecha de percepción y la convertimos en deseo, confianza y valor comercial. XNLAB no vende contenido; cambia cómo se percibe una marca antes de que el cliente decida reservar, visitar o confiar.",
  tag: "Modelo ilustrativo",
  lBefore: "Antes",
  lGap: "La brecha",
  lRebuild: "Reconstruimos",
  lEffect: "Efecto",
  ctaH: "¿Quieres que detectemos tu brecha de percepción?",
  cta: "Solicitar auditoría de percepción",
};

const MODELS: Model[] = [
  {
    sector: { en: "Immersive dining · Hospitality", es: "Cocina inmersiva · Hostelería" },
    before: {
      en: "The experience is electric in the room. Online it reads like any other restaurant.",
      es: "La experiencia es eléctrica en la sala. Online se lee como un restaurante más.",
    },
    gap: {
      en: "The digital presence never carries the theatre, the senses, the emotional weight of being there.",
      es: "La presencia digital no traslada el teatro, los sentidos, el peso emocional de estar allí.",
    },
    rebuild: {
      en: "A cinematic atmosphere system — hero world, motion language, booking-led storytelling, a premium visual hierarchy and social fragments that build anticipation before arrival.",
      es: "Un sistema de atmósfera cinematográfica — mundo de portada, lenguaje de movimiento, narrativa orientada a la reserva, jerarquía visual premium y fragmentos sociales que crean anticipación antes de llegar.",
    },
    effect: {
      en: "Higher perceived value, a stronger desire to book, a venue people remember.",
      es: "Más valor percibido, más deseo de reservar, un local que se recuerda.",
    },
  },
  {
    sector: { en: "Rooftop · Nightlife", es: "Rooftop · Ocio nocturno" },
    before: {
      en: "The energy, the views, the night are real. Online it looks interchangeable.",
      es: "La energía, las vistas, la noche son reales. Online se ve intercambiable.",
    },
    gap: {
      en: "The brand reads as 'another place to go out' instead of a destination.",
      es: "La marca se lee como 'otro sitio para salir' en vez de un destino.",
    },
    rebuild: {
      en: "A nocturnal identity system — mood, light, movement, signature visuals, an event world and a social rhythm built for reels.",
      es: "Un sistema de identidad nocturna — mood, luz, movimiento, visuales con firma, un mundo de evento y un ritmo social pensado para reels.",
    },
    effect: {
      en: "More desirability, a sharper identity, more shareable, better event positioning.",
      es: "Más deseabilidad, identidad más nítida, más compartible, mejor posicionamiento de evento.",
    },
  },
  {
    sector: { en: "Boutique hotel · Luxury stay", es: "Hotel boutique · Estancia de lujo" },
    before: {
      en: "The property is beautiful in person. Online it shows rooms, not the feeling of staying.",
      es: "La propiedad es preciosa en persona. Online enseña habitaciones, no la sensación de quedarse.",
    },
    gap: {
      en: "Intimacy, status and escape never make it to the screen.",
      es: "La intimidad, el estatus y la evasión no llegan a la pantalla.",
    },
    rebuild: {
      en: "An atmosphere-led stay narrative — arrival, texture, silence, ritual, sensory pacing, an image system and booking psychology.",
      es: "Una narrativa de estancia guiada por la atmósfera — llegada, textura, silencio, ritual, ritmo sensorial, un sistema de imagen y psicología de reserva.",
    },
    effect: {
      en: "Higher perceived premium, deeper emotional trust, a stronger pull toward direct booking.",
      es: "Más premium percibido, más confianza emocional, más fuerza hacia la reserva directa.",
    },
  },
  {
    sector: { en: "Clinic · Wellness · Aesthetic", es: "Clínica · Wellness · Estética" },
    before: {
      en: "The work is excellent. The brand feels cold, generic, over-clinical.",
      es: "El trabajo es excelente. La marca se siente fría, genérica, demasiado clínica.",
    },
    gap: {
      en: "Patients trust the service — the digital experience earns none of it.",
      es: "El paciente confía en el servicio — la experiencia digital no se gana nada de esa confianza.",
    },
    rebuild: {
      en: "A calm-authority system — visual softness, confident language, a trust hierarchy, a clear patient journey and reassurance built into the flow.",
      es: "Un sistema de autoridad serena — suavidad visual, lenguaje seguro, jerarquía de confianza, un recorrido de paciente claro y tranquilidad integrada en el flujo.",
    },
    effect: {
      en: "More trust, less friction, a higher intent to enquire.",
      es: "Más confianza, menos fricción, más intención de consulta.",
    },
  },
];

export function Transform({ lang }: { lang: "en" | "es" }) {
  const t = lang === "en" ? copy_en : copy_es;
  return (
    <section style={{ padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden" }}>
      {/* Local warm pool, transparent edges — continuous with the
          global backdrop, no seam. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 78% 56% at 50% 8%, rgba(216,147,42,0.045) 0%, rgba(180,110,40,0.012) 38%, transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <Dust count={5} opacity={0.04} />
      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 5 }}>
        <R style={{ textAlign: "center", marginBottom: "clamp(32px,4vw,56px)" }}>
          <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{t.eyebrow}</Label>
          <h2
            style={{
              fontSize: "clamp(1.9rem,3.8vw,3.8rem)",
              fontWeight: 400,
              lineHeight: 0.96,
              letterSpacing: "-0.05em",
              textShadow: tsS,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {t.h1a}
            <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>{t.h1b}</span>
          </h2>
          <p
            style={{
              marginTop: "clamp(16px,2vw,24px)",
              fontSize: "clamp(0.92rem,1.16vw,1.05rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              maxWidth: 720,
              marginLeft: "auto",
              marginRight: "auto",
              textShadow: ts,
              textWrap: "balance",
            }}
          >
            {t.framing}
          </p>
        </R>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: "clamp(16px,2vw,28px)",
          }}
        >
          {MODELS.map((m, i) => (
            <R key={m.sector.en} delay={0.06 * i}>
              <div
                style={{
                  position: "relative",
                  height: "100%",
                  padding: "clamp(24px,2.6vw,38px)",
                  borderRadius: 18,
                  border: "1px solid rgba(232,183,131,0.14)",
                  background: "linear-gradient(180deg, rgba(22,18,16,0.55) 0%, rgba(10,8,9,0.5) 100%)",
                  transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), border-color 0.55s, box-shadow 0.55s, background 0.55s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "rgba(232,183,131,0.4)";
                  e.currentTarget.style.boxShadow = "0 24px 60px -28px rgba(0,0,0,0.8), 0 0 60px -30px rgba(232,183,131,0.4)";
                  e.currentTarget.style.background = "linear-gradient(180deg, rgba(30,24,20,0.6) 0%, rgba(12,9,10,0.55) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(232,183,131,0.14)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "linear-gradient(180deg, rgba(22,18,16,0.55) 0%, rgba(10,8,9,0.5) 100%)";
                }}
              >
                {/* Honesty tag — every card says it is a model. */}
                <span
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 18,
                    fontSize: 8.5,
                    fontWeight: 500,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.32)",
                  }}
                >
                  {t.tag}
                </span>
                <h3
                  style={{
                    margin: "0 clamp(70px,8vw,90px) clamp(18px,2vw,24px) 0",
                    fontSize: "clamp(1.05rem,1.4vw,1.32rem)",
                    fontWeight: 400,
                    lineHeight: 1.18,
                    letterSpacing: "-0.018em",
                    color: "white",
                  }}
                >
                  {m.sector[lang]}
                </h3>
                <Field label={t.lBefore} muted>{m.before[lang]}</Field>
                <Field label={t.lGap}>{m.gap[lang]}</Field>
                <Field label={t.lRebuild} strong>{m.rebuild[lang]}</Field>
                <Field label={t.lEffect} amber>{m.effect[lang]}</Field>
              </div>
            </R>
          ))}
        </div>

        {/* CTA — one dominant verb: request. */}
        <R delay={0.3}>
          <div style={{ marginTop: "clamp(40px,5vw,68px)", textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 clamp(20px,2.4vw,28px)",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.2rem,2vw,1.7rem)",
                lineHeight: 1.3,
                color: "rgba(255,255,255,0.82)",
                letterSpacing: "-0.01em",
                textShadow: ts,
                maxWidth: 620,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {t.ctaH}
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "15px 32px",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "white",
                textDecoration: "none",
                border: "1px solid rgba(232,183,131,0.45)",
                background: "rgba(232,183,131,0.06)",
                borderRadius: 999,
                transition: "background 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                e.currentTarget.style.transform = "translateY(-1px) scale(1.015)";
                e.currentTarget.style.boxShadow = "0 14px 40px -16px rgba(232,183,131,0.55), 0 0 0 1px rgba(232,183,131,0.18) inset";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.06)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.18)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.85)";
                e.currentTarget.style.transform = "translateY(-1px) scale(1.015)";
                e.currentTarget.style.boxShadow = "0 14px 40px -16px rgba(232,183,131,0.55), 0 0 0 1px rgba(232,183,131,0.18) inset";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "rgba(232,183,131,0.06)";
                e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {t.cta} <span aria-hidden style={{ fontSize: 14 }}>→</span>
            </Link>
          </div>
        </R>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  muted,
  strong,
  amber,
}: {
  label: string;
  children: React.ReactNode;
  muted?: boolean;
  strong?: boolean;
  amber?: boolean;
}) {
  return (
    <div style={{ marginBottom: "clamp(12px,1.4vw,16px)" }}>
      <span
        style={{
          display: "block",
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: amber ? "rgba(232,183,131,0.7)" : "rgba(255,255,255,0.32)",
          marginBottom: 5,
        }}
      >
        {label}
      </span>
      <p
        style={{
          margin: 0,
          fontSize: "clamp(0.9rem,1.05vw,1rem)",
          lineHeight: 1.55,
          fontWeight: 300,
          letterSpacing: "-0.003em",
          color: amber
            ? "rgba(232,183,131,0.92)"
            : muted
            ? "rgba(255,255,255,0.48)"
            : strong
            ? "rgba(255,255,255,0.86)"
            : "rgba(255,255,255,0.66)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
