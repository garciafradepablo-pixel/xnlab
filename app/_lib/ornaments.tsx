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
        padding: "clamp(32px, 5vw, 72px) clamp(20px, 5vw, 64px)",
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
