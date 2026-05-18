"use client";
import Link from "next/link";

// Restrained "ways out" strip used at the foot of pages that would
// otherwise dead-end (contact, manifesto, /studies, /lab-records).
// Excludes the link to the page currently rendering so the visitor
// never sees a self-link. Single horizontal row, small caps, dot-
// separated — matches the secondary-link rhythm in the nav dropdown.
type CornerKey = "worlds" | "studies" | "lab-records" | "manifesto" | "contact";

const ALL: { key: CornerKey; href: string; en: string; es: string }[] = [
  { key: "worlds", href: "/worlds", en: "Worlds", es: "Mundos" },
  { key: "studies", href: "/studies", en: "Studies", es: "Estudios" },
  { key: "lab-records", href: "/lab-records", en: "Lab Records", es: "Registros" },
  { key: "manifesto", href: "/manifesto", en: "Manifesto", es: "Manifiesto" },
  { key: "contact", href: "/contact", en: "Contact", es: "Contacto" },
];

export function OtherCorners({
  lang,
  exclude,
}: {
  lang: "en" | "es";
  exclude?: CornerKey;
}) {
  const items = ALL.filter((it) => it.key !== exclude);
  return (
    <section
      style={{
        padding: "clamp(28px,3.6vw,52px) clamp(20px,5vw,64px) clamp(36px,4.4vw,68px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.34)",
        }}
      >
        {lang === "en" ? "Other corners of the studio" : "Otros rincones del estudio"}
      </p>
      <div
        style={{
          marginTop: "clamp(14px,1.6vw,22px)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px 18px",
        }}
      >
        {items.map((it, i) => (
          <span key={it.href} style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <Link
              href={it.href}
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition: "color 0.35s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              onFocus={(e) => { e.currentTarget.style.color = "white"; }}
              onBlur={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              {lang === "en" ? it.en : it.es}
            </Link>
            {i < items.length - 1 && (
              <span aria-hidden style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
