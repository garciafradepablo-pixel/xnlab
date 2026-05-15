"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

// Custom cursor — only renders on real mouse/pointer devices, never on touch
export function PremiumCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setOk(mq.matches);
    const upd = () => setOk(mq.matches);
    mq.addEventListener?.("change", upd);
    return () => mq.removeEventListener?.("change", upd);
  }, []);
  useEffect(() => {
    if (!ok) return;
    document.documentElement.classList.add("xn-cursor");
    const dot = dotRef.current;
    if (!dot) return;
    let mx = 0, my = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", move);
    let raf = 0;
    const tick = () => {
      dot.style.transform = `translate(${mx - 2.5}px,${my - 2.5}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("xn-cursor");
    };
  }, [ok]);
  if (!ok) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "white",
          mixBlendMode: "difference",
        }}
      />
    </div>
  );
}

// 1px scroll progress bar pinned to the top; subtle gold accent
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
