"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// AmbientBackdrop — the site's fixed atmospheric stage, mounted once
// in the root layout. Five layers stacked behind every page:
//
//   1. Warm amber wash anchored top-centre (the studio's primary light
//      source). Drifts upward as the visitor scrolls — as if walking
//      deeper into the room and away from the door's daylight.
//   2. Cool indigo counter-light from the bottom-left. Slow drift in
//      the opposite direction to keep the air balanced.
//   3. Warm amber accent on the upper right — breaks symmetry without
//      announcing itself.
//   4. Centered breathing halo — a slow continuous pulse around the
//      page axis that gives the room a heartbeat. The "After Effects"
//      layer: it's what turns a still gradient into a living atmosphere.
//   5. Heavy radial vignette so the edges of every viewport feel dark
//      and the centre always reads as the lit area.
//
// All low opacity. All pointer-events:none. Reduced-motion respected.
//
// Blur values intentionally kept under 50px — large blurs on fixed
// full-viewport elements that animate transform are the single most
// expensive paint operation a scroll page can carry, and visible
// quality plateaus past ~48px on these soft gradient sources.
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
            "radial-gradient(ellipse 95% 65% at 50% -2%, rgba(216,147,42,0.26) 0%, rgba(180,110,40,0.10) 28%, rgba(40,18,8,0.03) 55%, transparent 78%)",
          filter: "blur(36px)",
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
            "radial-gradient(ellipse 75% 60% at 8% 95%, rgba(124,140,224,0.14) 0%, rgba(80,110,220,0.04) 38%, transparent 68%)",
          filter: "blur(44px)",
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
            "radial-gradient(ellipse 80% 50% at 88% 38%, rgba(232,183,131,0.07) 0%, rgba(180,110,40,0.022) 40%, transparent 70%)",
          filter: "blur(44px)",
          y: reduced ? "0%" : accentY,
          x: reduced ? "0%" : accentX,
          willChange: "transform",
        }}
      />
      {/* Centered breathing halo — the page's continuous heartbeat.
          A soft amber radial pinned to the viewport centre that
          scale-pulses on an 11s loop. It's what registers as
          "atmosphere is alive" to the visitor without ever announcing
          itself as motion. Reduced motion → static at scale 1. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(232,183,131,0.08) 0%, rgba(180,110,40,0.025) 40%, transparent 70%)",
          filter: "blur(40px)",
          transformOrigin: "50% 50%",
          willChange: "transform, opacity",
        }}
        initial={{ scale: 1, opacity: 0.85 }}
        animate={
          reduced
            ? { scale: 1, opacity: 0.85 }
            : { scale: [1, 1.06, 1], opacity: [0.78, 1, 0.78] }
        }
        transition={
          reduced
            ? undefined
            : { duration: 11, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
        }
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
