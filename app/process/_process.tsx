"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { Magnetic } from "../_lib/chrome";

const en = {
  eyebrow: "Process",
  h1a: "Slow, deliberate,",
  h1b: "intentional.",
  lead:
    "We move through every project in four movements. None is skipped, none is rushed. The work is finished when the space is remembered as a feeling.",
  movements: [
    {
      number: "01",
      title: "Listen",
      body: [
        "Every project begins in silence. Before sketching, before mood, before any decision — we sit with you and with the place.",
        "We ask what the brand wants to make people feel, then we ask what it is afraid to say. The second answer matters more.",
      ],
    },
    {
      number: "02",
      title: "Map atmospheres",
      body: [
        "We translate the listening into a single visual hypothesis: the temperature, the materials, the silence, the texture of presence.",
        "This is not a moodboard. It is a tuning fork — one note the rest of the system aligns to.",
      ],
    },
    {
      number: "03",
      title: "Build the system",
      body: [
        "Identity, space, motion, sound, gesture. Each is designed as part of the same body, never as separate deliverables.",
        "We move slowly. We discard often. The system holds when nothing in it asks for attention.",
      ],
    },
    {
      number: "04",
      title: "Live with it",
      body: [
        "Delivery is not the end. We stay with the work through its first nights — adjusting lighting, refining gestures, tuning the silence.",
        "A world is not a launch. It is a slow inhabitation.",
      ],
    },
  ],
  closingH: "Worlds are not built fast.",
  closingBody:
    "If you have a brand that wants to be felt — a hotel, a club, an architecture, an identity — we would like to hear about it.",
  cta: "Start a conversation",
  back: "← Home",
};

const es = {
  eyebrow: "Método",
  h1a: "Lento, deliberado,",
  h1b: "intencional.",
  lead:
    "Atravesamos cada proyecto en cuatro movimientos. Ninguno se omite, ninguno se acelera. El trabajo termina cuando el espacio se recuerda como una sensación.",
  movements: [
    {
      number: "01",
      title: "Escuchar",
      body: [
        "Todo proyecto empieza en silencio. Antes del boceto, antes del mood, antes de cualquier decisión — nos sentamos contigo y con el lugar.",
        "Preguntamos qué quiere hacer sentir la marca, después preguntamos qué teme decir. La segunda respuesta importa más.",
      ],
    },
    {
      number: "02",
      title: "Mapear atmósferas",
      body: [
        "Traducimos la escucha en una sola hipótesis visual: la temperatura, los materiales, el silencio, la textura de la presencia.",
        "No es un moodboard. Es un diapasón — una nota a la que se alinea el resto del sistema.",
      ],
    },
    {
      number: "03",
      title: "Construir el sistema",
      body: [
        "Identidad, espacio, movimiento, sonido, gesto. Cada uno se diseña como parte del mismo cuerpo, nunca como entregables separados.",
        "Avanzamos despacio. Descartamos a menudo. El sistema sostiene cuando nada en él pide atención.",
      ],
    },
    {
      number: "04",
      title: "Habitar el trabajo",
      body: [
        "La entrega no es el final. Nos quedamos con el trabajo durante sus primeras noches — ajustando la luz, afinando los gestos, calibrando el silencio.",
        "Un mundo no es un lanzamiento. Es una inhabitación lenta.",
      ],
    },
  ],
  closingH: "Los mundos no se construyen rápido.",
  closingBody:
    "Si tienes una marca que quiere ser sentida — un hotel, un club, una arquitectura, una identidad — nos gustaría saber de ella.",
  cta: "Iniciar conversación",
  back: "← Inicio",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function Process() {
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
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(4,3,2,0.92)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        <nav
          style={{
            maxWidth: 1600,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            padding: "0 clamp(20px,5vw,56px)",
          }}
        >
          <Link href="/" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.42em", color: "white", textTransform: "uppercase", textDecoration: "none" }}>
            XNLAB
          </Link>
          <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
          </button>
        </nav>
      </header>

      <section
        style={{
          position: "relative",
          padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(60px,9vw,120px)",
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        <Dust count={8} opacity={0.06} />
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
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(1rem,1.35vw,1.22rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.74)",
              fontWeight: 300,
              maxWidth: 760,
              textShadow: ts,
            }}
          >
            {t.lead}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(48px,8vw,120px)", maxWidth: 1120, margin: "0 auto" }}>
        {t.movements.map((m, i) => (
          <R key={m.number} delay={0.05 * i}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(40px,5vw,72px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(120px,180px)_1fr]"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(2rem,3.6vw,3.4rem)",
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {m.number}
                </p>
                <p style={labelStyle}>{m.title}</p>
              </div>
              <div style={{ maxWidth: 720 }}>
                <h2
                  style={{
                    fontSize: "clamp(1.8rem,3.6vw,3.4rem)",
                    fontWeight: 400,
                    lineHeight: 1.04,
                    letterSpacing: "-0.045em",
                    color: "white",
                    textShadow: tsS,
                    marginBottom: "clamp(20px,2.5vw,32px)",
                  }}
                >
                  {m.title}
                </h2>
                {m.body.map((p, j) => (
                  <p
                    key={j}
                    style={{
                      marginBottom: j === m.body.length - 1 ? 0 : "1.2em",
                      fontSize: "clamp(1rem,1.22vw,1.12rem)",
                      lineHeight: 1.72,
                      color: "rgba(255,255,255,0.7)",
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

      <section
        style={{
          padding: "clamp(80px,11vw,160px) clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
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
            <p
              style={{
                marginTop: "clamp(20px,2.5vw,32px)",
                fontSize: "clamp(0.95rem,1.22vw,1.1rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 300,
                textShadow: ts,
              }}
            >
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
