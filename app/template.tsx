"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

// Cinematic transition between routes — enter AND exit.
//
// Next.js App Router gives every route a fresh `template.tsx` mount,
// so we wrap the children in an AnimatePresence keyed on the URL.
// The OLD page fades out (opacity + soft blur lift up) before the
// NEW page fades in (opacity + soft blur drop down). `mode="wait"`
// holds the new page until the old one finishes, so the two never
// overlap and the user reads a single cinematic cut.
//
// Timings:
//   Exit  — 240ms, slightly faster, "the old air pulls away"
//   Enter — 480ms, the new atmosphere settles in
// Total perceived transition stays under 720ms, well inside the
// luxury / non-blocking window.
//
// Respects prefers-reduced-motion: collapses to a flat opacity fade.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  if (reduced) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        // Exit is shorter so navigation stays snappy. The old page
        // dissolves in 240ms while `mode="wait"` then yields to the
        // new one's 480ms enter — total perceived transition stays
        // under 720ms.
        exit={{
          opacity: 0,
          y: -4,
          filter: "blur(6px)",
          transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
        }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
