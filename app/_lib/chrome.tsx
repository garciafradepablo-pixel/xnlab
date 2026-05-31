"use client";
import { motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";

// Magnetic hover — children drift toward the cursor while it hovers; springs back on leave.
// Quiet, expensive feel. No-op on touch devices (no mouse events).
export function Magnetic({
  children,
  strength = 0.22,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 22, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 220, damping: 22, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - (r.left + r.width / 2)) * strength);
        my.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ x: sx, y: sy, display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}

// 1px scroll progress bar pinned to the top; spring-eased, soft gold tint
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: "linear-gradient(90deg, rgba(230,205,165,0.85), rgba(255,255,255,0.6))",
        transformOrigin: "0% 50%",
        scaleX: x,
        zIndex: 9998,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}

// Subtle film-grain texture fixed across the viewport.
// The copy talks about "dark, cinematic, atmospheric" — this is the visual companion.
// SVG feTurbulence rendered once, opacity ~6%, mix-blend overlay so it tints highlights and shadows differently.
export function FilmGrain() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9997,
        pointerEvents: "none",
        opacity: 0.07,
        mixBlendMode: "overlay",
        // Hint to the browser that this layer is static, paint it once
        willChange: "auto",
      }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <filter id="xn-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" seed="7" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.4" intercept="-0.2" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#xn-grain)" />
      </svg>
    </div>
  );
}
