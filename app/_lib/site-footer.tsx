"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { serif, ts, Dust } from "./atoms";

type Lang = "en" | "es";

type Column = { label: string; number: string; items: [string, string][] };

const COPY: Record<Lang, {
  tag: string;
  italic: string;
  emailEyebrow: string;
  location: string;
  appointment: string;
  bookingsEyebrow: string;
  bookingsLine: string;
  bookingsCta: string;
  rights: string;
  cols: Column[];
  legal: [string, string][];
}> = {
  en: {
    tag: "Atmospheres · Visual Worlds · Premium Experiences",
    italic: "A direction studio for brands that want to be felt.",
    emailEyebrow: "Direct line",
    location: "Marbella · Madrid · Worldwide",
    appointment: "By appointment only",
    bookingsEyebrow: "2026 Availability",
    bookingsLine: "A small number of selected engagements remain for 2026.",
    bookingsCta: "Start a project",
    rights: "All rights reserved",
    cols: [
      {
        label: "Studio",
        number: "01",
        items: [
          ["Services", "/services"],
          ["Process", "/process"],
          ["Worlds", "/worlds"],
          ["About", "/about"],
          ["Apply", "/contact"],
        ],
      },
      {
        label: "Library",
        number: "02",
        items: [
          ["Selected Studies", "/work"],
          ["Lab Records", "/lab-records"],
          ["References", "/references"],
          ["Manifesto", "/manifesto"],
        ],
      },
    ],
    legal: [
      ["Manifesto", "/manifesto"],
      ["Colophon", "/imprint"],
    ],
  },
  es: {
    tag: "Atmósferas · Mundos Visuales · Experiencias Premium",
    italic: "Un estudio de dirección para marcas que quieren hacerse sentir.",
    emailEyebrow: "Línea directa",
    location: "Marbella · Madrid · Internacional",
    appointment: "Solo con cita previa",
    bookingsEyebrow: "Disponibilidad 2026",
    bookingsLine: "Quedan unos pocos encargos seleccionados para 2026.",
    bookingsCta: "Iniciar un proyecto",
    rights: "Todos los derechos reservados",
    cols: [
      {
        label: "Estudio",
        number: "01",
        items: [
          ["Servicios", "/services"],
          ["Método", "/process"],
          ["Mundos", "/worlds"],
          ["Sobre el estudio", "/about"],
          ["Contacto", "/contact"],
        ],
      },
      {
        label: "Biblioteca",
        number: "02",
        items: [
          ["Estudios seleccionados", "/work"],
          ["Lab Records", "/lab-records"],
          ["Referencias", "/references"],
          ["Manifiesto", "/manifesto"],
        ],
      },
    ],
    legal: [
      ["Manifiesto", "/manifesto"],
      ["Colofón", "/imprint"],
    ],
  },
};

const eyebrow: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.42em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
};

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        position: "relative",
        background: "#040303",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(70,45,20,0.22) 0%, rgba(22,14,8,0.08) 38%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Dust count={6} opacity={0.05} />

      {/* Bookings strip */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: 1560,
          margin: "0 auto",
          padding: "clamp(36px,4.5vw,64px) clamp(20px,5vw,60px) clamp(20px,2.4vw,32px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(20px,3vw,40px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.span
            aria-hidden
            animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.15, 1] }}
            transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#e8b783",
              boxShadow: "0 0 14px 2px rgba(232,183,131,0.7)",
              display: "inline-block",
            }}
          />
          <div>
            <p style={{ ...eyebrow, color: "rgba(232,183,131,0.62)", marginBottom: 4 }}>
              {t.bookingsEyebrow}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(1.05rem,1.55vw,1.45rem)",
                lineHeight: 1.25,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "-0.005em",
              }}
            >
              {t.bookingsLine}
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "white",
            textDecoration: "none",
            fontWeight: 500,
            padding: "14px 22px",
            border: "1px solid rgba(232,183,131,0.45)",
            background: "rgba(232,183,131,0.06)",
            transition: "background 0.4s, border-color 0.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,183,131,0.16)";
            e.currentTarget.style.borderColor = "rgba(232,183,131,0.75)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(232,183,131,0.06)";
            e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
          }}
        >
          {t.bookingsCta}
        </Link>
      </div>

      {/* Brand statement row — full-width editorial header above the
          column grid. Gives the footer a top spine instead of pushing
          the brand into one of the columns. */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: 1560,
          margin: "0 auto",
          padding: "clamp(56px,6.4vw,88px) clamp(20px,5vw,60px) clamp(28px,3.4vw,44px)",
          display: "grid",
          gap: "clamp(28px,3vw,44px)",
          alignItems: "end",
        }}
        className="grid-cols-1 md:grid-cols-[auto_1fr]"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontSize: "clamp(28px,3.2vw,44px)",
              fontWeight: 400,
              letterSpacing: "0.42em",
              color: "white",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1,
              textShadow: ts,
            }}
          >
            XNLAB
          </p>
          <p
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              margin: 0,
            }}
          >
            {t.tag}
          </p>
        </div>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(1.05rem,1.45vw,1.4rem)",
            lineHeight: 1.32,
            color: "rgba(255,255,255,0.78)",
            letterSpacing: "-0.005em",
            maxWidth: 520,
            margin: 0,
            justifySelf: "end",
            textAlign: "right",
          }}
          className="text-left md:text-right"
        >
          {t.italic}
        </p>
      </div>

      {/* Main grid: three balanced columns (Studio · Library · Contact)
          divided by a hairline. Each column reads as an equal weight
          in the editorial composition — no more asymmetric "library
          floating left" feel. */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: 1560,
          margin: "0 auto",
          padding: "clamp(32px,3.6vw,48px) clamp(20px,5vw,60px) clamp(40px,4.4vw,64px)",
          display: "grid",
          gap: 0,
          alignItems: "start",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
        className="grid-cols-1 md:grid-cols-3"
      >
        {/* Studio + Library columns */}
        {t.cols.map((col, ci) => (
          <div
            key={col.label}
            style={{
              padding: "clamp(28px,3vw,40px) clamp(0px,1.8vw,28px) clamp(28px,3vw,40px) 0",
              borderTop: ci === 0 ? undefined : "1px solid rgba(255,255,255,0.06)",
              borderRight: ci < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined,
            }}
            className={
              ci === 0
                ? "md:border-t-0 md:pl-0 md:pr-[clamp(20px,3vw,48px)]"
                : "md:border-t-0 md:pl-[clamp(20px,3vw,48px)] md:pr-[clamp(20px,3vw,48px)]"
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 22,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.32em",
                  color: "rgba(232,183,131,0.55)",
                }}
              >
                {col.number}
              </span>
              <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 11 }}>—</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "white",
                }}
              >
                {col.label}
              </span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {col.items.map(([label, href]) => (
                <li key={label} style={{ marginBottom: 2 }}>
                  <Link
                    href={href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      lineHeight: 1.95,
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 400,
                      textDecoration: "none",
                      letterSpacing: "0.005em",
                      transition: "color 0.3s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "white";
                      const dot = e.currentTarget.querySelector("[data-dot]") as HTMLElement | null;
                      if (dot) dot.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      const dot = e.currentTarget.querySelector("[data-dot]") as HTMLElement | null;
                      if (dot) dot.style.opacity = "0";
                    }}
                  >
                    <span
                      data-dot
                      aria-hidden
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#e8b783",
                        opacity: 0,
                        transition: "opacity 0.3s",
                        flexShrink: 0,
                      }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact column — own pillar, no longer hidden in the brand block */}
        <div
          style={{
            padding: "clamp(28px,3vw,40px) 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
          className="md:border-t-0 md:pl-[clamp(20px,3vw,48px)]"
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 22,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.32em",
                color: "rgba(232,183,131,0.55)",
              }}
            >
              03
            </span>
            <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 11 }}>—</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "white",
              }}
            >
              {lang === "en" ? "Contact" : "Contacto"}
            </span>
          </div>
          <a
            href="mailto:studio@xnlab.io"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              color: "white",
              textDecoration: "none",
              fontWeight: 400,
              letterSpacing: "0.005em",
              paddingBottom: 4,
              borderBottom: "1px solid rgba(232,183,131,0.35)",
              transition: "border-color 0.3s",
              marginBottom: 18,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottomColor = "#e8b783";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottomColor = "rgba(232,183,131,0.35)";
            }}
          >
            studio@xnlab.io
          </a>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <p style={{ ...eyebrow, margin: 0 }}>{t.appointment}</p>
            <p style={{ ...eyebrow, color: "rgba(255,255,255,0.32)", margin: 0 }}>{t.location}</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "clamp(18px,2.2vw,28px) clamp(20px,5vw,60px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            textAlign: "center",
          }}
        >
          {/* Copyright line — centered, single line */}
          <p
            style={{
              ...eyebrow,
              margin: 0,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.42)",
            }}
          >
            © {year} XNLAB <span style={{ color: "rgba(255,255,255,0.18)", margin: "0 10px" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.32)" }}>{t.rights}</span>
          </p>

          {/* Trinity row — Manifesto / xnlab.io / Colophon as a
              three-column editorial spine. Manifesto anchors the left
              shoulder, xnlab.io is the centre mark (the brand wordmark
              of the URL), Colophon closes on the right. The whole row
              is centred under the copyright; on narrow viewports the
              grid collapses gracefully via clamp/min-width. */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: "clamp(14px,3.5vw,40px)",
              width: "100%",
              maxWidth: 520,
              minWidth: 0,
            }}
          >
            {/* Left — Manifesto */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              {t.legal[0] && (
                <Link
                  href={t.legal[0][1]}
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  {t.legal[0][0]}
                </Link>
              )}
            </div>

            {/* Centre — xnlab.io anchor */}
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.26em",
                color: "rgba(232,183,131,0.62)",
                textTransform: "uppercase",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              xnlab.io
            </span>

            {/* Right — Colophon */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              {t.legal[1] && (
                <Link
                  href={t.legal[1][1]}
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  {t.legal[1][0]}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
