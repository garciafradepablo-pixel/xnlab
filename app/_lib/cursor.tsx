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
        mixBlendMode: "difference",
      }}
    >
      <motion.div
        animate={{
          width: hovering ? 28 : 14,
          height: hovering ? 28 : 14,
          borderColor: hovering ? "rgba(232,183,131,0.65)" : "rgba(255,255,255,0.32)",
          opacity: hovering ? 0.95 : 0.7,
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: "50%",
          borderStyle: "solid",
          borderWidth: 1,
          boxSizing: "border-box",
          filter: "blur(0.3px)",
        }}
      />
    </motion.div>
  );
}
