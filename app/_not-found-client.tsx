"use client";
import Link from "next/link";
import { ts, tsS, serif, W, R, Dust, useLang } from "./_lib/atoms";
import { LuxButton } from "./_lib/lux-button";

const en = {
  eyebrow: "404 — World not found",
  h1a: "This world",
  h1b: "does not exist yet.",
  body: "The page you are looking for has either moved, been retired, or never lived here.",
  cta: "Return home",
  alt: "Or visit",
  links: [
    { label: "Selected Works", href: "/work" },
    { label: "About the Studio", href: "/about" },
    { label: "Start a project", href: "/contact" },
  ],
};

const es = {
  eyebrow: "404 — Mundo no encontrado",
  h1a: "Este mundo",
  h1b: "todavía no existe.",
  body: "La página que buscas se ha movido, ha sido retirada, o nunca vivió aquí.",
  cta: "Volver al inicio",
  alt: "O visita",
  links: [
    { label: "Proyectos Seleccionados", href: "/work" },
    { label: "Sobre el Estudio", href: "/about" },
    { label: "Iniciar un proyecto", href: "/contact" },
  ],
};

export default function NotFoundClient() {
  const [lang] = useLang();
  const t = lang === "en" ? en : es;
  return (
    <main
      style={{
        minHeight: "100svh",
        background: "#060606",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(40px,8vw,120px) clamp(24px,5vw,72px)",
        textAlign: "center",
      }}
    >
      <Dust count={14} opacity={0.07} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(8,6,4,0) 0%, rgba(4,3,2,0.85) 80%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 5, maxWidth: 880 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            marginBottom: 32,
          }}
        >
          {t.eyebrow}
        </p>
        <h1
          style={{
            fontSize: "clamp(2.6rem,7vw,7.4rem)",
            fontWeight: 400,
            lineHeight: 0.95,
            letterSpacing: "-0.055em",
            textShadow: tsS,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <W text={t.h1a} delay={0} />
          <span style={{ fontFamily: serif, fontStyle: "italic", color: "rgba(255,255,255,0.7)", fontSize: "1.18em" }}>
            <W text={t.h1b} delay={0.14} />
          </span>
        </h1>
        <R delay={0.3}>
          <p
            style={{
              marginTop: "clamp(28px,3.5vw,44px)",
              fontSize: "clamp(0.95rem,1.22vw,1.1rem)",
              lineHeight: 1.72,
              color: "rgba(255,255,255,0.6)",
              fontWeight: 300,
              textShadow: ts,
              maxWidth: 600,
              margin: "clamp(28px,3.5vw,44px) auto 0",
            }}
          >
            {t.body}
          </p>
        </R>
        <R delay={0.42}>
          <div style={{ marginTop: "clamp(36px,4.5vw,56px)" }}>
            <LuxButton href="/" variant="solid" arrow={false}>{t.cta}</LuxButton>
          </div>
        </R>
        <R delay={0.55}>
          <div
            style={{
              marginTop: "clamp(48px,6vw,80px)",
              paddingTop: "clamp(24px,3vw,40px)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 18,
              }}
            >
              {t.alt}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "clamp(18px,3vw,36px)",
              }}
            >
              {t.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.7)",
                    textDecoration: "none",
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </R>
      </div>
    </main>
  );
}
