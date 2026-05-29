"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Orb } from "./orb";
import { worlds } from "./worlds";

// "Six surfaces. One brand." Six orbs on a circle plus TWO caption
// surfaces for the active world — and each one carries a different
// beat, never the same sentence twice:
//
//  ── Centred (inside the hex void) → PITCH. The atelier framing:
//      what the surface is, where the customer touches the brand.
//  ── Below (under the cluster) → OUTCOME. The sales framing: what
//      closing the gap on this surface actually produces, the line a
//      CMO can quote upward.
//
// On touch devices the centred caption is unreachable (no hover) so
// the below caption shows BOTH (title + pitch + outcome) stacked, as
// a single disclosure block.
export function CircleOfWorlds({ lang }: { lang: "en" | "es" }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ? worlds.find((w) => w.slug === hovered) : null;

  // Input type — pointer devices get the split (pitch centred, outcome
  // below); touch devices get a single combined caption below.
  //
  // Hydration safety: on the server we don't know the visitor's input
  // type, so we render BOTH caption containers (empty, since `active`
  // is null until hover). After mount we read matchMedia and the
  // unused container unmounts cleanly. This avoids the SSR-vs-client
  // div presence mismatch that the previous "default true" assumption
  // produced on touch devices.
  const [mounted, setMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsPointer(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  // SSR renders the centred caption (matches the desktop default).
  // On touch, after mount, the centred caption unmounts cleanly.
  // The below caption always renders (different content per input
  // type — outcome on pointer, combined on touch).
  const showCentred = !mounted || isPointer;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.04]);

  useEffect(() => {
    if (!hovered) return;
    const id = window.setTimeout(() => setHovered(null), 5000);
    return () => window.clearTimeout(id);
  }, [hovered]);

  return (
    <div
      style={{
        padding: "clamp(24px,3vw,48px) clamp(20px,5vw,64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(20px,2.4vw,36px)",
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
        {/* Orbit ring + spokes — the six surfaces drawn as ONE system.
            A slow comet-trail gradient ring rotates behind the Cores, and
            a spoke runs from the brand centre to each Core; the active
            spoke lights up in that world's colour on hover. The concept
            ("one brand, six surfaces") made literal, and the empty void
            filled with structure. */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 1 }}
        >
          <defs>
            <linearGradient id="xn-orbit" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(232,183,131,0)" />
              <stop offset="50%" stopColor="rgba(232,183,131,0.5)" />
              <stop offset="100%" stopColor="rgba(232,183,131,0)" />
            </linearGradient>
          </defs>
          {worlds.map((w, i) => {
            const a = (-90 + i * 60) * (Math.PI / 180);
            const x = 50 + 40 * Math.sin(a);
            const y = 50 - 40 * Math.cos(a);
            const on = hovered === w.slug;
            return (
              <line
                key={w.slug}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                style={{
                  stroke: on ? w.color.hex : "rgba(255,255,255,0.12)",
                  strokeWidth: on ? 0.6 : 0.3,
                  opacity: on ? 0.95 : 0.45,
                  transition: "stroke 0.45s ease, stroke-width 0.45s ease, opacity 0.45s ease",
                }}
              />
            );
          })}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#xn-orbit)"
            strokeWidth="0.5"
            strokeDasharray="1.6 4"
            style={{ transformOrigin: "50% 50%" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 130, ease: "linear", repeat: Infinity }}
          />
        </svg>

        {/* Central core — the single brand the six surfaces resolve into.
            A champagne glow at rest that adopts the active world's colour
            on hover, breathing slowly so the centre always reads as alive. */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "20%",
            height: "20%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 1,
            background: `radial-gradient(circle at 50% 45%, ${active ? active.color.hex : "rgba(246,202,152,0.9)"} 0%, ${active ? active.color.glow : "rgba(232,183,131,0.4)"} 36%, transparent 70%)`,
            filter: "blur(7px)",
            mixBlendMode: "screen",
          }}
          animate={{ scale: active ? [1, 1.14, 1] : [1, 1.07, 1], opacity: active ? 0.95 : 0.5 }}
          transition={{ scale: { duration: 5, ease: "easeInOut", repeat: Infinity }, opacity: { duration: 0.5 } }}
        />

        {/* Centred caption — PITCH only, kept compact so it lives inside
            the hex void without crowding the orbs. SSR-rendered to
            match the desktop default; unmounts on touch after the
            first matchMedia read. */}
        {showCentred && (
          <div
            aria-hidden={!active}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.slug + "-pitch"}
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
                  <CaptionPitch active={active} lang={lang} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {worlds.map((w) => {
          const angle = -90 + worlds.indexOf(w) * 60;
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
                  animate={{
                    scale: isHover ? 1.2 : 1,
                    filter: isHover
                      ? `drop-shadow(0 0 24px ${w.color.glow}) drop-shadow(0 0 10px rgba(255,255,255,0.3))`
                      : "drop-shadow(0 0 0px rgba(0,0,0,0))",
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%", height: "100%", willChange: "transform, filter" }}
                >
                  <Orb world={w} size={140} />
                </motion.div>
              </Link>
            </div>
          );
        })}
      </motion.div>

      {/* Below-cluster caption — OUTCOME on pointer devices (sales beat
          that complements the pitch centred above); COMBINED (title +
          pitch + outcome) on touch where there's no centre stage. Fixed
          min-height stops the layout from jumping as captions swap in
          and out. */}
      <div
        aria-hidden={!active}
        style={{
          width: "min(560px, 100%)",
          minHeight: 96,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          textAlign: "center",
          padding: "8px 12px",
        }}
      >
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.slug + "-outcome"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: "100%" }}
            >
              {isPointer ? (
                <CaptionOutcome active={active} lang={lang} />
              ) : (
                <CaptionCombined active={active} lang={lang} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Centred caption — pitch. The atelier framing: what the surface IS.
function CaptionPitch({
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

// Below-cluster caption — outcome. The sales beat: what closing the
// gap on this surface produces, framed as a quotable sentence. Italic
// serif so it reads as the studio's own voice, distinct from the
// small-caps pitch above.
function CaptionOutcome({
  active,
  lang,
}: {
  active: (typeof worlds)[number];
  lang: "en" | "es";
}) {
  const serif = "var(--font-serif, 'Cormorant Garamond', Georgia, serif)";
  return (
    <>
      <p
        style={{
          margin: 0,
          fontSize: 10,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.42)",
          fontWeight: 500,
        }}
      >
        {lang === "en" ? "What it produces" : "Lo que produce"}
      </p>
      <p
        style={{
          margin: "12px 0 0",
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: "clamp(1rem, 1.28vw, 1.22rem)",
          lineHeight: 1.4,
          color: active.color.hex,
          opacity: 0.92,
          letterSpacing: "-0.005em",
          textWrap: "balance",
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {active.outcome[lang]}
      </p>
    </>
  );
}

// Combined caption — touch fallback when the centre stage is hidden.
// Stacks title + pitch + outcome so the tap reveals every beat.
function CaptionCombined({
  active,
  lang,
}: {
  active: (typeof worlds)[number];
  lang: "en" | "es";
}) {
  const serif = "var(--font-serif, 'Cormorant Garamond', Georgia, serif)";
  return (
    <>
      <p
        style={{
          margin: 0,
          fontSize: 10,
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          color: active.color.hex,
          fontWeight: 600,
        }}
      >
        {active.title[lang]}
      </p>
      <p
        style={{
          margin: "10px 0 0",
          fontSize: 12.5,
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 300,
          textWrap: "balance",
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {active.pitch[lang]}
      </p>
      <p
        style={{
          margin: "12px 0 0",
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 14,
          lineHeight: 1.4,
          color: active.color.hex,
          opacity: 0.9,
          textWrap: "balance",
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {active.outcome[lang]}
      </p>
    </>
  );
}
