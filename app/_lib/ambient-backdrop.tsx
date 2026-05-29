"use client";
import { motion, useReducedMotion } from "framer-motion";

// AmbientBackdrop — the site's fixed atmospheric stage, mounted once in
// the root layout (zIndex 0, behind all content). It is what turns the
// page from "flat black" into a graded nocturnal field with depth.
//
// PERFORMANCE CONTRACT (learned the hard way — an earlier version with
// `filter: blur()` on fixed full-viewport layers + scroll-tied
// transforms caused visible scroll jank):
//   • NO `filter: blur()` on any fixed layer. Radial gradients are a
//     continuous mathematical surface — they give the soft falloff a
//     blur would, for free, with zero per-frame paint cost.
//   • NO scroll-tied transforms. The only motion is transform/opacity
//     loops on their own GPU layers — cheap, scroll-independent.
//   • Static gradients are stacked inside ONE element (CSS supports
//     comma-separated backgrounds) to keep the layer/overdraw count
//     low while making the darkness rich rather than empty.
//
// The composition: a graded charcoal + blue-black base (so the dark is
// dimensional, never pure #000), a warm amber wash from the top, a cool
// counter-light from the corners, a faint violet undertone that breathes,
// a slow smoke drift for atmospheric movement, the centred heartbeat
// halo, and a soft (not oppressive) vignette. Premium, nocturnal, alive.
export function AmbientBackdrop() {
  const reduced = useReducedMotion();
  return (
    <>
      {/* Layer A — the graded darkness + warm/cool washes, all in one
          static element. Paint order: warm top wash, cool corners,
          warm floor, blue-black charcoal grade from the top, then a
          full-field tonal lift so no pixel is ever pure black. This is
          the single biggest change from "flat black" to "atmospheric
          charcoal with depth." */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: [
            // Champagne wash, top-centre. A single luminous gold light
            // source instead of the old muddy mid-tone-orange tail: the
            // brown intermediate stops (rgba(198,132,56) / rgba(150,92,38))
            // were what turned the whole field turbid. Now it steps from a
            // clean champagne straight to transparent — warm, not muddy.
            "radial-gradient(ellipse 96% 62% at 50% -4%, rgba(255,198,124,0.24) 0%, rgba(238,170,108,0.07) 26%, transparent 56%)",
            // cool counter-light, bottom-left
            "radial-gradient(ellipse 80% 60% at 6% 98%, rgba(120,142,230,0.13) 0%, rgba(82,112,222,0.045) 34%, transparent 66%)",
            // warm floor glow, bottom-centre — a faint champagne ember now,
            // not the brown sludge (rgba(122,72,32)) it used to be.
            "radial-gradient(ellipse 120% 52% at 50% 110%, rgba(198,148,94,0.05) 0%, rgba(150,110,70,0.016) 40%, transparent 60%)",
            // blue-black charcoal grade descending from the top
            "radial-gradient(ellipse 150% 120% at 50% -10%, rgba(24,22,36,0.72) 0%, rgba(15,14,22,0.42) 40%, transparent 74%)",
            // full-field tonal lift so the base is graded charcoal, not #000
            "linear-gradient(180deg, rgba(13,12,18,0.55) 0%, rgba(8,7,11,0.18) 48%, rgba(11,9,14,0.6) 100%)",
          ].join(", "),
        }}
      />

      {/* Layer B — faint violet/magenta undertone, upper-right. The
          premium colour the composition was missing. Breathes very
          slowly (17s), out of phase with the halo, so the atmosphere
          shifts hue almost imperceptibly over time. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 58% 50% at 80% 28%, rgba(154,92,184,0.07) 0%, rgba(120,72,160,0.022) 42%, transparent 70%)",
          willChange: "opacity",
        }}
        initial={{ opacity: 0.7 }}
        animate={reduced ? { opacity: 0.7 } : { opacity: [0.5, 0.9, 0.5] }}
        transition={reduced ? undefined : { duration: 17, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />

      {/* Layer C — slow smoke drift. A soft cool plume in the upper-left
          that drifts on a long loop, giving the darkness atmospheric
          movement without any scroll dependency. Transform-only → GPU. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: "-12%",
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 64% 44% at 34% 20%, rgba(64,70,96,0.11) 0%, rgba(48,52,76,0.03) 44%, transparent 64%)",
          willChange: "transform",
        }}
        initial={{ x: 0, y: 0 }}
        animate={reduced ? { x: 0, y: 0 } : { x: [0, 26, -14, 0], y: [0, -18, 12, 0] }}
        transition={reduced ? undefined : { duration: 26, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />

      {/* Layer D — centred breathing halo, the page's heartbeat. Single
          GPU transform, no scroll dependency. Reduced motion → static. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 72% 56% at 50% 48%, rgba(250,192,128,0.14) 0%, rgba(214,162,108,0.04) 38%, transparent 70%)",
          transformOrigin: "50% 50%",
          willChange: "transform, opacity",
        }}
        initial={{ scale: 1, opacity: 0.85 }}
        animate={reduced ? { scale: 1, opacity: 0.85 } : { scale: [1, 1.06, 1], opacity: [0.78, 1, 0.78] }}
        transition={reduced ? undefined : { duration: 11, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />

      {/* Layer E — vignette. Softened from the previous version (edges
          were 0.82 black, which read as oppressive/claustrophobic) to a
          graded cool-tinted shadow that frames the centre as the lit
          area without closing the walls in. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 122% 106% at 50% 46%, transparent 0%, transparent 42%, rgba(7,6,10,0.42) 72%, rgba(3,2,5,0.82) 100%)",
        }}
      />
    </>
  );
}
