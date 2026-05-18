"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Orb } from "./orb";
import { worlds } from "./worlds";

// "Six worlds. One laboratory." Six orbs on a circle plus a shared
// caption surface for the active world.
//
// Responsive layout:
// — Desktop (md+, hover-capable): caption sits absolutely centred in
//   the hexagonal void, fading between worlds. The constellation
//   reads as one piece.
// — Mobile / touch: caption sits in its OWN block BELOW the
//   constellation. Touch already fires `setHovered` on tap, but on a
//   small screen the centred caption visually collides with the CTA
//   stacked above the constellation. A dedicated caption row removes
//   the overlap and uses the touch tap as the natural disclosure.
//   Auto-clears after 3.5s if the user does not tap a different orb.
export function CircleOfWorlds({ lang }: { lang: "en" | "es" }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ? worlds.find((w) => w.slug === hovered) : null;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.04]);

  // Auto-dismiss the active caption on touch — without an explicit
  // pointer-leave event, mobile users would otherwise see the last
  // tapped world locked in until they tapped another orb.
  useEffect(() => {
    if (!hovered) return;
    const id = window.setTimeout(() => setHovered(null), 3500);
    return () => window.clearTimeout(id);
  }, [hovered]);

  return (
    <div
      style={{
        padding: "clamp(24px,3vw,48px) clamp(20px,5vw,64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(16px,2vw,28px)",
      }}
    >
      <motion.div
        ref={ref}
        style={{
          position: "relative",
          width: "clamp(220px, 44vw, 440px)",
          aspectRatio: "1",
          scale,
        }}
      >
        {/* Desktop centre stage — absolute, hidden on touch */}
        <div
          className="hidden md:flex"
          aria-hidden={!active}
          style={{
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  width: "clamp(150px, 22vw, 240px)",
                  textAlign: "center",
                  padding: "0 12px",
                }}
              >
                <CaptionContent active={active} lang={lang} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {worlds.map((w, i) => {
          const angle = -90 + i * 60;
          const isHover = hovered === w.slug;
          return (
            <div
              key={w.slug}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "clamp(64px, 9.4vw, 130px)",
                height: "clamp(64px, 9.4vw, 130px)",
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * clamp(85px, 19vw, 180px))) rotate(${-angle}deg)`,
              }}
            >
              <Link
                href={`/worlds/${w.slug}`}
                aria-label={`${w.title[lang]} — ${w.pitch[lang]}`}
                onMouseEnter={() => setHovered(w.slug)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(w.slug)}
                onBlur={() => setHovered(null)}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  textDecoration: "none",
                  color: "inherit",
                  outline: "none",
                }}
              >
                <motion.div
                  animate={{ scale: isHover ? 1.16 : 1 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Orb world={w} size={140} />
                </motion.div>
              </Link>
            </div>
          );
        })}
      </motion.div>

      {/* Mobile caption row — sits BELOW the constellation as a
          dedicated disclosure block, so the touch tap reveals the
          world without colliding with the CTA above. Fixed min-height
          so the layout does not jump as the caption fades in / out. */}
      <div
        className="md:hidden"
        aria-hidden={!active}
        style={{
          width: "min(360px, 100%)",
          minHeight: 92,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "8px 12px",
        }}
      >
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.slug}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%" }}
            >
              <CaptionContent active={active} lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Shared caption renderer so desktop centre stage and mobile below
// block stay in perfect typographic sync.
function CaptionContent({
  active,
  lang,
}: {
  active: (typeof worlds)[number];
  lang: "en" | "es";
}) {
  return (
    <>
      <p
        style={{
          margin: 0,
          fontSize: "clamp(10px, 0.82vw, 12px)",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: active.color.hex,
          opacity: 0.95,
          fontWeight: 600,
          lineHeight: 1.35,
          textShadow: "0 1px 14px rgba(0,0,0,0.95)",
        }}
      >
        {active.title[lang]}
      </p>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: "clamp(11px, 0.86vw, 12.5px)",
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 300,
          letterSpacing: "0.005em",
          textShadow: "0 1px 14px rgba(0,0,0,0.95)",
          textWrap: "balance",
        }}
      >
        {active.pitch[lang]}
      </p>
    </>
  );
}
