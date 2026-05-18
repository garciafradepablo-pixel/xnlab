"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Floating back-to-top button. Appears only after the visitor has
// scrolled past two viewport heights — never present in the hero or
// the first commercial section, so it doesn't compete with the page's
// own CTAs. Sits in the bottom-right with a thin amber border, blends
// with the rest of the studio's microcopy.
export function BackToTop() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onClick = () => {
    if (reduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={onClick}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            right: "clamp(16px, 2.4vw, 32px)",
            bottom: "clamp(16px, 2.4vw, 32px)",
            zIndex: 150,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "1px solid rgba(232,183,131,0.45)",
            background: "rgba(4,3,2,0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            color: "rgba(232,183,131,0.9)",
            fontSize: 16,
            fontFamily: "var(--font-serif,'Cormorant Garamond',Georgia,serif)",
            fontStyle: "italic",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.4s, border-color 0.4s, color 0.4s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(232,183,131,0.12)";
            e.currentTarget.style.borderColor = "#e8b783";
            e.currentTarget.style.color = "#e8b783";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(4,3,2,0.78)";
            e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
            e.currentTarget.style.color = "rgba(232,183,131,0.9)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = "rgba(232,183,131,0.12)";
            e.currentTarget.style.borderColor = "#e8b783";
            e.currentTarget.style.color = "#e8b783";
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = "rgba(4,3,2,0.78)";
            e.currentTarget.style.borderColor = "rgba(232,183,131,0.45)";
            e.currentTarget.style.color = "rgba(232,183,131,0.9)";
          }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
}
