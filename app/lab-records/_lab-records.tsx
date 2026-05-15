"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ts, tsS, serif, W, R, Dust, useLang } from "../_lib/atoms";
import { WordmarkLink } from "../_lib/wordmark";
import { records } from "../_lib/lab-records";
import { worlds } from "../_lib/worlds";

const en = {
  eyebrow: "Lab Records · 001",
  h1a: "Field notes from",
  h1b: "the laboratory.",
  lead: "Editorial observations on hospitality, luxury, music, architecture and the next decade of cultural identity. Slow reading. Updated when there is something to say.",
  cta: "Initiate Contact",
  back: "← Home",
  read: "Read →",
};

const es = {
  eyebrow: "Lab Records · 001",
  h1a: "Notas de campo",
  h1b: "del laboratorio.",
  lead: "Observaciones editoriales sobre hospitalidad, lujo, música, arquitectura y la próxima década de los sistemas de identidad cultural. Lectura lenta. Se actualiza cuando hay algo que decir.",
  cta: "Iniciar Contacto",
  back: "← Inicio",
  read: "Leer →",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

function formatDate(iso: string, lang: "en" | "es") {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function LabRecordsIndex() {
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

      <section style={{ position: "relative", padding: "clamp(140px,18vh,200px) clamp(24px,7vw,96px) clamp(56px,8vw,100px)", maxWidth: 1120, margin: "0 auto" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 50% 38%, rgba(40,28,40,0.45) 0%, rgba(16,12,20,0.2) 38%, transparent 72%)",
            pointerEvents: "none",
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
          <p style={{ marginTop: "clamp(28px,3.5vw,44px)", fontSize: "clamp(1rem,1.3vw,1.18rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.7)", fontWeight: 300, maxWidth: 720, textShadow: ts }}>
            {t.lead}
          </p>
        </R>
      </section>

      <section style={{ padding: "0 clamp(24px,7vw,96px) clamp(72px,10vw,140px)", maxWidth: 1120, margin: "0 auto" }}>
        {records.map((r, i) => {
          const world = r.worldSlug ? worlds.find((w) => w.slug === r.worldSlug) : undefined;
          const hue = world?.color.hex ?? "rgba(255,255,255,0.45)";
          return (
            <motion.div
              key={r.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
            >
              <Link
                href={`/lab-records/${r.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "clamp(24px,3vw,40px)",
                  padding: "clamp(40px,5vw,72px) 0",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background 0.4s",
                }}
                className="md:grid-cols-[minmax(160px,220px)_1fr]"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ ...labelStyle, color: hue }}>
                    {r.number} · {r.category[lang]}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {formatDate(r.date, lang)}
                  </p>
                </div>
                <div style={{ maxWidth: 760 }}>
                  <h2
                    style={{
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: "clamp(1.7rem,3.4vw,3.2rem)",
                      lineHeight: 1.18,
                      letterSpacing: "-0.02em",
                      color: "white",
                      textShadow: tsS,
                      marginBottom: "clamp(16px,2vw,28px)",
                    }}
                  >
                    {r.title[lang]}
                  </h2>
                  <p style={{ fontSize: "clamp(1rem,1.25vw,1.16rem)", lineHeight: 1.72, color: "rgba(255,255,255,0.7)", fontWeight: 300, marginBottom: "clamp(20px,2.5vw,32px)" }}>
                    {r.lead[lang]}
                  </p>
                  <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                    {t.read}
                  </p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </section>

      <section style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <R>
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
        </R>
      </section>
    </main>
  );
}
