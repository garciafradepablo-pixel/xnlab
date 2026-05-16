"use client";
import Link from "next/link";

export type Crumb = { label: string; href?: string };

// Visual breadcrumb trail for detail pages. Sits below the fixed header,
// helps the visitor see where they are in the studio's information
// architecture, and pairs with the JSON-LD BreadcrumbList that the
// matching page route emits for search engines.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        position: "absolute",
        top: 64,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: "clamp(14px,1.8vw,22px) clamp(20px,5vw,56px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(4,3,2,0.55)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          gap: "clamp(6px,0.8vw,10px)",
          fontSize: "clamp(9px,0.78vw,10px)",
          fontWeight: 500,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitMaskImage:
            "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, black 0, black calc(100% - 24px), transparent 100%)",
        }}
      >
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} style={{ display: "inline-flex", alignItems: "center", gap: "clamp(6px,0.8vw,10px)", flexShrink: 0, whiteSpace: "nowrap" }}>
              {it.href && !isLast ? (
                <Link
                  href={it.href}
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  {it.label}
                </Link>
              ) : (
                <span style={{ color: isLast ? "rgba(232,183,131,0.85)" : "rgba(255,255,255,0.55)" }}>
                  {it.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
