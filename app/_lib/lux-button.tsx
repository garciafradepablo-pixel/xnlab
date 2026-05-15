"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

type Variant = "ghost" | "solid";

// Premium CTA. Two variants share the same anatomy: a subtle warm
// sweep that fills from the left on hover, an arrow that slides right
// and gilds, and a letter-spacing breath. No bouncy magnetic drift —
// the motion is slow, deliberate, single-direction. Luxury reads slow.
export function LuxButton({
  href,
  children,
  variant = "ghost",
  arrow = true,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
  external?: boolean;
}) {
  const [hover, setHover] = useState(false);

  const isSolid = variant === "solid";
  const base = isSolid
    ? {
        baseColor: "#060606",
        hoverColor: "#060606",
        background: "white",
        border: "1px solid transparent",
        sweep:
          "linear-gradient(90deg, rgba(232,183,131,0) 0%, rgba(232,183,131,0.55) 50%, rgba(232,183,131,1) 100%)",
        arrowColor: hover ? "#060606" : "#060606",
      }
    : {
        baseColor: "rgba(255,255,255,0.92)",
        hoverColor: "white",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.20)",
        sweep:
          "linear-gradient(90deg, rgba(232,183,131,0) 0%, rgba(232,183,131,0.16) 50%, rgba(232,183,131,0.30) 100%)",
        arrowColor: hover ? "#e8b783" : "rgba(255,255,255,0.6)",
      };

  const A = external ? "a" : (Link as React.ElementType);
  const linkProps = external
    ? { href, target: "_blank", rel: "noreferrer" }
    : { href };

  return (
    <A
      {...linkProps}
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.85rem",
        padding: "1.05rem clamp(1.7rem, 3vw, 2.6rem)",
        fontSize: "clamp(10px, 0.85vw, 12px)",
        fontWeight: 500,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: hover ? base.hoverColor : base.baseColor,
        textDecoration: "none",
        background: base.background,
        border: base.border,
        borderRadius: 100,
        overflow: "hidden",
        transition: "color 0.45s cubic-bezier(0.22,1,0.36,1), border-color 0.45s",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {/* Warm sweep that fills from the left on hover. */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: hover ? "0%" : "-101%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          background: base.sweep,
          pointerEvents: "none",
        }}
      />

      <motion.span
        animate={{ letterSpacing: hover ? "0.34em" : "0.28em" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          zIndex: 2,
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </motion.span>

      {arrow && (
        <motion.span
          aria-hidden
          animate={{ x: hover ? 7 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            zIndex: 2,
            display: "inline-block",
            color: base.arrowColor,
            transition: "color 0.45s",
            fontSize: "1.05em",
          }}
        >
          →
        </motion.span>
      )}
    </A>
  );
}
