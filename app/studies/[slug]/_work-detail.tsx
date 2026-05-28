"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "../data";
import { ts, tsS, serif, W, R, useLang } from "../../_lib/atoms";
import { WordmarkLink } from "../../_lib/wordmark";
import { SiteFooter } from "../../_lib/site-footer";

const ui = {
  en: {
    back: "← All studies",
    problem: "Problem",
    direction: "Direction",
    system: "System",
    surfaces: "Surfaces",
    result: "Result",
    gallery: "Gallery",
    credits: "Credits",
    contact: "Write to the studio",
    next: "Next study",
    shiftLabel: "The shift",
    shiftEyebrow: "Perception · before and after",
    before: "Before",
    after: "After",
  },
  es: {
    back: "← Todos los estudios",
    problem: "Problema",
    direction: "Dirección",
    system: "Sistema",
    surfaces: "Superficies",
    result: "Resultado",
    gallery: "Galería",
    credits: "Créditos",
    contact: "Escribir al estudio",
    next: "Siguiente estudio",
    shiftLabel: "El giro",
    shiftEyebrow: "Percepción · antes y después",
    before: "Antes",
    after: "Después",
  },
};

export default function WorkDetail({ project }: { project: Project }) {
  const [lang, setLang] = useLang();
  const t = ui[lang];
  const pull = project.pullQuote?.[lang];
  // Five-part editorial framework. Each chapter is rendered as its own
  // labelled row so the studio's commercial thinking is visible at a
  // glance, not buried inside a free-form essay.
  const chapters: Array<{ label: string; body: string; isList?: boolean; items?: string[] }> = [
    { label: t.problem, body: project.problem[lang] },
    { label: t.direction, body: project.direction[lang] },
    { label: t.system, body: project.system[lang] },
    { label: t.surfaces, body: "", isList: true, items: project.surfaces[lang] },
    { label: t.result, body: project.result[lang] },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(4,3,2,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
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
            href="/studies"
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
            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
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

      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100svh",
          minHeight: 640,
          overflow: "hidden",
        }}
      >
        <Image
          src={project.hero}
          alt={project.title}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          style={{ objectFit: "cover", objectPosition: project.heroPosition ?? "center" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(4,3,2,0.55) 0%, rgba(4,3,2,0.05) 25%, rgba(4,3,2,0.05) 60%, rgba(6,6,6,1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "0 clamp(24px,5vw,72px) clamp(80px,12vh,140px)",
          }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4 }}
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              textShadow: ts,
              marginBottom: 24,
            }}
          >
            {project.number} · {project.discipline} · {project.year}
          </motion.p>
          <h1
            style={{
              fontSize: "clamp(2.6rem,7vw,7.4rem)",
              fontWeight: 400,
              lineHeight: 0.92,
              letterSpacing: "-0.05em",
              color: "white",
              textShadow: tsS,
              maxWidth: 1100,
            }}
          >
            <W text={project.title} delay={0.1} />
          </h1>
          <R delay={0.4}>
            <p
              style={{
                marginTop: "clamp(20px,2.5vw,32px)",
                fontSize: "clamp(0.94rem,1.18vw,1.1rem)",
                lineHeight: 1.78,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 300,
                textShadow: ts,
                maxWidth: 680,
              }}
            >
              {project.excerpt[lang]}
            </p>
            <p
              style={{
                marginTop: 18,
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {project.location[lang]}
            </p>
          </R>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(72px,10vw,140px) clamp(24px,7vw,96px)",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        {chapters.map((ch, i) => (
          <R key={ch.label} delay={i * 0.06}>
            <div
              style={{
                display: "grid",
                gap: "clamp(28px,3.4vw,52px)",
                padding: "clamp(36px,4.6vw,72px) 0",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "start",
              }}
              className="grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr]"
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <span
                  style={{
                    fontFamily: serif,
                    fontStyle: "italic",
                    fontSize: "clamp(2rem,3vw,2.6rem)",
                    lineHeight: 1,
                    color: "rgba(232,183,131,0.7)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    margin: 0,
                    paddingTop: 8,
                  }}
                >
                  {ch.label}
                </p>
              </div>
              <div style={{ maxWidth: 760 }}>
                {ch.isList && ch.items ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {ch.items.map((it, j) => (
                      <li
                        key={j}
                        style={{
                          padding: "clamp(12px,1.4vw,18px) 0",
                          borderTop: j === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "baseline",
                          gap: 14,
                          fontSize: "clamp(1rem,1.22vw,1.18rem)",
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.78)",
                          fontWeight: 300,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            letterSpacing: "0.3em",
                            color: "rgba(232,183,131,0.55)",
                            minWidth: 26,
                          }}
                        >
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(1.05rem,1.4vw,1.3rem)",
                      lineHeight: 1.62,
                      color: "rgba(255,255,255,0.82)",
                      fontWeight: 300,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {ch.body}
                  </p>
                )}
              </div>
            </div>
          </R>
        ))}
      </section>

      {project.beforeAfter && project.beforeAfter.length > 0 && (
        <section
          style={{
            padding: "clamp(56px,8vw,112px) clamp(24px,7vw,96px)",
            maxWidth: 1180,
            margin: "0 auto",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <R>
            <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,64px)" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(232,183,131,0.6)",
                  margin: "0 0 clamp(12px,1.6vw,18px)",
                }}
              >
                {t.shiftEyebrow}
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.7rem,3.4vw,3rem)",
                  fontWeight: 400,
                  lineHeight: 1.0,
                  letterSpacing: "-0.04em",
                  margin: 0,
                  textShadow: tsS,
                }}
              >
                <W text={t.shiftLabel} delay={0} />
              </h2>
            </div>
          </R>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {project.beforeAfter.map((pair, i) => (
              <R key={i} delay={i * 0.07}>
                <div
                  className="grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
                  style={{
                    display: "grid",
                    alignItems: "center",
                    gap: "clamp(14px,2.4vw,40px)",
                    padding: "clamp(22px,3vw,34px) 0",
                    borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* BEFORE — the gap state. Muted, struck back. */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(0.98rem,1.3vw,1.18rem)",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.42)",
                      fontWeight: 300,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.34em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                        marginBottom: "clamp(8px,1vw,12px)",
                      }}
                    >
                      {t.before}
                    </span>
                    {pair.before[lang]}
                  </p>
                  {/* Transition mark — points from gap to designed state. */}
                  <span
                    aria-hidden
                    className="hidden md:block"
                    style={{
                      fontFamily: serif,
                      fontStyle: "italic",
                      fontSize: "clamp(1.4rem,2vw,2rem)",
                      color: "rgba(232,183,131,0.6)",
                      lineHeight: 1,
                      padding: "0 clamp(4px,1vw,16px)",
                    }}
                  >
                    →
                  </span>
                  {/* AFTER — the designed state. Lit, full weight. */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: "clamp(1.05rem,1.4vw,1.3rem)",
                      lineHeight: 1.5,
                      color: "rgba(255,255,255,0.92)",
                      fontWeight: 300,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.34em",
                        textTransform: "uppercase",
                        color: "rgba(232,183,131,0.7)",
                        marginBottom: "clamp(8px,1vw,12px)",
                      }}
                    >
                      {t.after}
                    </span>
                    {pair.after[lang]}
                  </p>
                </div>
              </R>
            ))}
          </div>
        </section>
      )}

      {pull && (
        <section
          style={{
            padding: "clamp(40px,6vw,80px) clamp(24px,8vw,120px) clamp(72px,10vw,140px)",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <R>
            <p
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.7rem,4.2vw,3.6rem)",
                lineHeight: 1.18,
                letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.85)",
                maxWidth: 920,
                margin: "0 auto",
                textShadow: tsS,
              }}
            >
              “{pull}”
            </p>
          </R>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section style={{ position: "relative" }}>
          <p
            style={{
              padding: "clamp(60px,8vw,100px) clamp(24px,5vw,64px) clamp(24px,3vw,40px)",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              textAlign: "center",
            }}
          >
            {t.gallery}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {project.gallery.map((g, i) => (
              <R key={i}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "clamp(60svh,80vh,90vh)",
                    minHeight: 420,
                    overflow: "hidden",
                  }}
                >
                  <Image src={g.src} alt={g.alt} fill sizes="100vw" style={{ objectFit: "cover" }} />
                </div>
              </R>
            ))}
          </div>
        </section>
      )}

      <section
        style={{
          padding: "clamp(72px,10vw,140px) clamp(24px,8vw,120px)",
          maxWidth: 920,
          margin: "0 auto",
        }}
      >
        <R>
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 32,
            }}
          >
            {t.credits}
          </p>
        </R>
        <R>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(140px,200px) 1fr",
              rowGap: 18,
              columnGap: 32,
              margin: 0,
            }}
          >
            {project.credits.map((c) => (
              <div key={c.role} style={{ display: "contents" }}>
                <dt
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {c.role}
                </dt>
                <dd
                  style={{
                    fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                    color: "rgba(255,255,255,0.78)",
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {c.value}
                </dd>
              </div>
            ))}
            {/* Applied vertical surface — only on hospitality studies.
                Soft second affordance below credits, not a competing
                CTA. The primary close (/contact) stays in the next
                section. */}
            {project.slug === "hospitality-atmosphere-study" && (
              <div style={{ display: "contents" }}>
                <dt
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgba(232,183,131,0.7)",
                  }}
                >
                  {lang === "en" ? "Applied vertical" : "Vertical aplicado"}
                </dt>
                <dd style={{ margin: 0 }}>
                  <Link
                    href="/for/hospitality"
                    style={{
                      fontSize: "clamp(0.95rem,1.18vw,1.1rem)",
                      color: "rgba(232,183,131,0.9)",
                      fontWeight: 300,
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(232,183,131,0.32)",
                      paddingBottom: 1,
                      transition: "color 0.4s, border-color 0.4s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderBottomColor = "rgba(232,183,131,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(232,183,131,0.9)";
                      e.currentTarget.style.borderBottomColor = "rgba(232,183,131,0.32)";
                    }}
                  >
                    {lang === "en"
                      ? "Hospitality — six rooms, one studio →"
                      : "Hostelería — seis salas, un estudio →"}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </R>
      </section>

      {/* Closing section — single dominant verb per page (AGENTS §5).
          The "Next study" affordance moves to the footer of this
          section as a small inline back-link, not a competing CTA. */}
      <section
        style={{
          padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)",
          textAlign: "center",
        }}
      >
        <Link
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.7rem",
            padding: "0.85rem clamp(1.2rem,3vw,2.4rem)",
            fontSize: "clamp(10px,0.85vw,12px)",
            fontWeight: 500,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#060606",
            textDecoration: "none",
            background: "white",
            borderRadius: 100,
          }}
        >
          {t.contact}
        </Link>
        <div style={{ marginTop: "clamp(40px,5vw,72px)" }}>
          <Link
            href="/studies"
            style={{
              fontSize: 10,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.34)",
              textDecoration: "none",
            }}
          >
            {t.back}
          </Link>
        </div>
      </section>
        <SiteFooter lang={lang} />
    </main>
  );
}
