"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { Magnetic } from "../_lib/chrome";
import { WordmarkLink } from "../_lib/wordmark";
import { Orb } from "../_lib/orb";
import { worlds, mythology } from "../_lib/worlds";

const en = {
  eyebrow: "The Universe · 001",
  h1a: "A living",
  h1b: "laboratory.",
  lead:
    "XNLAB is not an agency in the usual sense. It is a laboratory of worlds — six Cores orbiting a central origin, each with its own material, energy and physics. This page is the entrance.",
  centralLabel: "The Central Core",
  worldsLabel: "Six Worlds, one universe",
  worldsIntro:
    "Each Core represents a discipline of the studio and a register of cultural energy. Different colour. Different material. Different behaviour. Same physics.",
  enter: "Enter",
  ctaH: "Cross the threshold.",
  ctaBody:
    "If you have a brand, a venue, a film, an artist or a digital world that belongs inside this universe — we would like to hear about it.",
  cta: "Initiate Contact",
  back: "← Home",
};

const es = {
  eyebrow: "El Universo · 001",
  h1a: "Un laboratorio",
  h1b: "vivo.",
  lead:
    "XNLAB no es una agencia en el sentido habitual. Es un laboratorio de mundos — seis Núcleos orbitando un origen central, cada uno con su propio material, energía y física. Esta página es la entrada.",
  centralLabel: "El Núcleo Central",
  worldsLabel: "Seis mundos, un universo",
  worldsIntro:
    "Cada Núcleo representa una disciplina del estudio y un registro de energía cultural. Color distinto. Material distinto. Comportamiento distinto. Misma física.",
  enter: "Entrar",
  ctaH: "Cruza el umbral.",
  ctaBody:
    "Si tienes una marca, un local, una película, un artista o un mundo digital que pertenezca a este universo — nos gustaría saber de él.",
  cta: "Iniciar Contacto",
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
            flexWrap: "wrap",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "0.18em",
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
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(24px,3vw,48px)",
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
                  padding: "clamp(36px,4vw,56px) clamp(20px,3vw,40px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 8,
                  background: "rgba(10,8,6,0.4)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.5s, background 0.5s, transform 0.5s",
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
                <div style={{ width: "clamp(140px,14vw,200px)", height: "clamp(140px,14vw,200px)" }}>
                  <Orb world={w} size={200} />
                </div>
                <p
                  style={{
                    marginTop: "clamp(24px,3vw,36px)",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: w.color.hex,
                  }}
                >
                  {w.number} · {w.color.name}
                </p>
                <h3
                  style={{
                    marginTop: 12,
                    fontSize: "clamp(1.2rem,1.8vw,1.6rem)",
                    fontWeight: 400,
                    lineHeight: 1.15,
                    letterSpacing: "-0.025em",
                    color: "white",
                    textShadow: ts,
                  }}
                >
                  {w.title[lang]}
                </h3>
                <p
                  style={{
                    marginTop: 14,
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: 320,
                  }}
                >
                  {w.essence[lang]}
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
