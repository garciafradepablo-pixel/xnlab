"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// Initial page load curtain. A dark sheet covers the screen briefly
// while the hero PNGs and fonts settle, then fades away revealing the
// XNLAB universe. Without it, the visitor sees a hard cut from white
// browser background to the dark hero — premium studios never let
// that flash happen. The XNLAB wordmark in faint amber appears
// centered while the curtain fades, becoming the threshold gesture.
export function LoadingCurtain() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Wait for the document to settle (fonts, images, layout) before
    // dropping the curtain. We use a small delay so the hero has time
    // to start its own entry animation underneath.
    const t = setTimeout(() => setShow(false), reduced ? 200 : 900);
    return () => clearTimeout(t);
  }, [reduced]);

  if (!show) return null;

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        background:
          "radial-gradient(ellipse at center, rgba(20,12,8,1) 0%, #060402 75%)",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={{ opacity: [0, 0.55, 0.2], letterSpacing: ["0.6em", "0.46em", "0.42em"] }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: "clamp(11px, 1vw, 13px)",
          fontWeight: 500,
          color: "rgba(232,183,131,0.65)",
          textTransform: "uppercase",
          textAlign: "center",
          margin: 0,
        }}
      >
        XNLAB
      </motion.p>
    </motion.div>
  );
}
