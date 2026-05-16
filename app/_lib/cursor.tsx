"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

// Premium luxury cursor — a thin amber ring that follows the mouse
// with a soft spring delay, expanding subtly when over an interactive
// element. Native cursor is kept visible underneath so we don't break
// accessibility or hide the system pointer. Hidden on touch and on
// reduced-motion preference.
export function Cursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 380, damping: 30, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 380, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (reduced) return;
    // Only enable on devices with a real pointer (skip touch, stylus).
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mql.matches) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const interactive = target.closest("a, button, [role='button'], input, textarea, select, label");
      if (interactive) setHovering(true);
    };
    const onLeave = () => setHovering(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnter, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        pointerEvents: "none",
        zIndex: 99999,
      }}
    >
      {/* Premium halo — slowly cycles through the six XNLAB world
          accents (amber, violet, ivory, stone, indigo, cyan), so the
          cursor reads as a moving signature of the universe itself.
          Twenty-four-second loop means the colour change is perceived,
          not flashed. */}
      <motion.div
        animate={{
          width: hovering ? 60 : 36,
          height: hovering ? 60 : 36,
          opacity: hovering ? 0.85 : 0.55,
          background: [
            // Hospitality — amber gold
            "radial-gradient(circle, rgba(216,147,42,0.55) 0%, rgba(216,147,42,0.18) 38%, transparent 72%)",
            // Nightlife — electric violet
            "radial-gradient(circle, rgba(140,70,255,0.55) 0%, rgba(140,70,255,0.18) 38%, transparent 72%)",
            // Lifestyle — ivory pearl
            "radial-gradient(circle, rgba(232,226,210,0.55) 0%, rgba(232,226,210,0.18) 38%, transparent 72%)",
            // Architecture — mineral stone
            "radial-gradient(circle, rgba(200,200,192,0.55) 0%, rgba(200,200,192,0.18) 38%, transparent 72%)",
            // Music — midnight indigo
            "radial-gradient(circle, rgba(124,140,224,0.55) 0%, rgba(124,140,224,0.18) 38%, transparent 72%)",
            // Digital — iridescent cyan
            "radial-gradient(circle, rgba(70,214,206,0.55) 0%, rgba(70,214,206,0.18) 38%, transparent 72%)",
            // Loop back to amber
            "radial-gradient(circle, rgba(216,147,42,0.55) 0%, rgba(216,147,42,0.18) 38%, transparent 72%)",
          ],
        }}
        transition={{
          width: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          background: { duration: 24, ease: "linear", repeat: Infinity },
        }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          translateX: "-50%",
          translateY: "-50%",
          borderRadius: "50%",
          filter: "blur(2px)",
        }}
      />
      {/* Precise dot at the centre — warm white with a tight glow,
          tiny so it never competes with the system cursor underneath. */}
      <motion.div
        animate={{
          scale: hovering ? 1.35 : 1,
          opacity: hovering ? 1 : 0.9,
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          translateX: "-50%",
          translateY: "-50%",
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "rgba(255,245,225,0.96)",
          boxShadow:
            "0 0 4px rgba(255,235,200,0.95), 0 0 12px rgba(255,220,180,0.55)",
        }}
      />
    </motion.div>
  );
}
