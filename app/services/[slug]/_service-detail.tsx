"use client";
import Link from "next/link";
import Image from "next/image";
import { ts, tsS, serif, W, R, Dust, useLang } from "../../_lib/atoms";
import { LuxButton } from "../../_lib/lux-button";
import { SectionMark, IntensityMeter } from "../../_lib/ornaments";
import { WordmarkLink } from "../../_lib/wordmark";
import { Orb } from "../../_lib/orb";
import { Breadcrumb } from "../../_lib/breadcrumb";
import type { ServiceDetail } from "../../_lib/service-details";
import { serviceDetails, getServiceDetail } from "../../_lib/service-details";
import { worlds } from "../../_lib/worlds";

const ui = {
  en: {
    back: "← All systems",
    eyebrowPrefix: "System",
    durationLabel: "Duration",
    scopeLabel: "Scope",
    priceLabel: "Intensity",
    body: "About",
    includes: "What you receive",
    outcome: "Outcome",
    audience: "Built for",
    pairs: "Often paired with",
    cta: "Start a project",
    next: "Next system →",
  },
  es: {
    back: "← Todos los sistemas",
    eyebrowPrefix: "Sistema",
    durationLabel: "Duración",
    scopeLabel: "Alcance",
    priceLabel: "Intensidad",
    body: "Sobre el sistema",
    includes: "Lo que recibes",
    outcome: "Resultado",
    audience: "Para quién",
    pairs: "Suele combinarse con",
    cta: "Iniciar un proyecto",
    next: "Siguiente sistema →",
  },
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
};

export default function ServiceDetailPage({ service }: { service: ServiceDetail }) {
  const [lang, setLang] = useLang();
  const t = ui[lang];
  const world = service.worldSlug ? worlds.find((w) => w.slug === service.worldSlug) : undefined;
  const c = world?.color;
  // Next service in the natural order (loops back to the first)
  const idx = serviceDetails.findIndex((s) => s.slug === service.slug);
  const next = serviceDetails[(idx + 1) % serviceDetails.length];
  const pairs = service.pairsWith.map((slug) => getServiceDetail(slug)!).filter(Boolean);

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
          <Link
            href="/services"
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

      <Breadcrumb
        items={[
          { label: lang === "en" ? "Home" : "Inicio", href: "/" },
          { label: lang === "en" ? "Systems" : "Sistemas", href: "/services" },
          { label: service.title[lang] },
        ]}
      />

      {/* Hero — cinematic full-bleed image + commercial heading */}
      <section
        style={{
          position: "relative",
          minHeight: "100svh",
          display: "flex",
          alignItems: "flex-end",
          padding: "clamp(160px,18vh,220px) clamp(24px,7vw,96px) clamp(64px,9vw,120px)",
          overflow: "hidden",
        }}
      >
        <Image
          src={service.heroImage}
          alt={service.title.en}
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", objectPosition: service.heroImagePosition ?? "center" }}
        />
        {/* Tinted overlay using the linked World's deep color (when present) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: c
              ? `linear-gradient(to bottom, rgba(6,6,6,0.7) 0%, rgba(6,6,6,0.35) 30%, ${c.deep.replace(",1)", ",0.55)")} 65%, #060606 100%)`
              : "linear-gradient(to bottom, rgba(6,6,6,0.7) 0%, rgba(6,6,6,0.35) 30%, rgba(6,6,6,0.55) 65%, #060606 100%)",
          }}
        />
        <Dust count={10} opacity={0.06} />
        <div style={{ position: "relative", zIndex: 5, maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <p style={{ ...labelStyle, marginBottom: 18, color: c?.hex ?? "rgba(232,183,131,0.7)" }}>
            {t.eyebrowPrefix} {service.number} · {lang === "en" ? "XNLAB" : "XNLAB"}
          </p>
          <h1
            style={{
              fontSize: "clamp(2.6rem,7vw,7rem)",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.055em",
              textShadow: tsS,
              maxWidth: 1100,
              marginBottom: "clamp(20px,2.5vw,32px)",
            }}
          >
            <W text={service.title[lang]} delay={0.05} />
          </h1>
          <R delay={0.25}>
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.3rem,2.2vw,2.2rem)",
                lineHeight: 1.25,
                color: "rgba(255,255,255,0.82)",
                maxWidth: 880,
                letterSpacing: "-0.005em",
                textShadow: tsS,
              }}
            >
              {service.tagline[lang]}
            </p>
          </R>
          <R delay={0.45}>
            <p
              style={{
                marginTop: "clamp(22px,3vw,36px)",
                fontSize: "clamp(1rem,1.28vw,1.18rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.68)",
                fontWeight: 300,
                maxWidth: 720,
                textShadow: ts,
              }}
            >
              {service.lead[lang]}
            </p>
          </R>
        </div>
      </section>

      {/* Specs strip — duration / scope / price in a single editorial row */}
      <section
        style={{
          padding: "clamp(36px,4vw,56px) clamp(24px,7vw,96px)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gap: "clamp(28px,4vw,56px)",
          }}
          className="grid-cols-1 md:grid-cols-3"
        >
          {[
            { label: t.durationLabel, value: service.duration[lang] },
            { label: t.scopeLabel, value: service.scope[lang] },
            {
              label: t.priceLabel,
              value: service.tierLabel[lang],
              tier: service.tier,
            },
          ].map(({ label, value, tier }) => (
            <div key={label}>
              <p style={{ ...labelStyle, marginBottom: 10, color: "rgba(232,183,131,0.6)" }}>{label}</p>
              {tier !== undefined && (
                <IntensityMeter tier={tier} style={{ marginBottom: 10 }} />
              )}
              <p
                style={{
                  margin: 0,
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.4rem,2vw,1.9rem)",
                  lineHeight: 1.15,
                  color: "#e8b783",
                  letterSpacing: "-0.01em",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Body — long-form commercial copy */}
      <section
        style={{
          padding: "clamp(64px,9vw,140px) clamp(24px,7vw,96px) clamp(56px,7vw,96px)",
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gap: "clamp(36px,5vw,72px)",
        }}
        className="grid-cols-1 md:grid-cols-[minmax(160px,220px)_1fr]"
      >
        <R>
          <p style={labelStyle}>{t.body}</p>
        </R>
        <div style={{ maxWidth: 760 }}>
          {service.body[lang].map((p, i) => (
            <R key={i} delay={0.05 + i * 0.05}>
              <p
                style={{
                  marginTop: i === 0 ? 0 : "clamp(20px,2.4vw,30px)",
                  fontSize: "clamp(1rem,1.24vw,1.16rem)",
                  lineHeight: 1.74,
                  color: "rgba(255,255,255,0.78)",
                  fontWeight: 300,
                }}
              >
                {p}
              </p>
            </R>
          ))}
        </div>
      </section>

      {/* What you receive — deliverables */}
      <section
        style={{
          padding: "clamp(56px,7vw,96px) clamp(24px,7vw,96px)",
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "grid",
          gap: "clamp(36px,5vw,72px)",
        }}
        className="grid-cols-1 md:grid-cols-[minmax(160px,220px)_1fr]"
      >
        <R>
          <p style={labelStyle}>{t.includes}</p>
        </R>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {service.includes[lang].map((item, i) => (
            <R key={i} delay={i * 0.04}>
              <li
                style={{
                  padding: "clamp(14px,1.6vw,20px) 0",
                  borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "clamp(0.98rem,1.18vw,1.1rem)",
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.75)",
                  fontWeight: 300,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    color: "rgba(232,183,131,0.55)",
                    minWidth: 24,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            </R>
          ))}
        </ul>
      </section>

      {/* Outcome + Audience — atmospheric beat */}
      <section style={{ position: "relative", padding: "clamp(80px,10vw,160px) clamp(24px,7vw,96px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Dust count={6} opacity={0.05} />
        {world && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${c?.deep.replace(",1)", ",0.55)") ?? "rgba(20,12,8,0.4)"} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        )}
        <div style={{ position: "relative", zIndex: 5, maxWidth: 1080, margin: "0 auto", display: "grid", gap: "clamp(56px,7vw,96px)" }} className="grid-cols-1 md:grid-cols-2">
          <div>
            <R>
              <p style={{ ...labelStyle, color: c?.hex ?? "rgba(232,183,131,0.7)", marginBottom: "clamp(16px,2vw,24px)" }}>{t.outcome}</p>
            </R>
            <R delay={0.1}>
              <p
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: "clamp(1.5rem,2.6vw,2.6rem)",
                  lineHeight: 1.22,
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.01em",
                  textShadow: tsS,
                }}
              >
                {service.outcome[lang]}
              </p>
            </R>
          </div>
          <div>
            <R delay={0.18}>
              <p style={{ ...labelStyle, marginBottom: "clamp(16px,2vw,24px)" }}>{t.audience}</p>
            </R>
            <R delay={0.26}>
              <p
                style={{
                  fontSize: "clamp(1rem,1.28vw,1.18rem)",
                  lineHeight: 1.72,
                  color: "rgba(255,255,255,0.74)",
                  fontWeight: 300,
                }}
              >
                {service.audience[lang]}
              </p>
            </R>
            {world && (
              <R delay={0.36}>
                <Link
                  href={`/worlds/${world.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: "clamp(28px,3.5vw,44px)",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "rgba(232,183,131,0.85)",
                    textDecoration: "none",
                    paddingBottom: 4,
                    borderBottom: "1px solid rgba(232,183,131,0.3)",
                    transition: "border-color 0.3s, color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderBottomColor = "#e8b783";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(232,183,131,0.85)";
                    e.currentTarget.style.borderBottomColor = "rgba(232,183,131,0.3)";
                  }}
                >
                  <span style={{ width: 24, height: 24, display: "inline-block", flexShrink: 0 }}>
                    <Orb world={world} size={24} />
                  </span>
                  {lang === "en" ? `Anchored in the ${world.color.name} world` : `Anclado en el mundo ${world.color.name}`}
                  <span style={{ fontFamily: serif, fontStyle: "italic", color: "#e8b783" }}>→</span>
                </Link>
              </R>
            )}
          </div>
        </div>
      </section>

      {/* Often paired with — cross-sell next systems */}
      {pairs.length > 0 && (
        <section style={{ padding: "clamp(64px,9vw,120px) clamp(24px,7vw,96px)", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <R>
            <p style={{ ...labelStyle, marginBottom: "clamp(28px,3.4vw,48px)" }}>{t.pairs}</p>
          </R>
          <div
            style={{
              display: "grid",
              gap: 0,
              gridTemplateColumns: "1fr",
            }}
            className="md:grid-cols-2"
          >
            {pairs.map((p, i) => (
              <R key={p.slug} delay={i * 0.08}>
                <Link
                  href={`/services/${p.slug}`}
                  style={{
                    display: "block",
                    padding: "clamp(24px,3vw,36px) clamp(20px,2.4vw,28px)",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    transition: "background 0.4s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                  }}
                  onMouseLeave={(e) => {
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
                      marginBottom: 6,
                    }}
                  >
                    {p.number}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(1.05rem,1.3vw,1.25rem)",
                      letterSpacing: "-0.01em",
                      color: "white",
                      fontWeight: 400,
                      marginBottom: 6,
                    }}
                  >
                    {p.title[lang]}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(0.92rem,1.08vw,1.05rem)",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 300,
                    }}
                  >
                    {p.tagline[lang]}
                  </p>
                </Link>
              </R>
            ))}
          </div>
        </section>
      )}

      <SectionMark />

      {/* Closing CTA */}
      <section
        style={{
          padding: "clamp(80px,11vw,160px) clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        <Dust count={6} opacity={0.06} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 5 }}>
          <R>
            <h2
              style={{
                fontSize: "clamp(2rem,5vw,4.4rem)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
                color: "white",
                textShadow: tsS,
              }}
            >
              {lang === "en" ? "Start a project." : "Iniciar un proyecto."}
            </h2>
          </R>
          <R delay={0.2}>
            <p
              style={{
                marginTop: "clamp(20px,2.5vw,32px)",
                fontSize: "clamp(0.95rem,1.22vw,1.1rem)",
                lineHeight: 1.72,
                color: "rgba(255,255,255,0.6)",
                fontWeight: 300,
                textShadow: ts,
              }}
            >
              {lang === "en"
                ? "Every engagement is selected. Tell us what you are building, when it opens, and what level you want it to feel at."
                : "Cada encargo se selecciona. Cuéntanos qué construyes, cuándo abre y a qué altura quieres que se sienta."}
            </p>
          </R>
          <R delay={0.32}>
            <div style={{ marginTop: "clamp(32px,4vw,52px)", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "clamp(12px,1.8vw,20px)" }}>
              <LuxButton href="/contact" variant="solid" arrow={false}>{t.cta}</LuxButton>
              <LuxButton href={`/services/${next.slug}`} variant="minimal">{t.next}</LuxButton>
            </div>
          </R>
        </div>
      </section>
    </main>
  );
}
