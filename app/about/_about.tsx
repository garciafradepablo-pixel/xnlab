"use client";
import Link from "next/link";
import Image from "next/image";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";

const en = {
  eyebrow: "About the Studio",
  h1a: "A studio for",
  h1b: "presence.",
  lead:
    "XNLAB is a creative direction studio for modern luxury. We design atmospheres, identities and visual systems that shape how a brand is remembered — not what it says.",
  approachLabel: "Approach",
  approachH: "Worldbuilding, not branding.",
  approach: [
    "We treat each project as a complete world: spatial atmosphere, visual language, sound, gesture and silence.",
    "Our work moves between physical space, digital presence and cultural memory. We work slowly, with restraint, and with very few clients at a time.",
  ],
  beliefsLabel: "Beliefs",
  beliefs: [
    "Presence over content.",
    "Darkness as canvas.",
    "Restraint as the loudest tool.",
    "A space remembered is a space well designed.",
  ],
  practiceLabel: "Practice",
  practice: [
    "Hospitality Systems",
    "Nightlife Atmospheres",
    "Emotional Architecture",
    "Living Identities",
  ],
  contactH: "By appointment only.",
  contactBody:
    "We collaborate with a small group of clients each year. If our work resonates, we'd like to hear from you.",
  cta: "Initiate Contact",
  back: "← Home",
  studio: "Studio",
};
const es = {
  eyebrow: "Sobre el Estudio",
  h1a: "Un estudio de",
  h1b: "presencia.",
  lead:
    "XNLAB es un estudio de dirección creativa para el lujo moderno. Diseñamos atmósferas, identidades y sistemas visuales que moldean cómo se recuerda una marca — no lo que dice.",
  approachLabel: "Método",
  approachH: "Worldbuilding, no branding.",
  approach: [
    "Tratamos cada proyecto como un mundo completo: atmósfera espacial, lenguaje visual, sonido, gesto y silencio.",
    "Nuestro trabajo se mueve entre el espacio físico, la presencia digital y la memoria cultural. Trabajamos despacio, con contención, y con muy pocos clientes a la vez.",
  ],
  beliefsLabel: "Creencias",
  beliefs: [
    "Presencia sobre contenido.",
    "La oscuridad como lienzo.",
    "La contención como la herramienta más ruidosa.",
    "Un espacio recordado es un espacio bien diseñado.",
  ],
  practiceLabel: "Práctica",
  practice: [
    "Hospitality Systems",
    "Nightlife Atmospheres",
    "Emotional Architecture",
    "Living Identities",
  ],
  contactH: "Solo con cita previa.",
  contactBody:
    "Colaboramos con un grupo reducido de clientes cada año. Si nuestro trabajo resuena, nos gustaría saber de ti.",
  cta: "Iniciar Contacto",
  back: "← Inicio",
  studio: "Estudio",
};

export default function About() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  return (
    <main
      style={{
        minHeight: "100vh",
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
          <WordmarkLink />
          <Link
            href="/"
            style={{
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
            }}
          >
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
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
        {/* Atmospheric backdrop — soft warm radial centred on the headline */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(60,40,28,0.55) 0%, rgba(20,12,8,0.25) 35%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Dust count={14} opacity={0.08} />
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            marginBottom: 28,
            position: "relative",
            zIndex: 5,
          }}
        >
          {t.eyebrow}
        </p>
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
            <W text={t.h1b} delay={0.12} />
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

      <section style={{ position: "relative", minHeight: "clamp(60svh,72vh,82svh)", overflow: "hidden" }}>
        <Image
          src="/images/02_worldbuilding_floating.jpg"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(6,6,6,1) 0%, rgba(4,3,2,0.18) 18%, rgba(4,3,2,0.4) 60%, rgba(6,6,6,1) 100%)",
          }}
        />
        <Dust count={8} opacity={0.07} />
        <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "clamp(60svh,72vh,82svh)", padding: "0 clamp(24px,5vw,72px)", textAlign: "center" }}>
          <R>
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.6rem,3.6vw,3.4rem)",
                lineHeight: 1.22,
                color: "rgba(255,255,255,0.88)",
                maxWidth: 940,
                textShadow: tsS,
              }}
            >
              {lang === "en"
                ? "We build worlds for brands that want to be felt — not described."
                : "Construimos mundos para marcas que quieren ser sentidas — no descritas."}
            </p>
          </R>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(72px,10vw,140px) clamp(24px,7vw,96px)",
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(40px,5vw,72px)",
          gridTemplateColumns: "1fr",
        }}
        className="md:grid-cols-[minmax(160px,220px)_1fr]"
      >
        <R>
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {t.approachLabel}
          </p>
        </R>
        <div>
          <R>
            <h2
              style={{
                fontSize: "clamp(1.8rem,3.6vw,3.6rem)",
                fontWeight: 400,
                lineHeight: 1.02,
                letterSpacing: "-0.045em",
                color: "white",
                textShadow: tsS,
              }}
            >
              {t.approachH}
            </h2>
          </R>
          {t.approach.map((p, i) => (
            <R key={i} delay={0.1 + i * 0.08}>
              <p
                style={{
                  marginTop: i === 0 ? 28 : 18,
                  fontSize: "clamp(1rem,1.22vw,1.1rem)",
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 300,
                }}
              >
                {p}
              </p>
            </R>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "0 clamp(24px,7vw,96px) clamp(72px,10vw,140px)",
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(40px,5vw,72px)",
          gridTemplateColumns: "1fr",
        }}
        className="md:grid-cols-[minmax(160px,220px)_1fr]"
      >
        <R>
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {t.beliefsLabel}
          </p>
        </R>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {t.beliefs.map((b, i) => (
            <R key={i} delay={i * 0.06}>
              <li
                style={{
                  padding: "clamp(20px,2.5vw,28px) 0",
                  borderTop: i === 0 ? "1px solid rgba(255,255,255,0.08)" : undefined,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.3rem,2.4vw,2rem)",
                  lineHeight: 1.18,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {b}
              </li>
            </R>
          ))}
        </ul>
      </section>

      {/* Pull quote between Beliefs and Practice */}
      <section style={{ padding: "clamp(40px,6vw,80px) clamp(24px,7vw,96px) clamp(60px,8vw,100px)", textAlign: "center", position: "relative" }}>
        <Dust count={6} opacity={0.05} />
        <R>
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "clamp(1.7rem,4vw,3.4rem)",
              lineHeight: 1.22,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 1000,
              margin: "0 auto",
              textShadow: tsS,
              position: "relative",
              zIndex: 5,
            }}
          >
            {lang === "en"
              ? "“A studio is not what it says. It is what it makes you remember.”"
              : "“Un estudio no es lo que dice. Es lo que te hace recordar.”"}
          </p>
        </R>
      </section>

      <section
        style={{
          padding: "0 clamp(24px,7vw,96px) clamp(80px,10vw,140px)",
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(40px,5vw,72px)",
          gridTemplateColumns: "1fr",
        }}
        className="md:grid-cols-[minmax(160px,220px)_1fr]"
      >
        <R>
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {t.practiceLabel}
          </p>
        </R>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {t.practice.map((p, i) => (
            <R key={p} delay={i * 0.05}>
              <li
                style={{
                  padding: "clamp(12px,1.6vw,18px) 0",
                  fontSize: "clamp(1rem,1.22vw,1.15rem)",
                  color: "rgba(255,255,255,0.72)",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                }}
              >
                {p}
              </li>
            </R>
          ))}
        </ul>
      </section>

      <section
        style={{
          padding: "clamp(80px,10vw,140px) clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
        }}
      >
        <Dust count={6} opacity={0.06} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2
              style={{
                fontSize: "clamp(2rem,5vw,4.6rem)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                color: "white",
                textShadow: tsS,
              }}
            >
              {t.contactH}
            </h2>
          </R>
          <R delay={0.2}>
            <p
              style={{
                marginTop: "clamp(20px,2.5vw,32px)",
                fontSize: "clamp(0.95rem,1.22vw,1.1rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.55)",
                fontWeight: 300,
                textShadow: ts,
              }}
            >
              {t.contactBody}
            </p>
          </R>
          <R delay={0.32}>
            <Link
              href="/contact"
              style={{
                marginTop: "clamp(28px,3.5vw,44px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.7rem",
                padding: "0.85rem clamp(1.2rem,3vw,2.4rem)",
                fontSize: "clamp(10px,0.85vw,12px)",
                fontWeight: 500,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#060606",
                textDecoration: "none",
                background: "white",
                borderRadius: 100,
              }}
            >
              {t.cta}
            </Link>
          </R>
        </div>
      </section>
    </main>
  );
}
