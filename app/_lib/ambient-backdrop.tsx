"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

// Seeded star / cosmic-dust field as a single box-shadow list, so the
// whole field is one painted node (zero extra DOM, no per-star cost). The
// PRNG is deterministic → SSR and client emit the identical string, no
// hydration mismatch. A few stars take a jewel tint so the dark reads as
// space dusted with the brand palette, not a flat speckle.
function useStarField(count: number, seed: number) {
  return useMemo(() => {
    let s = seed >>> 0;
    const rnd = () => {
      s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const tints = [
      "255,247,232",
      "255,247,232",
      "255,247,232",
      "255,206,138",
      "150,214,224",
      "196,160,236",
      "244,168,176",
    ];
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = (rnd() * 100).toFixed(2);
      const y = (rnd() * 100).toFixed(2);
      const b = (0.12 + rnd() * 0.5).toFixed(2);
      const spread = rnd() > 0.86 ? "0.6px" : rnd() > 0.55 ? "0.3px" : "0";
      const tint = tints[Math.floor(rnd() * tints.length)];
      out.push(`${x}vw ${y}vh 0 ${spread} rgba(${tint},${b})`);
    }
    return out.join(", ");
  }, [count, seed]);
}

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
  const stars = useStarField(90, 0x5151d3);
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

      {/* Layer A2 — AURORA WARM. Saturated jewel masses (gold, magenta,
          copper) held to the edges so the centre stays legible for body
          copy. Drifts slowly and breathes its opacity. Pure gradient +
          transform/opacity loop → obeys the no-blur / no-scroll contract. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: "-16%",
          zIndex: 0,
          pointerEvents: "none",
          background: [
            // WARM HEMISPHERE (left) — the brand, premium in person.
            "radial-gradient(ellipse 54% 50% at 14% 30%, rgba(255,178,92,0.2) 0%, transparent 60%)",
            "radial-gradient(ellipse 46% 46% at 7% 70%, rgba(240,120,94,0.16) 0%, transparent 60%)",
            "radial-gradient(ellipse 44% 44% at 30% 90%, rgba(232,150,90,0.13) 0%, transparent 58%)",
          ].join(", "),
          willChange: "transform, opacity",
        }}
        initial={{ x: 0, y: 0, opacity: 0.78 }}
        animate={reduced ? { x: 0, y: 0, opacity: 0.78 } : { x: [0, 22, -12, 0], y: [0, -18, 12, 0], opacity: [0.62, 0.95, 0.62] }}
        transition={reduced ? undefined : { duration: 26, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      />

      {/* Layer A3 — AURORA COOL. The counterpart masses (violet, teal,
          blue) drift the opposite way and breathe OUT OF PHASE with the
          warm aurora, so the whole field slides warm↔cool over ~30s — the
          atmosphere's slow hue transition, done with opacity alone. */}
      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          inset: "-16%",
          zIndex: 0,
          pointerEvents: "none",
          background: [
            // COOL HEMISPHERE (right) — the customer, premium on every screen.
            "radial-gradient(ellipse 50% 50% at 88% 32%, rgba(146,96,230,0.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 52% 50% at 94% 72%, rgba(56,176,208,0.16) 0%, transparent 60%)",
            "radial-gradient(ellipse 46% 44% at 72% 10%, rgba(74,114,232,0.13) 0%, transparent 58%)",
          ].join(", "),
          willChange: "transform, opacity",
        }}
        initial={{ x: 0, y: 0, opacity: 0.85 }}
        animate={reduced ? { x: 0, y: 0, opacity: 0.85 } : { x: [0, -22, 14, 0], y: [0, 16, -10, 0], opacity: [0.92, 0.62, 0.92] }}
        transition={reduced ? undefined : { duration: 30, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
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
          background: [
            "radial-gradient(ellipse 56% 48% at 82% 26%, rgba(178,86,196,0.13) 0%, rgba(132,76,176,0.035) 42%, transparent 70%)",
            "radial-gradient(ellipse 54% 50% at 10% 70%, rgba(58,168,196,0.1) 0%, rgba(46,128,168,0.028) 44%, transparent 70%)",
          ].join(", "),
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

      {/* Layer S — star / cosmic-dust field. One painted node carrying the
          whole field as a box-shadow list; drifts and twinkles on a long
          loop. Gives the dark real depth across every scroll position. */}
      <motion.div
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", willChange: "transform, opacity" }}
        initial={{ x: 0, y: 0, opacity: 0.7 }}
        animate={reduced ? { x: 0, y: 0, opacity: 0.8 } : { x: [0, -18, 0], y: [0, 14, 0], opacity: [0.6, 0.95, 0.6] }}
        transition={reduced ? undefined : { duration: 44, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: 1, borderRadius: "50%", backgroundColor: "transparent", boxShadow: stars }} />
      </motion.div>

      {/* Layer G — global film grain. Fractal-noise texture (no asset),
          soft-light blended very low and drifting in stepped jumps. Sits
          behind content (zIndex 0) and unifies the whole background into a
          single graded film frame. Transform-only loop, NO blur → contract
          safe. Frozen by the reduced-motion block. */}
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", opacity: 0.22 }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-50%",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
            mixBlendMode: "soft-light",
            opacity: 0.6,
            animation: "xn-grain 0.8s steps(5) infinite",
            willChange: "transform",
          }}
        />
      </div>

      {/* Layer R — readability scrim. The aurora masses live at the edges,
          but content columns live down the centre; this keeps a soft dark
          spine through the middle so body copy and the faint editorial
          labels never lose contrast against the brighter colour, while the
          corners stay saturated. Legibility first, colour at the margins. */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 64% 132% at 50% 50%, rgba(5,4,9,0.42) 0%, rgba(5,4,9,0.2) 38%, transparent 64%)",
        }}
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
