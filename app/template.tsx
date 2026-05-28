"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

// Cinematic route transition — a single cross-fade, keyed on the URL.
//
// Next's App Router remounts template.tsx on every navigation, so an
// AnimatePresence keyed on pathname gives a clean cut: the old page
// fades out, then (mode="wait") the new page fades in. The
// AmbientBackdrop lives in layout.tsx — OUTSIDE this wrapper — so the
// atmosphere never blinks; only the content cross-resolves over it.
// That is the "one continuous world" feel, not stacked page loads.
//
// CRITICAL — opacity ONLY, never transform / filter.
// A previous version animated `y` + `filter: blur()` here. Both leave
// a persistent non-`none` value on the wrapper after the animation
// (translateY(0), blur(0px)), and per CSS spec ANY transform or filter
// other than `none` turns the element into the containing block for
// its position:fixed descendants. That silently broke the fixed Nav
// and the fixed study header — they scrolled away with the page
// instead of staying pinned. Opacity does NOT create that containing
// block, so the fixed chrome keeps working while we still get a
// premium cross-fade.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const enter = reduced ? 0.16 : 0.42;
  const exit = reduced ? 0.1 : 0.22;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: exit, ease: [0.22, 1, 0.36, 1] } }}
        transition={{ duration: enter, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
