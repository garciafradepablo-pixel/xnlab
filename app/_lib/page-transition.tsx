"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Cinematic page transition. A dark curtain wipes across the screen on
// every route change — fast (~0.45s) so it never feels like a loader,
// but long enough to mask the abrupt content swap that App Router
// produces between server-rendered pages. Combined with a slight scale
// and blur to add depth, like a film cut rather than a page flip.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Mounted gate prevents the curtain from animating on the very first
  // server render — we only want it on actual client-side route changes.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={mounted ? { opacity: 0, filter: "blur(8px)" } : false}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ minHeight: "100svh" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Curtain overlay — separate from the content so it can layer on
          top during the transition without affecting the layout. */}
      {mounted && <RouteCurtain pathname={pathname} />}
    </>
  );
}

function RouteCurtain({ pathname }: { pathname: string }) {
  const [showing, setShowing] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname === prevPath) return;
    setShowing(true);
    setPrevPath(pathname);
    const t = setTimeout(() => setShowing(false), 480);
    return () => clearTimeout(t);
  }, [pathname, prevPath]);

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.92 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "radial-gradient(ellipse at center, rgba(20,12,8,1) 0%, rgba(4,3,2,1) 80%)",
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}
