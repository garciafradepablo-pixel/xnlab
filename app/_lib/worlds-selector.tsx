"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { worlds, type World } from "./worlds";
import { useLang } from "./atoms";

const microLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
};

// A calm, static sphere preview used inside the selector list.
// We deliberately avoid the full Orb (with framer-motion breathing,
// infinite loops, drift) — six of those in a tight dropdown turns the
// list into visual noise. The visitor needs to read names and pitches,
// not watch six aquariums.
function WorldDot({ world, size = 36 }: { world: World; size?: number }) {
  const c = world.color;
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 38% 32%, ${c.core} 0%, ${c.mid} 38%, ${c.deep} 82%)`,
        boxShadow: `0 0 14px ${c.glow}, inset 0 -6px 14px rgba(0,0,0,0.55), inset 0 4px 10px rgba(255,255,255,0.12)`,
        flexShrink: 0,
      }}
    />
  );
}

// Lets a visitor on any system detail page jump to the world
// (sphere) that fits their project — product, owned digital,
// retail, customer operations, communication, community. No
// "anchor" concept: every system serves all six. Pure navigation.
export function WorldsSelector() {
  const [lang] = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on Escape, and on click outside the selector.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const t = {
    heading: lang === "en" ? "Find your world" : "Encuentra tu mundo",
    sub:
      lang === "en"
        ? "Six spheres · open the one closest to yours"
        : "Seis esferas · abre la más cercana a la tuya",
  };

  return (
    <div ref={rootRef} style={{ marginTop: "clamp(28px,3.5vw,44px)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="worlds-selector-list"
        style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 20px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(232,183,131,0.28)",
          color: "white",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
          transition: "border-color 0.3s ease, background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,183,131,0.55)";
          e.currentTarget.style.background = "rgba(232,183,131,0.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(232,183,131,0.28)";
          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }}
      >
        <span style={{ display: "block" }}>
          <span
            style={{
              ...microLabel,
              color: "rgba(232,183,131,0.85)",
              display: "block",
              marginBottom: 6,
            }}
          >
            {t.heading}
          </span>
          <span
            style={{
              display: "block",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
              fontWeight: 300,
              lineHeight: 1.4,
            }}
          >
            {t.sub}
          </span>
        </span>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "1px solid rgba(232,183,131,0.4)",
            color: "rgba(232,183,131,0.9)",
            fontSize: 16,
            lineHeight: 1,
            flexShrink: 0,
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.35s ease",
          }}
        >
          +
        </span>
      </button>

      {open && (
        <ul
          id="worlds-selector-list"
          style={{
            listStyle: "none",
            padding: 0,
            margin: "12px 0 0",
            maxWidth: 520,
            background: "rgba(6,6,6,0.55)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          {worlds.map((w, i) => (
            <li key={w.slug}>
              <Link
                href={`/worlds/${w.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                  color: "inherit",
                  textDecoration: "none",
                  transition: "background 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(232,183,131,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = "rgba(232,183,131,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <WorldDot world={w} size={36} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 14,
                      color: "white",
                      letterSpacing: "-0.005em",
                      marginBottom: 3,
                    }}
                  >
                    {w.title[lang]}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11.5,
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 300,
                      lineHeight: 1.45,
                    }}
                  >
                    {w.pitch[lang]}
                  </span>
                </span>
                <span
                  aria-hidden
                  style={{
                    color: "rgba(232,183,131,0.6)",
                    fontSize: 14,
                    marginLeft: 4,
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
