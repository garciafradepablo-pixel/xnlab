"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// PageVeil — a single dark surface mounted at the very top of the
// layout, covering the entire viewport on every fresh page load.
//
// The problem it solves:
//   • On reload, the browser by default restores the previous scroll
//     position. The visitor sees a flash of content at scroll Y
//     before our useEffect can fire scrollTo(0,0). That flash is what
//     the user calls "escupir pantallas" — half-loaded states leaking
//     out from under the brand's atmosphere.
//   • Different pages have different entry animations (or none at
//     all). Without a global mask, each page reveals its own
//     intermediate state during hydration: web fonts swap (FOUT),
//     framer-motion's `initial` styles apply only after JS loads,
//     and any deferred image decodes briefly. The visitor reads
//     "unstable" instead of "composed."
//
// The veil hides all of that under a single dark surface (#060606,
// matching the body's server-side background — no edge visible
// during the fade) and dissolves with the studio's expo-out curve.
// On internal navigation the layout does NOT re-mount, so this
// useEffect does NOT re-run — the veil stays hidden. It only fires
// on a fresh page load (reload, direct URL entry, hard refresh).
//
// scrollTo(0,0) is the actual scroll reset. The inline `<script>` in
// the layout's body sets `history.scrollRestoration = 'manual'`
// synchronously before the browser would otherwise restore scroll —
// without that, this scrollTo would race the browser's restoration
// and lose. The two together produce the guarantee: every reload
// lands at the top, masked by the veil while it does.
//
// Anchor URLs (e.g. /contact#form) are honoured — if the URL carries
// a hash we leave scrolling to the browser so the deep-link lands
// where the visitor expected.
export function PageVeil() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Single source of truth for "always start at the top on reload."
    // The inline head script disables the browser's automatic
    // restoration; this is where the scroll position actually gets
    // pinned to zero. Anchor links opt out — those land on the hash.
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    // One requestAnimationFrame tick before triggering the fade. This
    // guarantees the SSR'd opacity:1 has actually painted before
    // framer-motion starts interpolating — without it, on very fast
    // hydrations (cached reloads on desktop), the visitor can briefly
    // see the veil start its fade before any of the content under it
    // has rendered, creating a "ghost" effect.
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        // 9999 — above the hero, above the haze (25), above the back-
        // to-top button. The veil is the topmost surface during the
        // first paint of every fresh page. Once revealed, pointer
        // events pass through so the page below is interactive.
        zIndex: 9999,
        background: "#060606",
        pointerEvents: revealed ? "none" : "auto",
      }}
      // initial={false} skips the entry interpolation — the veil's
      // starting state is whatever `animate` says when revealed=false
      // (opacity 1). Without this, framer would attempt an entrance
      // animation from a default initial, which would briefly show the
      // page below the veil during the very first frame.
      initial={false}
      animate={{ opacity: revealed ? 0 : 1 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
