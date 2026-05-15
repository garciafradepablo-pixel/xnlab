"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "../data";
import { ts, tsS, serif, W, R, useLang } from "../../_lib/atoms";

const ui = {
  en: {
    back: "← All works",
    intro: "Intro",
    notes: "Notes",
    gallery: "Gallery",
    credits: "Credits",
    contact: "Start a conversation",
    next: "Next world →",
  },
  es: {
    back: "← Todos los mundos",
    intro: "Intro",
    notes: "Notas",
    gallery: "Galería",
    credits: "Créditos",
    contact: "Iniciar conversación",
    next: "Siguiente mundo →",
  },
};

export default function WorkDetail({ project }: { project: Project }) {
  const [lang, setLang] = useLang();
  const t = ui[lang];
  const body = project.body[lang];
  const pull = project.pullQuote?.[lang];

  return (
    <main
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: "#060606",
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
          <Link
            href="/"
            style={{
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.42em",
              color: "white",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            XNLAB
          </Link>
          <Link
            href="/work"
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
            {t.intro}
          </p>
        </R>
        {body.map((para, i) => (
          <R delay={0.05 * i} key={i}>
            <p
              style={{
                marginBottom: "1.4em",
                fontSize: "clamp(1.05rem,1.45vw,1.3rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.78)",
                fontWeight: 300,
              }}
            >
              {para}
            </p>
          </R>
        ))}
      </section>

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
          </dl>
        </R>
      </section>

      <section
        style={{
          padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.04)",
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
        <div style={{ marginTop: 32 }}>
          <Link
            href="/work"
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
            }}
          >
            {t.next}
          </Link>
        </div>
      </section>
    </main>
  );
}
