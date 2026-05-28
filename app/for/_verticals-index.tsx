"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Label, Dust, Commentary, useLang } from "../_lib/atoms";
import { Nav } from "../_lib/nav";
import { SiteFooter } from "../_lib/site-footer";
import { verticals } from "../_lib/verticals";

// /for — the verticals hub. Lists every applied industry the studio has
// a dedicated surface for, all sharing the six-orb framework. The nav
// "Sectors" entry lands here; each card opens /for/<slug>. New verticals
// appear automatically as they're added to verticals.ts.

const copy = {
  en: {
    eyebrow: "Applied verticals",
    h1a: "Six surfaces.",
    h1b: "Your industry.",
    intro:
      "Every brand reaches its customer across the same six surfaces. What changes is the industry. Here is how the system applies to yours — a new sector is added each cycle.",
    more: "Renovation · Nightlife · Music · Tattoo studios · Cultural brands — and the next one in.",
    moreLabel: "Coming",
    ctaH: "Don't see your industry yet?",
    ctaLine: "The framework fits it. The six surfaces are the same; we tune them to your world.",
    cta: "Begin the conversation",
    open: "Open",
  },
  es: {
    eyebrow: "Verticales aplicadas",
    h1a: "Seis superficies.",
    h1b: "Tu sector.",
    intro:
      "Toda marca llega a su cliente por las mismas seis superficies. Lo que cambia es el sector. Esto es cómo se aplica el sistema al tuyo — cada ciclo se añade uno nuevo.",
    more: "Reformas · Ocio nocturno · Música · Estudios de tatuaje · Marcas culturales — y la próxima.",
    moreLabel: "Próximos",
    ctaH: "¿No ves tu sector todavía?",
    ctaLine: "El marco encaja. Las seis superficies son las mismas; las afinamos a tu mundo.",
    cta: "Empezar la conversación",
    open: "Abrir",
  },
};

export default function VerticalsIndex() {
  const [lang, setLang] = useLang();
  const t = copy[lang];
  const navT = {
    nw: lang === "en" ? "Worlds" : "Mundos",
    nse: lang === "en" ? "Systems" : "Sistemas",
    na: lang === "en" ? "Contact" : "Contacto",
  };

  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <Nav lang={lang} set={setLang} t={navT} />

      {/* HERO */}
      <section
        style={{
          position: "relative",
          minHeight: "min(64svh, 640px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(112px,16vh,180px) clamp(20px,5vw,64px) clamp(40px,6vh,72px)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 90% 70% at 50% 6%, rgba(216,147,42,0.12) 0%, rgba(180,110,40,0.035) 34%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={6} opacity={0.05} />
        <div style={{ position: "relative", zIndex: 5, maxWidth: 920 }}>
          <R>
            <Label style={{ marginBottom: "clamp(16px,2.2vw,26px)" }}>{t.eyebrow}</Label>
            <h1
              style={{
                fontSize: "clamp(2.4rem,6vw,5rem)",
                fontWeight: 400,
                lineHeight: 0.94,
                letterSpacing: "-0.055em",
                textShadow: tsS,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              <W text={t.h1a} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.82)", fontSize: "1.2em" }}>
                <W text={t.h1b} delay={0.12} />
              </span>
            </h1>
          </R>
          <Commentary delay={0.3}>{t.intro}</Commentary>
        </div>
      </section>

      {/* VERTICAL CARDS */}
      <section style={{ padding: "clamp(20px,3vw,40px) clamp(20px,5vw,64px) clamp(56px,7vw,96px)", position: "relative" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gap: 0,
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {verticals.map((v, i) => (
            <R key={v.slug} delay={0.05 * i}>
              <Link
                href={`/for/${v.slug}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  padding: "clamp(28px,3vw,44px) clamp(22px,2.4vw,34px)",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  minHeight: 220,
                  transition: "background 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(232,183,131,0.07) 0%, rgba(232,183,131,0.018) 45%, transparent 75%)";
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(232,183,131,0.2)";
                  const a = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
                  if (a) { a.style.opacity = "1"; a.style.transform = "translateX(0)"; }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                  const a = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
                  if (a) { a.style.opacity = "0"; a.style.transform = "translateX(-6px)"; }
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.34em", color: "rgba(232,183,131,0.6)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2
                  style={{
                    margin: "clamp(16px,1.8vw,24px) 0 clamp(10px,1.2vw,16px)",
                    fontSize: "clamp(1.5rem,2.4vw,2.1rem)",
                    fontWeight: 400,
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    color: "white",
                  }}
                >
                  {v.name[lang]}
                </h2>
                <p style={{ margin: 0, fontSize: "clamp(0.92rem,1.1vw,1.04rem)", lineHeight: 1.55, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>
                  {v.tagline[lang]}
                </p>
                <span
                  data-arrow
                  aria-hidden
                  style={{
                    marginTop: "auto",
                    paddingTop: "clamp(20px,2.4vw,32px)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(232,183,131,0.9)",
                    opacity: 0,
                    transform: "translateX(-6px)",
                    transition: "opacity 0.4s, transform 0.4s",
                  }}
                >
                  {t.open} →
                </span>
              </Link>
            </R>
          ))}
        </div>

        {/* Roadmap sectors — the ones not yet built, as a quiet line. */}
        <R delay={0.3}>
          <div style={{ maxWidth: 1180, margin: "clamp(28px,3.4vw,44px) auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(10px,1.2vw,14px)", textAlign: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.34em", textTransform: "uppercase", color: "rgba(232,183,131,0.55)" }}>{t.moreLabel}</span>
            <p style={{ margin: 0, maxWidth: 760, fontSize: "clamp(0.84rem,1.04vw,0.97rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.45)", fontWeight: 300, letterSpacing: "0.015em", textWrap: "balance" }}>
              {t.more}
            </p>
          </div>
        </R>
      </section>

      {/* CTA — one dominant verb: begin. */}
      <section style={{ padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 1,
            background: "linear-gradient(to right, transparent, rgba(232,183,131,0.18), transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(216,147,42,0.04) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={5} opacity={0.04} />
        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2 style={{ fontSize: "clamp(1.7rem,3.4vw,3rem)", fontWeight: 400, lineHeight: 1.0, letterSpacing: "-0.045em", textShadow: tsS, margin: 0 }}>
              <W text={t.ctaH} delay={0} />
            </h2>
            <p style={{ marginTop: "clamp(20px,2.6vw,32px)", fontSize: "clamp(0.95rem,1.2vw,1.1rem)", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", fontWeight: 300, maxWidth: 600, marginLeft: "auto", marginRight: "auto", textShadow: ts, textWrap: "balance" }}>
              {t.ctaLine}
            </p>
          </R>
          <R delay={0.35}>
            <div style={{ marginTop: "clamp(28px,3.4vw,44px)", display: "flex", justifyContent: "center" }}>
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

      <SiteFooter lang={lang} />
    </main>
  );
}
