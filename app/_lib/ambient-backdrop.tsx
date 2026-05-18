"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// AmbientBackdrop — the site's fixed atmospheric stage, mounted once
// in the root layout. Four layers stacked behind every page:
//
//   1. Warm amber wash anchored top-centre (the studio's primary light
//      source). Drifts upward as the visitor scrolls — as if walking
//      deeper into the room and away from the door's daylight.
//   2. Cool indigo counter-light from the bottom-left. Slow drift in
//      the opposite direction to keep the air balanced.
//   3. Warm amber accent on the upper right — breaks symmetry without
//      announcing itself.
//   4. Heavy radial vignette so the edges of every viewport feel dark
//      and the centre always reads as the lit area.
//
// All low opacity. All pointer-events:none. Reduced-motion respected.
//
// The scroll-tied drift is what turns the static gradient into a room.
// It runs at ~1/4 the scroll speed (subtle parallax) and is bound to
// the document scroll progress, so the light moves continuously across
// the visitor's entire journey, not just one section's worth.
export function AmbientBackdrop() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Warm top wash drifts UPWARD (light moves away as we go deeper) and
  // dims by ~25% across the full page.
  const warmY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const warmOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.65]);

  // Cool bottom counter-light drifts DOWNWARD slightly and brightens
  // as we scroll — the "evening" of the page.
  const coolY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const coolOpacity = useTransform(scrollYProgress, [0, 1], [0.7, 1]);

  // Right amber accent drifts diagonally up-and-right, very slowly.
  const accentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const accentX = useTransform(scrollYProgress, [0, 1], ["0%", "4%"]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 95% 65% at 50% -2%, rgba(216,147,42,0.22) 0%, rgba(180,110,40,0.08) 28%, rgba(40,18,8,0.025) 55%, transparent 78%)",
          filter: "blur(40px)",
          y: reduced ? "0%" : warmY,
          opacity: reduced ? 1 : warmOpacity,
          willChange: "transform, opacity",
        }}
      />
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 75% 60% at 8% 95%, rgba(124,140,224,0.12) 0%, rgba(80,110,220,0.035) 38%, transparent 68%)",
          filter: "blur(70px)",
          y: reduced ? "0%" : coolY,
          opacity: reduced ? 1 : coolOpacity,
          willChange: "transform, opacity",
        }}
      />
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 50% at 88% 38%, rgba(232,183,131,0.06) 0%, rgba(180,110,40,0.018) 40%, transparent 70%)",
          filter: "blur(80px)",
          y: reduced ? "0%" : accentY,
          x: reduced ? "0%" : accentX,
          willChange: "transform",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 0%, transparent 38%, rgba(6,4,2,0.42) 75%, rgba(4,3,2,0.82) 100%)",
        }}
      />
    </>
  );
}
