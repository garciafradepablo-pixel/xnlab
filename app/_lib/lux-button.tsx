"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

type Variant = "ghost" | "solid" | "minimal";

// Premium CTA with three variants:
//   minimal — text-only with an underline that draws on hover. Editorial,
//             reserved for secondary actions inside the flow.
//   ghost   — pill with hairline border + warm sweep that fills from the
//             left on hover. Section-level CTAs.
//   solid   — filled white pill with the same sweep but in solid amber.
//             The final commercial CTA.
// Motion is always slow, deliberate, single-direction. Luxury reads slow.
export function LuxButton({
  href,
  children,
  variant = "ghost",
  // Forward arrows on CTAs were a generic "click me" signal. Removed
  // by default — the pill geometry, hover sweep and typographic
  // weight already say it. Set arrow={true} only on rare callouts.
  arrow = false,
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

  const A = external ? "a" : (Link as React.ElementType);
  const linkProps = external
    ? { href, target: "_blank", rel: "noreferrer" }
    : { href };

  // Minimal — bare text + underline draw + arrow translate.
  if (variant === "minimal") {
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
          gap: "0.75rem",
          padding: "0.85rem 0.1rem 0.95rem",
          minHeight: 44,
          fontSize: "clamp(10px, 0.85vw, 12px)",
          fontWeight: 500,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: hover ? "white" : "rgba(255,255,255,0.85)",
          textDecoration: "none",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          outline: "none",
          transition: "color 0.45s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <motion.span
          animate={{ letterSpacing: hover ? "0.34em" : "0.28em" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block", whiteSpace: "nowrap" }}
        >
          {children}
        </motion.span>
        {arrow && (
          <motion.span
            aria-hidden
            animate={{ x: hover ? 8 : 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "inline-block",
              color: hover ? "#e8b783" : "rgba(255,255,255,0.55)",
              transition: "color 0.45s",
              fontSize: "1.05em",
            }}
          >
            →
          </motion.span>
        )}
        {/* Underline that draws from left to right on hover. Hairline,
            slightly warm, sits just below the baseline. */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ scaleX: hover ? 1 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            background: "linear-gradient(to right, rgba(232,183,131,0.85) 0%, rgba(255,255,255,0.55) 100%)",
            transformOrigin: "left center",
            pointerEvents: "none",
          }}
        />
      </A>
    );
  }

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
