"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { Orb } from "./orb";
import { worlds } from "./worlds";

// The "Six worlds. One laboratory." section, distilled: six marbles
// arranged on a circle, nothing else. The card boxes, the number +
// title + essence stack, the box borders are all gone. Less is more.
// Hover reveals the world's name in its own colour. Subtle scale on
// scroll gives the composition a faint inhale-exhale as the visitor
// passes through.
export function CircleOfWorlds({ lang }: { lang: "en" | "es" }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.04]);

  return (
    <div
      style={{
        padding: "clamp(48px,6vw,96px) clamp(20px,5vw,64px) clamp(40px,5vw,72px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        ref={ref}
        style={{
          position: "relative",
          width: "clamp(320px, 76vw, 760px)",
          aspectRatio: "1",
          scale,
        }}
      >
        {worlds.map((w, i) => {
          // Start at the top (–90°) and go clockwise around the circle.
          const angle = -90 + i * 60;
          const isHover = hovered === w.slug;
          return (
            <div
              key={w.slug}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "clamp(64px, 9vw, 124px)",
                height: "clamp(64px, 9vw, 124px)",
                // Anchor on centre, rotate to the orb's angle, push out by
                // the circle radius, then unrotate so the orb stays
                // upright. Radius is 42% of the container's half-side
                // (≈ 42% of width/2 from centre).
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * clamp(118px, 30vw, 290px))) rotate(${-angle}deg)`,
              }}
            >
              <Link
                href={`/worlds/${w.slug}`}
                aria-label={`${w.title[lang]} — ${w.color.name}`}
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

                {/* Hover label — number + title in core colour, centred
                    just below the orb. Single line, premium small caps. */}
                <motion.div
                  aria-hidden
                  animate={{ opacity: isHover ? 1 : 0, y: isHover ? 0 : 6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "calc(100% + 12px)",
                    transform: "translateX(-50%)",
                    width: "clamp(150px, 18vw, 220px)",
                    fontSize: "clamp(9px, 0.72vw, 10.5px)",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: w.color.hex,
                    fontWeight: 500,
                    textAlign: "center",
                    lineHeight: 1.4,
                    pointerEvents: "none",
                    textShadow: "0 1px 12px rgba(0,0,0,0.9)",
                  }}
                >
                  {w.number} · {w.title[lang]}
                </motion.div>
              </Link>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
