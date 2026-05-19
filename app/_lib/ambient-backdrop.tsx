"use client";
import { motion, useReducedMotion } from "framer-motion";

// AmbientBackdrop — the site's fixed atmospheric stage, mounted once
// in the root layout. The previous version stacked five fixed layers
// each with `filter: blur(36–44px)` AND scroll-tied transforms. That
// combination forces a full-viewport repaint on every scroll frame,
// which on a long page reads as visible "trompicones" (jolts) as the
// compositor rasterises a multi-layer blurred composition each tick.
//
// This version keeps the same atmospheric language with three changes:
//   1. `filter: blur(…)` removed from every layer. Radial-gradient is
//      already a continuous mathematical surface — adding blur on top
//      was gilding the lily and paying the most expensive paint
//      operation in CSS for the privilege.
//   2. Scroll-tied transforms removed from the drift layers. The
//      visible parallax was subtle (~12-22% drift across full page)
//      and the perf cost was outsized. Drift is replaced by a single
//      continuous breath on the centred halo — the "heartbeat" that
//      registers as "alive" without paying per-scroll cost.
//   3. Layers collapsed from five to four: warm wash, cool counter,
//      breathing halo, vignette. The right-amber accent is folded
//      into the warm wash gradient.
//
// All low opacity. All pointer-events:none. Reduced-motion respected.
export function AmbientBackdrop() {
  const reduced = useReducedMotion();
  return (
    <>
      {/* Warm wash anchored top-centre. Static. Radial-gradient
          already provides the soft falloff a blur would add. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 95% 65% at 50% -2%, rgba(216,147,42,0.22) 0%, rgba(195,130,55,0.09) 22%, rgba(180,110,40,0.04) 42%, rgba(40,18,8,0.012) 62%, transparent 80%)",
        }}
      />
      {/* Cool counter-light from the bottom-left. Static. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 78% 60% at 8% 95%, rgba(124,140,224,0.14) 0%, rgba(80,110,220,0.05) 32%, rgba(80,110,220,0.012) 55%, transparent 72%)",
        }}
      />
      {/* Centered breathing halo — the page's heartbeat. Single
          GPU-accelerated transform on its own layer, no scroll
          dependency. The whole atmosphere reads as "alive" from this
          one element. Reduced motion → static. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(232,183,131,0.09) 0%, rgba(190,140,90,0.03) 38%, transparent 70%)",
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
      {/* Vignette — static. Edges of every viewport feel dark, centre
          always reads as the lit area. */}
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
