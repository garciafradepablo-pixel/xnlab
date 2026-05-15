"use client";
import { motion } from "framer-motion";

// A delicate editorial divider: two fading hairlines meeting at a small
// amber dot in the middle. Used sparingly between major story beats so
// the visitor feels a chapter change without a hard line cutting the
// page in two.
export function SectionMark() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "clamp(28px, 4.5vw, 64px) clamp(20px, 5vw, 64px)",
      }}
    >
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-block",
          width: "clamp(40px, 6vw, 88px)",
          height: 1,
          background:
            "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.28) 100%)",
          transformOrigin: "right center",
        }}
      />
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        style={{
          display: "inline-block",
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "rgba(232,183,131,0.7)",
          boxShadow: "0 0 12px rgba(232,183,131,0.5)",
        }}
      />
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-12%" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-block",
          width: "clamp(40px, 6vw, 88px)",
          height: 1,
          background:
            "linear-gradient(to left, transparent 0%, rgba(255,255,255,0.28) 100%)",
          transformOrigin: "left center",
        }}
      />
    </div>
  );
}
