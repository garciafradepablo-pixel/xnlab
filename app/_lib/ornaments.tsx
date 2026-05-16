"use client";
import { motion } from "framer-motion";

// Editorial chapter divider — two delicate hairlines flanking a small
// amber star, with the lines extending in opposite directions on
// scroll. Inspired by the page breaks of premium magazine editorials
// (think Apartamento, The Gentlewoman, Document) where a tiny
// typographic ornament signals "new beat" without cutting the page.
//
// The star is a 4-point sparkle, not a circle — gives the divider a
// proper editorial signature instead of generic UI bullet feel.
export function SectionMark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(14px, 2vw, 22px)",
        padding: "clamp(20px, 3vw, 44px) clamp(20px, 5vw, 64px)",
        position: "relative",
      }}
    >
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-block",
          width: "clamp(60px, 9vw, 140px)",
          height: 1,
          background:
            "linear-gradient(to right, transparent 0%, rgba(232,183,131,0.18) 30%, rgba(255,255,255,0.32) 100%)",
          transformOrigin: "right center",
        }}
      />
      <motion.span
        initial={{ scale: 0, opacity: 0, rotate: -90 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          position: "relative",
        }}
      >
        {/* Four-point star — built from two overlapping rotated bars.
            More editorial than a circle, holds the eye as a real
            ornament rather than reading as a tiny UI dot. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            display: "block",
            width: 10,
            height: 1,
            background:
              "linear-gradient(to right, transparent 0%, rgba(232,183,131,0.9) 50%, transparent 100%)",
            top: "50%",
            transform: "translateY(-50%)",
            filter: "drop-shadow(0 0 4px rgba(232,183,131,0.6))",
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            display: "block",
            width: 1,
            height: 10,
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(232,183,131,0.9) 50%, transparent 100%)",
            left: "50%",
            transform: "translateX(-50%)",
            filter: "drop-shadow(0 0 4px rgba(232,183,131,0.6))",
          }}
        />
      </motion.span>
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-block",
          width: "clamp(60px, 9vw, 140px)",
          height: 1,
          background:
            "linear-gradient(to left, transparent 0%, rgba(232,183,131,0.18) 30%, rgba(255,255,255,0.32) 100%)",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}

// Luxury intensity meter — five dots, the first `tier` filled amber,
// the rest faint. Reads as an analogue gauge of how comprehensive a
// service is, with no money attached. The filled dots breathe gently
// so the meter never sits dead on the page. Optional `compact` mode
// shrinks the dot size for inline use on cards.
export function IntensityMeter({
  tier,
  compact,
  style,
}: {
  tier: 1 | 2 | 3 | 4 | 5;
  compact?: boolean;
  style?: React.CSSProperties;
}) {
  const size = compact ? 5 : 7;
  const gap = compact ? 5 : 7;
  return (
    <div
      aria-label={`Intensity ${tier} of 5`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap,
        ...style,
      }}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= tier;
        return (
          <motion.span
            key={n}
            aria-hidden
            animate={
              filled
                ? { opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }
                : undefined
            }
            transition={{
              duration: 3.4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: (n - 1) * 0.18,
            }}
            style={{
              display: "inline-block",
              width: size,
              height: size,
              borderRadius: "50%",
              background: filled
                ? "radial-gradient(circle at 35% 30%, rgba(255,210,160,0.95) 0%, rgba(232,183,131,0.95) 45%, rgba(180,120,60,0.85) 100%)"
                : "rgba(255,255,255,0.12)",
              border: filled ? "none" : "1px solid rgba(255,255,255,0.18)",
              boxShadow: filled
                ? "0 0 8px rgba(232,183,131,0.55), 0 0 2px rgba(232,183,131,0.8)"
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// Standalone atelier star — the same four-point sparkle used by the
// chapter divider, but sized for a hero ornament and continuously
// breathing. Sits in the hero composition between the strapline and
// the CTAs as a typographic punctuation in the atmosphere. Use the
// `size` prop to scale it; default 14px is the comfortable hero size.
export function AtelierStar({
  size = 14,
  color = "rgba(232,183,131,0.85)",
  shadow = "rgba(232,183,131,0.55)",
  className,
  style,
}: {
  size?: number;
  color?: string;
  shadow?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.span
      aria-hidden
      className={className}
      animate={{
        opacity: [0.55, 1, 0.55],
        scale: [1, 1.18, 1],
        rotate: [0, 8, 0, -8, 0],
      }}
      transition={{ duration: 5.4, ease: "easeInOut", repeat: Infinity }}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        position: "relative",
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          margin: "auto",
          display: "block",
          width: size,
          height: 1,
          background: `linear-gradient(to right, transparent 0%, ${color} 50%, transparent 100%)`,
          top: "50%",
          transform: "translateY(-50%)",
          filter: `drop-shadow(0 0 ${size * 0.35}px ${shadow})`,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          margin: "auto",
          display: "block",
          width: 1,
          height: size,
          background: `linear-gradient(to bottom, transparent 0%, ${color} 50%, transparent 100%)`,
          left: "50%",
          transform: "translateX(-50%)",
          filter: `drop-shadow(0 0 ${size * 0.35}px ${shadow})`,
        }}
      />
    </motion.span>
  );
}
