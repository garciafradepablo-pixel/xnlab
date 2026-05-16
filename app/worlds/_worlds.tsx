"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { Magnetic } from "../_lib/chrome";
import { WordmarkLink } from "../_lib/wordmark";
import { Orb } from "../_lib/orb";
import { worlds, mythology } from "../_lib/worlds";

const en = {
  eyebrow: "The Universe",
  h1a: "Selected",
  h1b: "Worlds.",
  lead:
    "Six emotional systems. Six ways to build presence.",
  methodLabel: "Method",
  methodH: "The Worlds are not decoration.",
  methodH2: "They are how XNLAB chooses the emotional physics of a project.",
  methodBody: [
    "Each Core defines how a brand should look, move, sound and be remembered across digital surfaces.",
    "A restaurant does not need the same atmosphere as a music artist. A luxury brand does not move like a nightlife event. A digital world does not breathe like architecture.",
    "XNLAB uses each Core to define visual language, campaign direction, motion style, content system, digital presence and emotional memory.",
  ],
  loreLabel: "Mythology",
  centralLabel: "The Central Core",
  worldsLabel: "Six Worlds, one universe",
  worldsIntro:
    "Each Core represents a discipline of the studio and a register of cultural energy. Different colour. Different material. Different behaviour. Same physics.",
  enter: "Enter world",
  ctaH: "Build something unforgettable.",
  ctaBody:
    "If you have a brand, a venue, an artist or a digital project that belongs inside this universe, we would like to hear about it.",
  cta: "Start a project",
  back: "← Home",
};

const es = {
  eyebrow: "El Universo",
  h1a: "Mundos",
  h1b: "seleccionados.",
  lead:
    "Seis sistemas emocionales. Seis formas de construir presencia.",
  methodLabel: "Método",
  methodH: "Los Mundos no son decoración.",
  methodH2: "Son cómo XNLAB elige la física emocional de un proyecto.",
  methodBody: [
    "Cada Núcleo define cómo una marca debe verse, moverse, sonar y ser recordada en sus superficies digitales.",
    "Un restaurante no necesita la misma atmósfera que un artista musical. Una marca de lujo no se mueve como un evento nocturno. Un mundo digital no respira como una arquitectura.",
    "XNLAB usa cada Núcleo para definir lenguaje visual, dirección de campaña, estilo de animación, sistema de contenido, presencia digital y memoria emocional.",
  ],
  loreLabel: "Mitología",
  centralLabel: "El Núcleo Central",
  worldsLabel: "Seis mundos, un universo",
  worldsIntro:
    "Cada Núcleo representa una disciplina del estudio y un registro de energía cultural. Color distinto. Material distinto. Comportamiento distinto. Misma física.",
  enter: "Entrar al mundo",
  ctaH: "Construye algo inolvidable.",
  ctaBody:
    "Si tienes una marca, un local, un artista o un proyecto digital que pertenezca a este universo, nos gustaría saber de él.",
  cta: "Iniciar un proyecto",
  back: "← Inicio",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

export default function WorldsIndex() {
  const [lang, setLang] = useLang();
  const t = lang === "en" ? en : es;
  const cc = mythology.centralCore[lang];
  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "#060606",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
        position: "relative",
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
          <Link href="/" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{t.back}</Link>
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

      {/* Hero — the entrance */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(120px,16vh,180px) clamp(24px,5vw,72px) clamp(60px,8vw,120px)",
          textAlign: "center",
        }}
      >
        <Dust count={14} opacity={0.07} />
        <p style={{ ...labelStyle, marginBottom: 32, position: "relative", zIndex: 5 }}>{t.eyebrow}</p>
        <h1
          style={{
            fontSize: "clamp(3rem,9vw,9rem)",
            fontWeight: 400,
            lineHeight: 0.92,
            letterSpacing: "-0.055em",
            textShadow: tsS,
            position: "relative",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <W text={t.h1a} delay={0} />
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.18em" }}>
            <W text={t.h1b} delay={0.14} />
          </span>
        </h1>
        <R delay={0.3}>
          <p style={{ marginTop: "clamp(28px,3.5vw,44px)", fontSize: "clamp(1rem,1.3vw,1.2rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.7)", fontWeight: 300, maxWidth: 760, textShadow: ts, margin: "clamp(28px,3.5vw,44px) auto 0" }}>
            {t.lead}
          </p>
        </R>
      </section>

      {/* Methodology — the commercial layer that explains why the
          Worlds are a system, not just lore. Sits between the hero
          and the mythology so the visitor first understands the
          professional logic of the universe before entering it. */}
      <section style={{ position: "relative", padding: "clamp(56px,8vw,120px) clamp(24px,7vw,96px)", borderTop: "1px solid rgba(255,255,255,0.05)", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "grid", gap: "clamp(36px,4.6vw,72px)" }} className="grid-cols-1 md:grid-cols-[minmax(160px,220px)_1fr]">
          <div>
            <R><p style={labelStyle}>{t.methodLabel}</p></R>
          </div>
          <div style={{ maxWidth: 760 }}>
            <R>
              <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.8rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.035em", color: "white", textShadow: tsS, margin: 0 }}>
                {t.methodH}
              </h2>
            </R>
            <R delay={0.15}>
              <p style={{ marginTop: "clamp(12px,1.6vw,20px)", fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1.15rem,1.65vw,1.55rem)", lineHeight: 1.32, color: "rgba(232,183,131,0.78)", letterSpacing: "-0.005em" }}>
                {t.methodH2}
              </p>
            </R>
            {t.methodBody.map((p, i) => (
              <R key={i} delay={0.25 + i * 0.08}>
                <p style={{ marginTop: i === 0 ? "clamp(24px,3vw,36px)" : "clamp(16px,2vw,22px)", fontSize: "clamp(0.98rem,1.2vw,1.12rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.72)", fontWeight: 300 }}>
                  {p}
                </p>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* Central Core */}
      <section style={{ position: "relative", padding: "clamp(48px,7vw,120px) clamp(24px,7vw,96px) clamp(72px,10vw,140px)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "clamp(40px,6vw,80px)", alignItems: "center" }} className="md:grid-cols-2">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "clamp(240px,26vw,360px)", height: "clamp(240px,26vw,360px)" }}>
              <Orb central size={360} />
            </div>
          </div>
          <div>
            <p style={{ ...labelStyle, marginBottom: 24 }}>{t.centralLabel}</p>
            <h2 style={{ fontSize: "clamp(2.2rem,4.8vw,4.2rem)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.04em", color: "white", textShadow: tsS, marginBottom: "clamp(16px,2vw,28px)" }}>
              {cc.name}
            </h2>
            <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1.2rem,2vw,1.7rem)", color: "rgba(255,255,255,0.7)", marginBottom: "clamp(20px,2.5vw,32px)" }}>
              {cc.essence}
            </p>
            {cc.body.map((p, i) => (
              <p key={i} style={{ marginBottom: i === cc.body.length - 1 ? 0 : "1.1em", fontSize: "clamp(0.98rem,1.2vw,1.12rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.72)", fontWeight: 300 }}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ORUN + CHIO + Anomalies */}
      <section style={{ padding: "clamp(48px,7vw,100px) clamp(24px,7vw,96px) clamp(72px,10vw,140px)", maxWidth: 1120, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label: mythology.orun.name, role: mythology.orun.role[lang], body: mythology.orun.body[lang] },
          { label: mythology.chio.name, role: mythology.chio.role[lang], body: mythology.chio.body[lang] },
          { label: mythology.anomalies[lang].title, role: undefined, body: mythology.anomalies[lang].body },
        ].map((m, i) => (
          <R key={m.label} delay={0.05 * i}>
            <div
              style={{
                display: "grid",
                gap: "clamp(28px,3vw,48px)",
                padding: "clamp(40px,5vw,72px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="grid-cols-1 md:grid-cols-[minmax(160px,220px)_1fr]"
            >
              <div>
                <p style={labelStyle}>{m.label}</p>
                {m.role && (
                  <p style={{ marginTop: 8, fontFamily: serif, fontStyle: "italic", fontSize: "clamp(1rem,1.3vw,1.2rem)", color: "rgba(255,255,255,0.55)" }}>
                    {m.role}
                  </p>
                )}
              </div>
              <div style={{ maxWidth: 720 }}>
                {m.body.map((p, j) => (
                  <p key={j} style={{ marginBottom: j === m.body.length - 1 ? 0 : "1.1em", fontSize: "clamp(1rem,1.22vw,1.12rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.72)", fontWeight: 300 }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </R>
        ))}
      </section>

      {/* The 6 Worlds */}
      <section style={{ padding: "clamp(48px,7vw,100px) clamp(24px,5vw,72px) clamp(72px,10vw,140px)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto clamp(40px,6vw,80px)", textAlign: "center" }}>
          <p style={{ ...labelStyle, marginBottom: 24 }}>{t.worldsLabel}</p>
          <h2 style={{ fontSize: "clamp(1.8rem,3.4vw,3rem)", fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.035em", color: "white", textShadow: tsS, marginBottom: "clamp(20px,2.5vw,32px)" }}>
            {t.worldsIntro.split(".")[0]}.
          </h2>
          <p style={{ fontSize: "clamp(0.98rem,1.2vw,1.12rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.6)", fontWeight: 300, maxWidth: 760, margin: "0 auto" }}>
            {t.worldsIntro.split(".").slice(1).join(".").trim()}
          </p>
        </div>

        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            display: "grid",
            // 7 worlds (Universe + 6 cores) — fit in one row on wide
            // screens for a premium constellation read. Falls back to
            // 4 / 3 / 2 / 1 column layouts on narrower viewports.
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "clamp(16px,2vw,28px)",
          }}
        >
          {worlds.map((w, i) => (
            <motion.div
              key={w.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
            >
              <Link
                href={`/worlds/${w.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "clamp(20px,2.4vw,32px) clamp(12px,1.8vw,24px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  background: "rgba(10,8,6,0.4)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.5s, background 0.5s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                  e.currentTarget.style.background = "rgba(14,11,9,0.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.background = "rgba(10,8,6,0.4)";
                }}
              >
                <div style={{ width: "clamp(90px,9vw,140px)", height: "clamp(90px,9vw,140px)" }}>
                  <Orb world={w} size={140} />
                </div>
                <p
                  style={{
                    marginTop: "clamp(16px,2vw,24px)",
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    color: w.color.hex,
                    margin: "clamp(16px,2vw,24px) 0 0",
                  }}
                >
                  {w.number}
                </p>
                <h3
                  style={{
                    marginTop: 8,
                    fontSize: "clamp(0.95rem,1.1vw,1.15rem)",
                    fontWeight: 500,
                    lineHeight: 1.25,
                    letterSpacing: "0.005em",
                    color: "white",
                    textShadow: ts,
                  }}
                >
                  {w.title[lang]}
                </h3>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: "clamp(11px,0.85vw,12.5px)",
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 300,
                    textShadow: ts,
                    maxWidth: 260,
                  }}
                >
                  {w.pitch[lang]}
                </p>
                <p
                  style={{
                    marginTop: 22,
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {t.enter} →
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(80px,11vw,160px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
        <Dust count={6} opacity={0.06} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2 style={{ fontSize: "clamp(2rem,5vw,4.4rem)", fontWeight: 400, lineHeight: 0.92, letterSpacing: "-0.05em", color: "white", textShadow: tsS }}>
              {t.ctaH}
            </h2>
          </R>
          <R delay={0.2}>
            <p style={{ marginTop: "clamp(20px,2.5vw,32px)", fontSize: "clamp(0.95rem,1.22vw,1.1rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.6)", fontWeight: 300, textShadow: ts }}>
              {t.ctaBody}
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
