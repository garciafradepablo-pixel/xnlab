"use client";
import { motion } from "framer-motion";
import type { World } from "./worlds";

type OrbProps = {
  world?: World;
  // Central Core variant — dark crimson, used on /worlds index hero
  central?: boolean;
  size?: number;
  className?: string;
};

// Placeholder visual representation of a World Core.
// Pure CSS + framer-motion. Eventually replaced with 3D-rendered assets
// (Spline / Blender / Three.js). Until then this gives each Core a
// distinct, atmospheric presence with its own movement personality.
export function Orb({ world, central = false, size = 220, className }: OrbProps) {
  if (central) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          width: size,
          height: size,
          willChange: "transform, filter",
        }}
      >
        {/* Outer atmospheric halo */}
        <motion.div
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.04, 1] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute",
            inset: "-30%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(170,40,30,0.35) 0%, rgba(80,15,12,0.15) 40%, transparent 70%)",
            filter: "blur(28px)",
            pointerEvents: "none",
          }}
        />
        {/* Core sphere — dark crimson obsidian */}
        <motion.div
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 30%, rgba(255,120,80,0.95) 0%, rgba(180,50,30,0.85) 18%, rgba(80,12,8,0.95) 50%, rgba(20,5,4,1) 78%)",
            boxShadow:
              "0 0 60px rgba(180,50,30,0.45), inset 0 -20px 60px rgba(0,0,0,0.7), inset 0 20px 40px rgba(255,140,90,0.18)",
          }}
        >
          {/* Specular highlight */}
          <div
            style={{
              position: "absolute",
              top: "12%",
              left: "22%",
              width: "32%",
              height: "22%",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(255,220,200,0.45) 0%, transparent 70%)",
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />
          {/* X mark forged inside */}
          <svg
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0 0 8px rgba(255,170,140,0.55))",
            }}
            aria-hidden
          >
            <defs>
              <linearGradient id="xn-x-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,220,200,0.95)" />
                <stop offset="50%" stopColor="rgba(180,130,110,0.85)" />
                <stop offset="100%" stopColor="rgba(60,30,25,0.95)" />
              </linearGradient>
            </defs>
            <path
              d="M30 30 L70 70 M70 30 L30 70"
              stroke="url(#xn-x-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          </svg>
        </motion.div>
      </motion.div>
    );
  }

  if (!world) return null;
  const m = world.motion;
  const c = world.color;
  // Pulse-specific animation
  const animByPulse: Record<typeof m.pulse, Record<string, unknown>> = {
    still: { scale: m.breatheScale, y: [0, -m.drift, 0] },
    slow: { scale: m.breatheScale, y: [0, -m.drift, 0] },
    drift: { scale: m.breatheScale, x: [0, m.drift, 0, -m.drift, 0], y: [0, -m.drift, 0] },
    vibrate: { scale: m.breatheScale, x: [0, 1.5, -1, 1, 0], y: [0, -1, 1, -1, 0] },
    wave: { scale: m.breatheScale, y: [0, -m.drift, 0, m.drift / 2, 0] },
    refract: {
      scale: m.breatheScale,
      filter: ["hue-rotate(0deg)", "hue-rotate(15deg)", "hue-rotate(-10deg)", "hue-rotate(0deg)"],
    },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative", width: size, height: size, willChange: "transform, filter" }}
    >
      {/* Glow halo in the core's color */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
        transition={{ duration: m.breatheDuration, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute",
          inset: "-35%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${c.glow} 0%, ${c.deep.replace(",1)", ",0.05)")} 45%, transparent 70%)`,
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />
      {/* Core sphere */}
      <motion.div
        animate={animByPulse[m.pulse]}
        transition={{
          duration: m.breatheDuration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 32%, ${c.core} 0%, ${c.mid} 35%, ${c.deep} 78%)`,
          boxShadow: `0 0 50px ${c.glow}, inset 0 -18px 50px rgba(0,0,0,0.55), inset 0 18px 36px ${c.glow.replace("0.45", "0.18").replace("0.4", "0.15").replace("0.5", "0.2").replace("0.3", "0.12").replace("0.25", "0.1")}`,
        }}
      >
        {/* Specular highlight */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            left: "22%",
            width: "32%",
            height: "22%",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${c.core.replace(/0\.\d+\)/, "0.45)")} 0%, transparent 70%)`,
            filter: "blur(6px)",
            pointerEvents: "none",
          }}
        />
        {/* Refract overlay for digital core */}
        {m.pulse === "refract" && (
          <motion.div
            animate={{ opacity: [0, 0.25, 0, 0.18, 0], scale: [0.95, 1.05, 1, 1.02, 0.98] }}
            transition={{ duration: m.breatheDuration * 1.3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `conic-gradient(from 0deg, ${c.core}, transparent 30%, ${c.glow}, transparent 70%, ${c.core})`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
