"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ts, tsS, serif, Dust, useLang } from "../_lib/atoms";
import { Magnetic } from "../_lib/chrome";
import { WordmarkLink } from "../_lib/wordmark";

const en = {
  eyebrow: "Manifesto",
  intro: "Six statements.",
  statements: [
    "We design presence, not content.",
    "We work in silence — and call it concentration.",
    "Atmospheres before identities. Identities before logos.",
    "A space well designed is a space well remembered.",
    "Restraint is the loudest tool we own.",
    "Worlds are built slowly. We are patient.",
  ],
  closing: "Read again, slowly.",
  cta: "Start a project",
  back: "← Home",
};

const es = {
  eyebrow: "Manifiesto",
  intro: "Seis afirmaciones.",
  statements: [
    "Diseñamos presencia, no contenido.",
    "Trabajamos en silencio — y lo llamamos concentración.",
    "Atmósferas antes que identidades. Identidades antes que logos.",
    "Un espacio bien diseñado es un espacio bien recordado.",
    "La contención es la herramienta más ruidosa que tenemos.",
    "Los mundos se construyen despacio. Somos pacientes.",
  ],
  closing: "Léelo otra vez, despacio.",
  cta: "Iniciar un proyecto",
  back: "← Inicio",
};

function Statement({ text, index }: { text: string; index: number }) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "78svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 clamp(24px,7vw,120px)",
        textAlign: "center",
      }}
    >
      <motion.p
        initial={{ opacity: 0, y: 24, filter: "blur(16px)", letterSpacing: "0.2em" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "-0.005em" }}
        viewport={{ once: true, margin: "-30%" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(1.9rem,5vw,4.4rem)",
          lineHeight: 1.18,
          color: "rgba(255,255,255,0.92)",
          maxWidth: 1100,
          textShadow: tsS,
        }}
      >
        {text}
      </motion.p>
      <p
        aria-hidden
        style={{
          position: "absolute",
          top: "clamp(20px,3vh,40px)",
          left: "clamp(24px,5vw,72px)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </p>
    </section>
  );
}

export default function Manifesto() {
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
        position: "relative",
      }}
    >
      <Dust count={10} opacity={0.05} />
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(4,3,2,0.85)",
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
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(24px,7vw,120px)",
          textAlign: "center",
        }}
      >
        {/* Deep red-tinted radial glow centred on the headline */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 55% 50% at 50% 45%, rgba(80,20,15,0.45) 0%, rgba(20,8,8,0.2) 38%, transparent 72%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={16} opacity={0.09} />
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            marginBottom: 36,
            position: "relative",
            zIndex: 5,
          }}
        >
          {t.eyebrow}
        </p>
        <motion.h1
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(3.6rem,11vw,11rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            color: "white",
            textShadow: tsS,
          }}
        >
          {t.intro}
        </motion.h1>
      </section>

      {t.statements.map((s, i) => (
        <Statement key={i} text={s} index={i} />
      ))}

      <section
        style={{
          position: "relative",
          minHeight: "70svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <motion.p
          initial={{ opacity: 0, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-25%" }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(1.6rem,3.6vw,3rem)",
            lineHeight: 1.2,
            color: "rgba(255,255,255,0.6)",
            marginBottom: "clamp(32px,5vw,60px)",
            textShadow: ts,
          }}
        >
          {t.closing}
        </motion.p>
        <Magnetic>
          <Link
            href="/contact"
            style={{
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
      </section>
    </main>
  );
}
