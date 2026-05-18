"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// First-visit splash — a brief atmospheric overture before the hero.
// Twelve orb-particles burst from the centre, settle into a wider
// constellation around the page's optical centre, then the whole
// surface fades to reveal the site. Total length ~1.8s.
//
// Gating:
//   • sessionStorage `xn-splash-seen` — once per session only. Bouncing
//     between pages inside the studio shouldn't re-trigger the overture.
//   • prefers-reduced-motion — instantly skipped (returns null).
//   • Click / keypress anywhere during the splash — fades it out
//     immediately so a returning visitor can punch through.
//
// Visual language deliberately echoes the hero constellation: warm-cool
// dust with one amber anchor particle in the centre, soft glow blur,
// no text. The splash is a breath, not a brand reveal.

const KEY = "xn-splash-seen";

type Particle = {
  id: number;
  // Final position in % around centre. Each particle drifts to its
  // resting spot on a slightly different timing so the constellation
  // settles like a chord, not a snap.
  x: number;
  y: number;
  size: number;
  hue: "warm" | "cool" | "amber-anchor" | "neutral";
  delay: number;
  drift: number;
};

const PARTICLES: Particle[] = [
  // Amber anchor — sits at the centre, slightly brighter and larger
  { id: 0, x: 0, y: 0, size: 9, hue: "amber-anchor", delay: 0, drift: 0 },
  // Inner ring — small radius, fast settling
  { id: 1, x: -7, y: -3, size: 5, hue: "warm", delay: 0.08, drift: 1.6 },
  { id: 2, x: 6, y: -4, size: 5, hue: "warm", delay: 0.1, drift: 1.4 },
  { id: 3, x: -4, y: 5, size: 4, hue: "cool", delay: 0.12, drift: 1.8 },
  { id: 4, x: 5, y: 4, size: 4, hue: "cool", delay: 0.14, drift: 1.5 },
  // Mid ring — pause longer, drift further
  { id: 5, x: -14, y: -6, size: 4, hue: "neutral", delay: 0.22, drift: 2.2 },
  { id: 6, x: 13, y: -7, size: 4, hue: "neutral", delay: 0.24, drift: 2.0 },
  { id: 7, x: -11, y: 9, size: 4, hue: "cool", delay: 0.26, drift: 2.4 },
  { id: 8, x: 12, y: 8, size: 4, hue: "warm", delay: 0.28, drift: 2.3 },
  // Outer ring — wider drift, smallest particles
  { id: 9, x: -22, y: 2, size: 3, hue: "neutral", delay: 0.38, drift: 3.2 },
  { id: 10, x: 21, y: 3, size: 3, hue: "neutral", delay: 0.4, drift: 3.0 },
  { id: 11, x: 1, y: -16, size: 3, hue: "warm", delay: 0.42, drift: 2.8 },
];

function colorFor(hue: Particle["hue"]): { core: string; glow: string } {
  switch (hue) {
    case "amber-anchor":
      return { core: "rgba(255,225,180,1)", glow: "rgba(232,183,131,0.85)" };
    case "warm":
      return { core: "rgba(255,210,165,0.95)", glow: "rgba(232,183,131,0.55)" };
    case "cool":
      return { core: "rgba(210,220,255,0.92)", glow: "rgba(150,170,230,0.45)" };
    case "neutral":
      return { core: "rgba(255,255,255,0.85)", glow: "rgba(255,255,255,0.35)" };
  }
}

export function LoadingSplash() {
  const reduced = useReducedMotion();
  const [show, show_] = useState<boolean | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Mount decision lives in an effect so the server snapshot never
  // emits the splash. Avoids hydration mismatch and ensures the
  // sessionStorage gate is read on the client.
  useEffect(() => {
    if (reduced) {
      show_(false);
      return;
    }
    try {
      const seen = sessionStorage.getItem(KEY);
      if (seen === "1") {
        show_(false);
        return;
      }
    } catch {}
    show_(true);
  }, [reduced]);

  useEffect(() => {
    if (!show) return;
    // Auto-fade after the constellation has settled.
    const settleId = window.setTimeout(() => setLeaving(true), 1500);
    // Remove from DOM after the fade completes.
    const removeId = window.setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      show_(false);
    }, 2200);
    // Skip on user input.
    const skip = () => {
      setLeaving(true);
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        show_(false);
      }, 350);
    };
    window.addEventListener("click", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(settleId);
      window.clearTimeout(removeId);
      window.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [show]);

  if (show !== true) return null;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.7 : 0, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "radial-gradient(ellipse at center, #0c0805 0%, #060402 55%, #030201 100%)",
        pointerEvents: leaving ? "none" : "auto",
        cursor: "pointer",
      }}
    >
      {/* Centred origin glow — a soft amber pool from which the
          particles emerge. Breathes once on its own arc. */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 720px)",
          height: "min(90vw, 720px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(232,183,131,0.16) 0%, rgba(180,110,40,0.06) 28%, transparent 60%)",
          filter: "blur(40px)",
        }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 1, 0.6], scale: [0.4, 1, 1.1] }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Particle burst. Each orb starts at the centre (x:0, y:0)
          inside a wrapper that's centred via translate, then animates
          out to its constellation position. The wrapper holds the
          centring so the inner motion only carries x/y/opacity/scale. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          transform: "translate(-50%, -50%)",
        }}
      >
        {PARTICLES.map((p) => {
          const { core, glow } = colorFor(p.hue);
          return (
            <motion.div
              key={p.id}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                borderRadius: "50%",
                background: core,
                boxShadow: `0 0 ${p.size * 2.5}px ${glow}, 0 0 ${p.size * 5}px ${glow}`,
                willChange: "transform, opacity",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
              animate={{
                x: `${p.x}vmin`,
                y: `${p.y}vmin`,
                opacity: [0, 1, 0.85],
                scale: [0.2, 1.3, 1],
              }}
              transition={{
                duration: p.drift > 0 ? 1.2 : 0.9,
                ease: [0.22, 1, 0.36, 1],
                delay: p.delay,
                times: [0, 0.55, 1],
              }}
            />
          );
        })}
      </div>

      {/* Wordmark — emerges quietly after the constellation settles.
          Lowercase letter-spaced mark only; no tagline, no logo.
          The site itself is the brand reveal — this is a held breath. */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(60px, 12vh, 120px)",
          transform: "translateX(-50%)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.52em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
      >
        XNLAB
      </motion.div>
    </motion.div>
  );
}
