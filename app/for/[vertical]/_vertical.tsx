"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Label, Dust, Commentary, useLang } from "../../_lib/atoms";
import { Nav } from "../../_lib/nav";
import { AtelierStar } from "../../_lib/ornaments";
import { SiteFooter } from "../../_lib/site-footer";
import { SURFACES, type Vertical } from "../../_lib/verticals";

// /for/[vertical] — the applied layer. One template, driven entirely by
// the Vertical data object. The six universal surfaces (the orbs) stay
// constant; each vertical supplies what they MEAN for that industry.
// Adding a vertical is a data edit in verticals.ts — never a new page.
//
// Structure mirrors the home's editorial rhythm so the applied pages
// feel like the same studio: hero → perception gap → six surfaces
// applied → one CTA. One dominant verb per page (AGENTS.md §5): apply.

export default function VerticalPage({ vertical: v }: { vertical: Vertical }) {
  const [lang, setLang] = useLang();
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

      {/* HERO — cinematic but lighter than the home hero (no orbs). The
          vertical's promise stated plainly, the brand's atmosphere kept. */}
      <section
        style={{
          position: "relative",
          minHeight: "min(86svh, 880px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "clamp(96px,14vh,160px) clamp(20px,5vw,64px) clamp(56px,8vh,96px)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 70% at 50% 8%, rgba(216,147,42,0.13) 0%, rgba(180,110,40,0.04) 34%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={6} opacity={0.05} />
        <div style={{ position: "relative", zIndex: 5, maxWidth: 940 }}>
          <R>
            <p
              style={{
                margin: 0,
                fontSize: "clamp(10px,0.85vw,11px)",
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "rgba(232,183,131,0.72)",
                fontWeight: 500,
                marginBottom: "clamp(20px,3vw,32px)",
                textShadow: ts,
              }}
            >
              {v.eyebrow[lang]}
            </p>
            <h1
              style={{
                fontSize: "clamp(2.4rem,6vw,5.4rem)",
                fontWeight: 400,
                lineHeight: 0.96,
                letterSpacing: "-0.055em",
                textShadow: tsS,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              <W text={v.h1a[lang]} delay={0} />
              <span
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.82)",
                  fontSize: "1.2em",
                }}
              >
                <W text={v.h1b[lang]} delay={0.12} />
              </span>
            </h1>
          </R>
          <R delay={0.3}>
            <p
              style={{
                marginTop: "clamp(26px,3.4vw,42px)",
                fontSize: "clamp(1rem,1.3vw,1.22rem)",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 300,
                maxWidth: 680,
                marginLeft: "auto",
                marginRight: "auto",
                textShadow: ts,
                textWrap: "balance",
              }}
            >
              {v.strap[lang]}
            </p>
          </R>
        </div>
      </section>

      {/* 001 — THE PERCEPTION GAP */}
      <section style={{ padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 18% 24%, rgba(216,147,42,0.035) 0%, rgba(180,110,40,0.009) 35%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={5} opacity={0.04} />
        <div style={{ maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.6vw,48px)" }}>
            <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>{v.gapLabel[lang]}</Label>
            <h2 style={{ fontSize: "clamp(1.7rem,3.6vw,3.6rem)", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-0.05em", textShadow: tsS, margin: 0 }}>
              <W text={v.gapH1a[lang]} delay={0} />{" "}
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.2em" }}>
                <W text={v.gapH1b[lang]} delay={0.1} />
              </span>
            </h2>
            <Commentary delay={0.3}>{v.gapIntro[lang]}</Commentary>
          </R>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 0, gridTemplateColumns: "1fr" }} className="md:grid-cols-2">
            {v.symptoms.map((s, i) => (
              <R key={s.en} delay={0.05 * i}>
                <li
                  style={{
                    position: "relative",
                    padding: "clamp(14px,1.8vw,22px) clamp(16px,2vw,24px) clamp(14px,1.8vw,22px) clamp(36px,3.4vw,48px)",
                    borderTop: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "clamp(0.95rem,1.1vw,1.08rem)",
                    lineHeight: 1.55,
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 300,
                    letterSpacing: "-0.005em",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "clamp(14px,1.6vw,22px)",
                      top: "clamp(24px,2.7vw,36px)",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.34em",
                      color: "rgba(232,183,131,0.55)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s[lang]}
                </li>
              </R>
            ))}
          </ul>
          <R delay={0.4}>
            <p
              style={{
                marginTop: "clamp(28px,3vw,40px)",
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.1rem,1.5vw,1.42rem)",
                lineHeight: 1.4,
                color: "rgba(232,183,131,0.82)",
                textAlign: "center",
                maxWidth: 720,
                marginLeft: "auto",
                marginRight: "auto",
                letterSpacing: "-0.005em",
                textWrap: "balance",
              }}
            >
              {v.gapResolve[lang]}
            </p>
          </R>
        </div>
      </section>

      {/* 002 — SIX SURFACES, APPLIED. The universal orbs, expressed in the
          vertical's language. Each card links to its canonical world. */}
      <section style={{ padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)", position: "relative", overflow: "hidden" }}>
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
            background: "radial-gradient(ellipse 75% 55% at 50% 18%, rgba(70,45,20,0.16) 0%, rgba(22,14,8,0.07) 38%, transparent 72%)",
            pointerEvents: "none",
          }}
        />
        <Dust count={4} opacity={0.035} />
        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R style={{ textAlign: "center", marginBottom: "clamp(28px,3.6vw,52px)" }}>
            <Label style={{ marginBottom: 8 }}>{v.surfacesLabel[lang]}</Label>
            <h2
              style={{
                fontSize: "clamp(2rem,3.8vw,4rem)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.06em",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                textShadow: tsS,
                marginTop: "clamp(12px,2vw,24px)",
              }}
            >
              <W text={lang === "en" ? "Six surfaces." : "Seis superficies."} delay={0} />
              <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.65)", fontSize: "1.2em" }}>
                <W text={v.surfacesH1b[lang]} delay={0.1} />
              </span>
            </h2>
            <R delay={0.22}>
              <p
                style={{
                  marginTop: "clamp(16px,2vw,24px)",
                  fontSize: "clamp(0.95rem,1.18vw,1.08rem)",
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.58)",
                  fontWeight: 300,
                  maxWidth: 640,
                  margin: "clamp(16px,2vw,24px) auto 0",
                  textShadow: ts,
                }}
              >
                {v.surfacesIntro[lang]}
              </p>
            </R>
          </R>
          <div
            style={{
              display: "grid",
              gap: 0,
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              marginTop: "clamp(40px,5vw,72px)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {SURFACES.map((s, i) => (
              <R key={s.slug} delay={0.05 * i}>
                <Link
                  href={`/worlds/${s.slug}`}
                  style={{
                    display: "block",
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    padding: "clamp(22px,2.4vw,32px) clamp(18px,2vw,28px)",
                    borderRight: "1px solid rgba(255,255,255,0.05)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    minHeight: 168,
                    transition: "background 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(232,183,131,0.06) 0%, rgba(232,183,131,0.015) 45%, transparent 75%)";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(232,183,131,0.18)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.34em", color: "rgba(232,183,131,0.6)" }}>{s.n}</span>
                  <h3
                    style={{
                      margin: "clamp(14px,1.6vw,20px) 0 clamp(10px,1vw,14px)",
                      fontSize: "clamp(1.05rem,1.4vw,1.35rem)",
                      fontWeight: 400,
                      lineHeight: 1.18,
                      letterSpacing: "-0.02em",
                      color: "white",
                    }}
                  >
                    {s.label[lang]}
                  </h3>
                  <p style={{ margin: 0, fontSize: "clamp(0.92rem,1.1vw,1.02rem)", lineHeight: 1.6, color: "rgba(255,255,255,0.62)", fontWeight: 300 }}>
                    {v.applied[i][lang]}
                  </p>
                </Link>
              </R>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA — one dominant verb: apply. */}
      <section style={{ padding: "clamp(56px,6vw,96px) clamp(20px,5vw,64px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(216,147,42,0.04) 0%, rgba(180,110,40,0.011) 38%, transparent 68%)",
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
            background: "linear-gradient(to right, transparent, rgba(232,183,131,0.18), transparent)",
            pointerEvents: "none",
          }}
        />
        <Dust count={6} opacity={0.04} />
        <div style={{ maxWidth: 920, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(14px,1.8vw,22px)" }}>
              <AtelierStar size={18} />
            </div>
            <Label style={{ marginBottom: "clamp(12px,1.6vw,20px)" }}>003 — {navT.na}</Label>
            <h2 style={{ fontSize: "clamp(2rem,4.2vw,4.4rem)", fontWeight: 400, lineHeight: 0.9, letterSpacing: "-0.06em", textShadow: tsS, margin: 0 }}>
              <W text={v.ctaH[lang]} delay={0} />
            </h2>
            <p
              style={{
                marginTop: "clamp(24px,3vw,36px)",
                fontSize: "clamp(0.88rem,1.22vw,1.05rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.34)",
                fontWeight: 300,
                maxWidth: 640,
                margin: "clamp(24px,3vw,36px) auto 0",
                textShadow: ts,
              }}
            >
              {v.ctaLine[lang]}
            </p>
          </R>
          <R delay={0.4}>
            <div style={{ marginTop: "clamp(32px,3.8vw,48px)", display: "flex", justifyContent: "center" }}>
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
                  transition:
                    "background 0.5s cubic-bezier(0.22,1,0.36,1), border-color 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.55s cubic-bezier(0.22,1,0.36,1)",
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
                {lang === "en" ? "Begin the conversation" : "Empezar la conversación"} <span aria-hidden style={{ fontSize: 14 }}>→</span>
              </Link>
            </div>
          </R>
          <R delay={0.55}>
            <div style={{ marginTop: "clamp(22px,2.6vw,32px)", display: "flex", justifyContent: "center" }}>
              <a
                href="mailto:studio@xnlab.io"
                style={{
                  fontSize: "clamp(10px,0.85vw,11px)",
                  fontWeight: 500,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "color 0.4s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(232,183,131,0.85)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                onFocus={(e) => { e.currentTarget.style.color = "rgba(232,183,131,0.85)"; }}
                onBlur={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                studio@xnlab.io
              </a>
            </div>
          </R>
        </div>
      </section>

      <SiteFooter lang={lang} />
    </main>
  );
}
