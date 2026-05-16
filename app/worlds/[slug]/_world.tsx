"use client";
import Image from "next/image";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../../_lib/atoms";
import { LuxButton } from "../../_lib/lux-button";
import { WordmarkLink } from "../../_lib/wordmark";
import { Breadcrumb } from "../../_lib/breadcrumb";
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
    contact: "Start a project",
    next: "Next world →",
    back: "← All worlds",
  },
  es: {
    eyebrowPrefix: "Mundo",
    material: "Material",
    energy: "Energía",
    notes: "Notas",
    practice: "Hacemos",
    contact: "Iniciar un proyecto",
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
          <WordmarkLink />
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

      <Breadcrumb
        items={[
          { label: lang === "en" ? "Home" : "Inicio", href: "/" },
          { label: lang === "en" ? "Worlds" : "Mundos", href: "/worlds" },
          { label: world.title[lang] },
        ]}
      />

      {/* Hero — the world's portrait */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(150px,18vh,200px) clamp(24px,5vw,72px) clamp(48px,7vw,96px)",
          textAlign: "center",
          // Subtle color-tinted radial gradient using the core's deep colour
          background: `radial-gradient(circle at 50% 38%, ${c.deep.replace(",1)", ",0.55)")} 0%, transparent 60%), #060606`,
        }}
      >
        <Dust count={12} opacity={0.06} />
        <div style={{ marginBottom: "clamp(36px,5vw,60px)", width: "clamp(220px,22vw,320px)", height: "clamp(220px,22vw,320px)" }}>
          <Orb world={world} size={320} />
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
        <R delay={0.55}>
          <p
            style={{
              marginTop: "clamp(18px,2.4vw,28px)",
              fontSize: "clamp(0.98rem,1.22vw,1.15rem)",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              maxWidth: 720,
              textShadow: ts,
            }}
          >
            {world.pitch[lang]}
          </p>
        </R>
      </section>

      {/* Discipline — cinematic atmosphere card, present when the Core owns one */}
      {world.discipline && (
        <section style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ position: "relative", width: "100%", height: "clamp(70svh,82vh,92svh)", minHeight: 480, overflow: "hidden" }}>
            <Image
              src={world.discipline.image}
              alt={world.discipline.title[lang]}
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: world.discipline.imagePosition ?? "center" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(6,6,6,0.92) 0%, rgba(4,3,2,0.28) 14%, rgba(4,3,2,0.02) 38%, rgba(4,3,2,0.65) 86%, rgba(6,6,6,1) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                transform: "translateY(-50%)",
                padding: "0 clamp(24px,5vw,72px)",
                textAlign: "center",
                zIndex: 5,
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(2rem,4.6vw,4.8rem)",
                  fontWeight: 400,
                  lineHeight: 1.02,
                  letterSpacing: "-0.045em",
                  color: "white",
                  textShadow: "0 1px 24px rgba(0,0,0,0.7)",
                }}
              >
                <W text={world.discipline.title[lang]} delay={0} />
              </h2>
              <R delay={0.18}>
                <p
                  style={{
                    marginTop: 18,
                    fontSize: "clamp(0.96rem,1.18vw,1.1rem)",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 400,
                    textShadow: ts,
                    maxWidth: 720,
                    margin: "18px auto 0",
                  }}
                >
                  {world.discipline.copy[lang]}
                </p>
              </R>
            </div>
          </div>
        </section>
      )}

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
                gap: "clamp(24px,3vw,40px)",
                padding: "clamp(28px,3.5vw,52px) 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
              className="grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr]"
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
            gap: "clamp(28px,3vw,48px)",
          }}
          className="grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr]"
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

      {/* CTA + Next world — two pills stacked; the second tinted to the
          colour of the next world so the visitor sees the universe
          continue, not just a footnote link. */}
      <section style={{ padding: "clamp(56px,7vw,96px) clamp(20px,5vw,64px) clamp(64px,9vw,120px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <LuxButton href="/contact" variant="solid" arrow={false}>{t.contact}</LuxButton>
        <div style={{ marginTop: "clamp(28px,3.6vw,48px)" }}>
          <NextWorldButton next={next} label={t.next} />
        </div>
      </section>
    </main>
  );
}

// Pill-shaped link to the next world, tinted to that world's accent
// colour. Mirrors LuxButton's geometry so it sits in the same rhythm
// as the primary CTA above, but reads as a portal rather than a
// commercial close — it carries the next world's own orb on the left.
function NextWorldButton({ next, label }: { next: World; label: string }) {
  return (
    <Link
      href={`/worlds/${next.slug}`}
      data-next
      onMouseEnter={(e) => {
        const sweep = e.currentTarget.querySelector("[data-sweep]") as HTMLElement | null;
        if (sweep) sweep.style.transform = "translateX(0%)";
        e.currentTarget.style.borderColor = next.color.hex;
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        const sweep = e.currentTarget.querySelector("[data-sweep]") as HTMLElement | null;
        if (sweep) sweep.style.transform = "translateX(-101%)";
        e.currentTarget.style.borderColor = `${next.color.hex}66`;
        e.currentTarget.style.color = next.color.hex;
      }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.9rem",
        padding: "0.85rem 1.4rem 0.85rem 0.7rem",
        fontSize: "clamp(10px, 0.85vw, 12px)",
        fontWeight: 500,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: next.color.hex,
        textDecoration: "none",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${next.color.hex}66`,
        borderRadius: 100,
        overflow: "hidden",
        transition: "color 0.45s, border-color 0.45s",
      }}
    >
      {/* Colour sweep that fills from the left on hover */}
      <span
        data-sweep
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${next.color.hex}00 0%, ${next.color.hex}33 50%, ${next.color.hex}55 100%)`,
          transform: "translateX(-101%)",
          transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          pointerEvents: "none",
        }}
      />
      {/* Inline next-world orb so the button reads as a portal */}
      <span
        aria-hidden
        style={{
          position: "relative",
          zIndex: 2,
          width: 32,
          height: 32,
          flexShrink: 0,
          display: "inline-block",
        }}
      >
        <Orb world={next} size={32} />
      </span>
      <span style={{ position: "relative", zIndex: 2, display: "inline-flex", alignItems: "baseline", gap: "0.7rem" }}>
        <span>{label}</span>
        <span aria-hidden style={{ color: `${next.color.hex}88`, fontSize: "0.92em", letterSpacing: "0.2em" }}>
          {next.number}
        </span>
        <span style={{ color: "rgba(255,255,255,0.85)" }}>{next.color.name}</span>
      </span>
      <span
        aria-hidden
        style={{
          position: "relative",
          zIndex: 2,
          fontSize: "1.05em",
          color: next.color.hex,
          marginLeft: 4,
        }}
      >
        →
      </span>
    </Link>
  );
}
