"use client";
import Link from "next/link";

type Lang = "en" | "es";

const COPY: Record<Lang, { location: string; imprint: string }> = {
  en: { location: "Europe & World · By appointment", imprint: "Imprint" },
  es: { location: "Europa y Mundo · Solo con cita previa", imprint: "Aviso legal" },
};

const lineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.42)",
};

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  return (
    <footer
      style={{
        position: "relative",
        background: "#040303",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "clamp(48px,6vw,88px) clamp(20px,5vw,60px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(12px,1.4vw,18px)",
      }}
    >
      <a
        href="mailto:studio@xnlab.io"
        style={{
          ...lineStyle,
          color: "rgba(255,255,255,0.78)",
          textDecoration: "none",
        }}
      >
        studio@xnlab.io
      </a>
      <p style={lineStyle}>{t.location}</p>
      <p style={{ ...lineStyle, color: "rgba(255,255,255,0.28)" }}>
        © MMXXII–MMXXVI XNLAB
        <span style={{ margin: "0 14px", color: "rgba(255,255,255,0.18)" }}>·</span>
        <Link
          href="/imprint"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          {t.imprint}
        </Link>
      </p>
    </footer>
  );
}
