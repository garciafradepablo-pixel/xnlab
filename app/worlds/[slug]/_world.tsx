"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../../_lib/atoms";
import { Magnetic } from "../../_lib/chrome";
import { Orb } from "../../_lib/orb";
import type { World } from "../../_lib/worlds";
import { worlds } from "../../_lib/worlds";

const ui = {
  en: {
    eyebrowPrefix: "World",
    material: "Material",
    energy: "Energy",
    notes: "Notes",
    practice: "We make",
    contact: "Start a conversation",
    next: "Next world →",
    back: "← All worlds",
  },
  es: {
    eyebrowPrefix: "Mundo",
    material: "Material",
    energy: "Energía",
    notes: "Notas",
    practice: "Hacemos",
    contact: "Iniciar conversación",
    next: "Siguiente mundo →",
    back: "← Todos los mundos",
  },
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.5)",
};

export default function WorldDetail({ world }: { world: World }) {
  const [lang, setLang] = useLang();
  const t = ui[lang];
  const c = world.color;
  // Find next world for the closing link (loops around)
  const idx = worlds.findIndex((w) => w.slug === world.slug);
  const next = worlds[(idx + 1) % worlds.length];

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
          <Link href="/" style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.42em", color: "white", textTransform: "uppercase", textDecoration: "none" }}>XNLAB</Link>
          <Link href="/worlds" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{t.back}</Link>
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

      {/* Hero — the world's portrait */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(120px,16vh,180px) clamp(24px,5vw,72px) clamp(48px,7vw,96px)",
          textAlign: "center",
          // Subtle color-tinted radial gradient using the core's deep colour
          background: `radial-gradient(circle at 50% 38%, ${c.deep.replace(",1)", ",0.55)")} 0%, transparent 60%), #060606`,
        }}
      >
        <Dust count={12} opacity={0.06} />
        <div style={{ marginBottom: "clamp(36px,5vw,60px)" }}>
          <Orb world={world} size={260} />
        </div>
        <p style={{ ...labelStyle, marginBottom: 24, color: c.hex, position: "relative", zIndex: 5 }}>
          {t.eyebrowPrefix} {world.number} · {c.name}
        </p>
        <h1
          style={{
            fontSize: "clamp(2.6rem,7.5vw,7rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.05em",
            textShadow: tsS,
            position: "relative",
            zIndex: 5,
            maxWidth: 1100,
          }}
        >
          <W text={world.title[lang]} delay={0.1} />
        </h1>
        <R delay={0.4}>
          <p
            style={{
              marginTop: "clamp(24px,3vw,40px)",
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "clamp(1.4rem,2.4vw,2.4rem)",
              lineHeight: 1.2,
              color: "rgba(255,255,255,0.8)",
              maxWidth: 880,
              textShadow: ts,
            }}
          >
            {world.essence[lang]}
          </p>
        </R>
      </section>

      {/* Material + Energy */}
      <section style={{ padding: "clamp(48px,7vw,100px) clamp(24px,7vw,96px) clamp(56px,8vw,100px)", maxWidth: 1120, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label: t.material, value: world.material[lang] },
          { label: t.energy, value: world.energy[lang] },
        ].map((row, i) => (
          <R key={row.label} delay={0.04 * i}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "clamp(24px,3vw,40px)",
                padding: "clamp(28px,3.5vw,52px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              <p style={labelStyle}>{row.label}</p>
              <p
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.15rem,1.8vw,1.7rem)",
                  lineHeight: 1.32,
                  color: "rgba(255,255,255,0.82)",
                  maxWidth: 720,
                }}
              >
                {row.value}
              </p>
            </div>
          </R>
        ))}
      </section>

      {/* Notes (body copy) */}
      <section style={{ padding: "clamp(48px,7vw,100px) clamp(24px,7vw,96px)", maxWidth: 1120, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <R>
          <p style={{ ...labelStyle, marginBottom: 32 }}>{t.notes}</p>
        </R>
        {world.body[lang].map((p, i) => (
          <R key={i} delay={0.05 * i}>
            <p
              style={{
                marginBottom: "1.4em",
                fontSize: "clamp(1.05rem,1.45vw,1.3rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.78)",
                fontWeight: 300,
                maxWidth: 760,
              }}
            >
              {p}
            </p>
          </R>
        ))}
      </section>

      {/* Practice deliverables */}
      <section style={{ padding: "clamp(56px,8vw,120px) clamp(24px,7vw,96px) clamp(72px,10vw,140px)", maxWidth: 1120, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(28px,3vw,48px)",
          }}
          className="md:grid-cols-[minmax(140px,200px)_1fr]"
        >
          <R>
            <p style={labelStyle}>{t.practice}</p>
          </R>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {world.practice[lang].map((d, i) => (
              <R key={d} delay={0.04 * i}>
                <li
                  style={{
                    padding: "clamp(14px,1.8vw,22px) 0",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(1.05rem,1.6vw,1.5rem)",
                    lineHeight: 1.3,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  {d}
                </li>
              </R>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA + Next world */}
      <section style={{ padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
            {t.contact}
          </Link>
        </Magnetic>
        <div style={{ marginTop: 36 }}>
          <Link
            href={`/worlds/${next.slug}`}
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: next.color.hex,
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = next.color.hex)}
          >
            {t.next} {next.number} · {next.color.name}
          </Link>
        </div>
      </section>
    </main>
  );
}
