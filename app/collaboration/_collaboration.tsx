"use client";
import Link from "next/link";
import Image from "next/image";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { Magnetic } from "../_lib/chrome";
import { WordmarkLink } from "../_lib/wordmark";

const en = {
  eyebrow: "Collaboration · 002",
  h1a: "How we",
  h1b: "engage.",
  lead:
    "We work with a small number of clients each year. The conversation moves slowly, on purpose. If you are considering reaching out, the notes below describe what tends to work.",
  sections: [
    {
      label: "When to reach out",
      title: "Earlier than feels comfortable.",
      body: [
        "For a hospitality opening we like to be involved 4–6 months before doors open. For an identity system, 8–12 weeks before launch. For an architectural project, before construction documents are final.",
        "If the timeline is tighter, send the brief anyway — sometimes we restructure scope to deliver inside a window.",
      ],
    },
    {
      label: "What to send first",
      title: "A short message, not a deck.",
      body: [
        "Tell us what the place or brand is, where it is, and the date you need to open or launch. Three or four sentences is enough.",
        "If you have references that move you — buildings, films, perfumes, hotels you have stayed in — share two or three. Not a moodboard. The ones you keep returning to.",
        "Budget is welcome but optional in the first message. We will be honest about whether we are the right studio.",
      ],
    },
    {
      label: "The first conversation",
      title: "Thirty minutes, on camera.",
      body: [
        "We meet for a single video call. No pitch deck on our side, no questionnaire on yours. We listen, ask questions, and at the end suggest whether the next step is a proposal, a smaller study, or a referral elsewhere.",
        "If we proceed, you receive a written proposal within a week. It is short. We are happy to revise it once together.",
      ],
    },
    {
      label: "Engagement shape",
      title: "Few clients, full attention.",
      body: [
        "We collaborate with four to six clients each year. Engagements run between two weeks and twelve months depending on the engagement.",
        "We do not sell hourly work. Most engagements are quoted as fixed-scope projects, paid in milestones. When a brand requires continuous presence, we build monthly creative systems around campaigns, updates and visual production — our Visual Engine offer.",
      ],
    },
    {
      label: "After delivery",
      title: "We stay through opening.",
      body: [
        "Delivery is not the end of an engagement. We stay through the opening week, calibrate lighting and sound on site, and adjust details across the first season. This is included.",
      ],
    },
  ],
  closingH: "Ready when you are.",
  closingBody:
    "If the notes above describe the kind of collaboration you are looking for, we would like to hear about your project.",
  cta: "Apply for a project",
  back: "← Home",
};

const es = {
  eyebrow: "Colaboración · 002",
  h1a: "Cómo",
  h1b: "colaboramos.",
  lead:
    "Trabajamos con un número reducido de clientes cada año. La conversación avanza despacio, a propósito. Si estás pensando en escribirnos, las notas de abajo describen lo que suele funcionar.",
  sections: [
    {
      label: "Cuándo escribirnos",
      title: "Antes de lo que parece cómodo.",
      body: [
        "Para una apertura de hospitalidad nos gusta empezar 4-6 meses antes de abrir puertas. Para un sistema de identidad, 8-12 semanas antes del lanzamiento. Para un proyecto arquitectónico, antes de que los planos de ejecución estén cerrados.",
        "Si el calendario es más ajustado, escríbenos igualmente — a veces reestructuramos el alcance para entregar dentro del plazo.",
      ],
    },
    {
      label: "Qué enviar primero",
      title: "Un mensaje corto, no una presentación.",
      body: [
        "Cuéntanos qué es el lugar o la marca, dónde está, y la fecha en la que necesitas abrir o lanzar. Tres o cuatro frases bastan.",
        "Si tienes referencias que te mueven — edificios, películas, perfumes, hoteles donde te has alojado — comparte dos o tres. No un moodboard. A las que vuelves siempre.",
        "El presupuesto es bienvenido pero opcional en el primer mensaje. Te diremos con honestidad si somos el estudio adecuado.",
      ],
    },
    {
      label: "La primera conversación",
      title: "Treinta minutos, en cámara.",
      body: [
        "Nos vemos en una sola videollamada. Sin presentación por nuestra parte, sin cuestionario por la tuya. Escuchamos, preguntamos, y al final sugerimos si el siguiente paso es una propuesta, un estudio más pequeño, o una referencia a otro lado.",
        "Si avanzamos, recibes una propuesta escrita en una semana. Es corta. La revisamos juntos una vez si hace falta.",
      ],
    },
    {
      label: "Forma del encargo",
      title: "Pocos clientes, atención completa.",
      body: [
        "Colaboramos con cuatro a seis clientes cada año. Los encargos van de dos semanas a doce meses según el tipo.",
        "No vendemos trabajo por horas. La mayoría de encargos se cotiza con alcance cerrado y se paga por hitos. Cuando una marca necesita presencia continua, construimos sistemas creativos mensuales alrededor de campañas, actualizaciones y producción visual — nuestra oferta Motor Visual.",
      ],
    },
    {
      label: "Después de la entrega",
      title: "Nos quedamos hasta la apertura.",
      body: [
        "La entrega no es el final del encargo. Nos quedamos durante la semana de apertura, calibramos luz y sonido en sitio, y ajustamos detalles a lo largo de la primera temporada. Está incluido.",
      ],
    },
  ],
  closingH: "Listos cuando lo estés.",
  closingBody:
    "Si las notas de arriba describen el tipo de colaboración que buscas, nos gustaría saber de tu proyecto.",
  cta: "Aplicar para un proyecto",
  back: "← Inicio",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function Collaboration() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "#060606",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(4,3,2,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}>
        <nav style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 clamp(20px,5vw,56px)" }}>
          <WordmarkLink />
          <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{t.back}</Link>
          <button onClick={() => setLang(lang === "en" ? "es" : "en")} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
          </button>
        </nav>
      </header>

      <section style={{ position: "relative", padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(56px,8vw,96px)", maxWidth: 1120, margin: "0 auto" }}>
        {/* Cool atmospheric backdrop — steel/stone tint */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(30,40,55,0.5) 0%, rgba(12,18,28,0.22) 38%, transparent 72%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Dust count={12} opacity={0.07} />
        <p style={{ ...labelStyle, marginBottom: 28, position: "relative", zIndex: 5 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(2.6rem,7.5vw,7.4rem)",
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: "-0.055em",
            textShadow: tsS,
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "0.18em",
          }}
        >
          <W text={t.h1a} delay={0} />
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.18em" }}>
            <W text={t.h1b} delay={0.14} />
          </span>
        </h1>
        <R delay={0.3}>
          <p style={{ marginTop: "clamp(28px,3.5vw,44px)", fontSize: "clamp(1rem,1.3vw,1.18rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.7)", fontWeight: 300, maxWidth: 760, textShadow: ts }}>
            {t.lead}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(56px,8vw,120px)", maxWidth: 1120, margin: "0 auto" }}>
        {t.sections.map((s, i) => (
          <R key={s.label} delay={0.04 * i}>
            <div
              style={{
                display: "grid",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(40px,5vw,72px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(2rem,3.6vw,3.4rem)",
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p style={labelStyle}>{s.label}</p>
              </div>
              <div style={{ maxWidth: 720 }}>
                <h2
                  style={{
                    fontSize: "clamp(1.6rem,2.8vw,2.6rem)",
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: "white",
                    textShadow: tsS,
                    marginBottom: "clamp(20px,2.5vw,32px)",
                  }}
                >
                  {s.title}
                </h2>
                {s.body.map((p, j) => (
                  <p
                    key={j}
                    style={{
                      marginBottom: j === s.body.length - 1 ? 0 : "1.1em",
                      fontSize: "clamp(0.98rem,1.2vw,1.12rem)",
                      lineHeight: 1.72,
                      color: "rgba(255,255,255,0.72)",
                      fontWeight: 300,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </R>
        ))}
      </section>

      {/* Atmospheric image break before the closing CTA */}
      <section style={{ position: "relative", minHeight: "clamp(55svh,68vh,78svh)", overflow: "hidden" }}>
        <Image
          src="/images/06_spatial_green.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 40%" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(6,6,6,1) 0%, rgba(4,3,2,0.22) 18%, rgba(4,3,2,0.5) 60%, rgba(6,6,6,1) 100%)",
          }}
        />
        <Dust count={8} opacity={0.07} />
        <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "clamp(55svh,68vh,78svh)", padding: "0 clamp(24px,5vw,72px)", textAlign: "center" }}>
          <R>
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.6rem,3.6vw,3.4rem)",
                lineHeight: 1.22,
                color: "rgba(255,255,255,0.86)",
                maxWidth: 1000,
                textShadow: tsS,
              }}
            >
              {lang === "en"
                ? "“We say yes slowly. When we do, we mean it for a year.”"
                : "“Decimos sí despacio. Cuando lo decimos, lo mantenemos un año.”"}
            </p>
          </R>
        </div>
      </section>

      <section style={{ padding: "clamp(80px,11vw,160px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
        <Dust count={6} opacity={0.06} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2
              style={{
                fontSize: "clamp(2rem,5vw,4.4rem)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                color: "white",
                textShadow: tsS,
              }}
            >
              {t.closingH}
            </h2>
          </R>
          <R delay={0.2}>
            <p style={{ marginTop: "clamp(20px,2.5vw,32px)", fontSize: "clamp(0.95rem,1.22vw,1.1rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.6)", fontWeight: 300, textShadow: ts }}>
              {t.closingBody}
            </p>
          </R>
          <R delay={0.32}>
            <Magnetic>
              <Link
                href="/contact"
                style={{
                  marginTop: "clamp(32px,4vw,52px)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  padding: "0.95rem clamp(1.4rem,3vw,2.6rem)",
                  fontSize: "clamp(10px,0.85vw,12px)",
                  fontWeight: 500,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#060606",
                  textDecoration: "none",
                  background: "white",
                  borderRadius: 100,
                  transition: "background 0.4s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.88)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                {t.cta}
              </Link>
            </Magnetic>
          </R>
        </div>
      </section>
    </main>
  );
}
