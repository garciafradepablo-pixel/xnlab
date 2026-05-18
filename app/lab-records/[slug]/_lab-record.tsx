"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "../../_lib/atoms";
import { WordmarkLink } from "../../_lib/wordmark";
import { Breadcrumb } from "../../_lib/breadcrumb";
import { Magnetic } from "../../_lib/chrome";
import type { LabRecord as TLabRecord } from "../../_lib/lab-records";
import { records } from "../../_lib/lab-records";
import { worlds } from "../../_lib/worlds";

const ui = {
  en: {
    back: "← All records",
    cta: "Write to the studio",
    next: "Next record",
    relatedWorld: "Related World",
  },
  es: {
    back: "← Todos los records",
    cta: "Escribir al estudio",
    next: "Siguiente record",
    relatedWorld: "Mundo relacionado",
  },
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

export default function LabRecord({ record }: { record: TLabRecord }) {
  const [lang, setLang] = useLang();
  const t = ui[lang];
  const world = record.worldSlug ? worlds.find((w) => w.slug === record.worldSlug) : undefined;
  const accent = world?.color.hex ?? "rgba(255,255,255,0.55)";
  const deepTint = world?.color.deep ?? "rgba(20,18,24,1)";
  // Next record (loops)
  const idx = records.findIndex((r) => r.slug === record.slug);
  const next = records[(idx + 1) % records.length];
  // Related records — prefer same worldSlug, fallback to overlapping
  // tags. Always 3 results max, current record always excluded.
  const related = (() => {
    const others = records.filter((r) => r.slug !== record.slug);
    const sameWorld = record.worldSlug
      ? others.filter((r) => r.worldSlug === record.worldSlug)
      : [];
    const tagSet = new Set(record.tags ?? []);
    const byTag = others
      .filter((r) => !sameWorld.includes(r))
      .filter((r) => (r.tags ?? []).some((t) => tagSet.has(t)));
    return [...sameWorld, ...byTag, ...others]
      .filter((r, i, arr) => arr.findIndex((x) => x.slug === r.slug) === i)
      .slice(0, 3);
  })();

  return (
    <main
      style={{
        minHeight: "100svh",
        overflowX: "hidden",
        background: "transparent",
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
          <Link href="/lab-records" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
            {t.back}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
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
          { label: "Lab Records", href: "/lab-records" },
          { label: record.title[lang] },
        ]}
      />

      {/* Hero — record title + meta */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(170px,20vh,220px) clamp(24px,7vw,96px) clamp(60px,8vw,120px)",
          textAlign: "center",
          background: `radial-gradient(ellipse at 50% 38%, ${deepTint.replace(",1)", ",0.55)")} 0%, transparent 60%), #060606`,
        }}
      >
        <Dust count={12} opacity={0.07} />
        <p style={{ ...labelStyle, marginBottom: 28, color: accent, position: "relative", zIndex: 5 }}>
          {record.number} · {record.category[lang]}
        </p>
        <h1
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(2.4rem,6vw,5.6rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "white",
            textShadow: tsS,
            position: "relative",
            zIndex: 5,
            maxWidth: 1100,
          }}
        >
          <W text={record.title[lang]} delay={0.1} />
        </h1>
        <R delay={0.4}>
          <p
            style={{
              marginTop: "clamp(24px,3vw,40px)",
              fontSize: "clamp(1rem,1.3vw,1.18rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              maxWidth: 720,
              textShadow: ts,
            }}
          >
            {record.lead[lang]}
          </p>
        </R>
        <R delay={0.55}>
          <p style={{ marginTop: "clamp(24px,3vw,40px)", fontSize: 10, letterSpacing: "0.42em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            {formatDate(record.date, lang)} · Xnlab Studio
          </p>
        </R>
      </section>

      {/* Body */}
      <section style={{ padding: "clamp(48px,7vw,100px) clamp(24px,8vw,140px)", maxWidth: 880, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {record.body[lang].map((p, i) => (
          <R key={i} delay={0.04 * i}>
            <p
              style={{
                marginBottom: "1.6em",
                fontSize: "clamp(1.05rem,1.4vw,1.25rem)",
                lineHeight: 1.78,
                color: "rgba(255,255,255,0.82)",
                fontWeight: 300,
              }}
            >
              {p}
            </p>
          </R>
        ))}
      </section>

      {/* Related World cross-link */}
      {world && (
        <section style={{ padding: "clamp(48px,7vw,100px) clamp(24px,7vw,96px) clamp(56px,8vw,100px)", maxWidth: 1120, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              display: "grid",
              gap: "clamp(24px,3vw,40px)",
            }}
            className="grid-cols-1 md:grid-cols-[minmax(160px,220px)_1fr]"
          >
            <p style={labelStyle}>{t.relatedWorld}</p>
            <div>
              <Link
                href={`/worlds/${world.slug}`}
                style={{
                  display: "inline-block",
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.4rem,2.6vw,2.4rem)",
                  lineHeight: 1.2,
                  color: accent,
                  textDecoration: "none",
                  transition: "color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = accent)}
                onFocus={(e) => (e.currentTarget.style.color = "white")}
                onBlur={(e) => (e.currentTarget.style.color = accent)}
              >
                {world.title[lang]}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related records — strong internal linking for SEO + reader
          retention. Picks records that share the same World Core or
          overlapping tags, never the current record. */}
      {related.length > 0 && (
        <section
          style={{
            padding: "clamp(56px,8vw,120px) clamp(20px,7vw,96px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <p
            style={{
              ...labelStyle,
              marginBottom: "clamp(28px,3.4vw,48px)",
              textAlign: "center",
            }}
          >
            {lang === "en" ? "Continue reading" : "Sigue leyendo"}
          </p>
          <div
            style={{
              display: "grid",
              gap: 0,
              gridTemplateColumns: "1fr",
            }}
            className="md:grid-cols-3"
          >
            {related.map((r, i) => (
              <Link
                key={r.slug}
                href={`/lab-records/${r.slug}`}
                style={{
                  display: "block",
                  padding: "clamp(22px,2.6vw,32px) clamp(14px,2vw,24px)",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  borderRight:
                    i < related.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                  textDecoration: "none",
                  color: "inherit",
                  position: "relative",
                  transition: "background 0.4s",
                }}
                className={
                  i === 0
                    ? "md:border-r md:[border-right-color:rgba(255,255,255,0.04)]"
                    : i === 1
                    ? "md:border-r md:[border-right-color:rgba(255,255,255,0.04)]"
                    : ""
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    color: "rgba(232,183,131,0.55)",
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  {r.number} · {r.category[lang]}
                </p>
                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(1.05rem,1.45vw,1.35rem)",
                    lineHeight: 1.18,
                    letterSpacing: "-0.005em",
                    color: "rgba(255,255,255,0.92)",
                    margin: 0,
                    marginBottom: 10,
                  }}
                >
                  {r.title[lang]}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "clamp(0.92rem,1.04vw,1.02rem)",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 300,
                  }}
                >
                  {r.lead[lang].length > 140
                    ? `${r.lead[lang].slice(0, 140).trim()}…`
                    : r.lead[lang]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA + Next */}
      <section style={{ padding: "clamp(72px,10vw,140px) clamp(20px,5vw,64px)", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
        {next && (
          <div style={{ marginTop: 36 }}>
            <Link
              href={`/lab-records/${next.slug}`}
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              onFocus={(e) => (e.currentTarget.style.color = "white")}
              onBlur={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              {t.next} {next.number} · {next.title[lang]}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
