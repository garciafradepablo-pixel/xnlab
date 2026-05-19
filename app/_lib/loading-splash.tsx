"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useMounted } from "./atoms";

// First-visit splash — a short atmospheric overture before the hero.
// Six orb-particles burst from the centre, settle into a wider arc,
// then the surface fades to reveal the site. Total length ~700ms.
//
// Gating:
//   • sessionStorage `xn-splash-seen` — once per session only.
//   • prefers-reduced-motion — instantly skipped (returns null).
//   • Click / keypress anywhere during the splash — fades immediately.
//
// State pattern: useMounted gives a clean false→true transition without
// setState-in-effect (React 19 rule). The session/reduced check happens
// in a lazy useState initializer that only runs on the client because
// the component returns null until mounted=true.

const KEY = "xn-splash-seen";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: "warm" | "cool" | "amber-anchor" | "neutral";
  delay: number;
};

// Six particles only — amber anchor + 5 satellites. Lower count keeps
// the burst readable at the new (faster) tempo and saves a few motion
// nodes worth of layout cost on mid-range mobile devices.
const PARTICLES: Particle[] = [
  { id: 0, x: 0, y: 0, size: 9, hue: "amber-anchor", delay: 0 },
  { id: 1, x: -8, y: -3, size: 4, hue: "warm", delay: 0.04 },
  { id: 2, x: 7, y: -4, size: 4, hue: "warm", delay: 0.05 },
  { id: 3, x: -5, y: 6, size: 3, hue: "cool", delay: 0.07 },
  { id: 4, x: 6, y: 5, size: 3, hue: "cool", delay: 0.08 },
  { id: 5, x: 0, y: -11, size: 3, hue: "neutral", delay: 0.1 },
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

function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return sessionStorage.getItem(KEY) !== "1";
  } catch {
    return false;
  }
}

export function LoadingSplash() {
  const mounted = useMounted();
  // Decide once on first client render whether to show. Until mounted
  // is true the component returns null, so the lazy initializer never
  // runs during SSR.
  const [allowed] = useState<boolean>(() => shouldShowSplash());
  const [closed, setClosed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const active = mounted && allowed && !closed;

  useEffect(() => {
    if (!active) return;
    // Settle, then fade. ~700ms total.
    const settleId = window.setTimeout(() => setLeaving(true), 380);
    const removeId = window.setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      setClosed(true);
    }, 720);
    const skip = () => {
      setLeaving(true);
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        setClosed(true);
      }, 180);
    };
    window.addEventListener("click", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(settleId);
      window.clearTimeout(removeId);
      window.removeEventListener("click", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [active]);

  if (!active) return null;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.32 : 0, ease: [0.22, 1, 0.36, 1] }}
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
      {/* Centred origin glow — short single beat */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(70vw, 520px)",
          height: "min(70vw, 520px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(232,183,131,0.18) 0%, rgba(180,110,40,0.06) 28%, transparent 60%)",
          filter: "blur(36px)",
          willChange: "transform, opacity",
        }}
        initial={{ opacity: 0, scale: 0.55 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Particle burst */}
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
                boxShadow: `0 0 ${p.size * 2.5}px ${glow}`,
                willChange: "transform, opacity",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
              animate={{
                x: `${p.x}vmin`,
                y: `${p.y}vmin`,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1],
                delay: p.delay,
              }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
