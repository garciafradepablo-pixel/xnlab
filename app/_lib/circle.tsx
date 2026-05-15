"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { Orb } from "./orb";
import { worlds } from "./worlds";

// "Six worlds. One laboratory." reduced to its ornament: six marbles on
// a circle, nothing else. Hover labels appear above each orb, in white,
// same weight for all six — no numbers, no colour codes. Less is more.
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
        padding: "clamp(24px,3vw,48px) clamp(20px,5vw,64px)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        ref={ref}
        style={{
          position: "relative",
          width: "clamp(260px, 56vw, 560px)",
          aspectRatio: "1",
          scale,
        }}
      >
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
                width: "clamp(54px, 7.4vw, 100px)",
                height: "clamp(54px, 7.4vw, 100px)",
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * clamp(95px, 23vw, 215px))) rotate(${-angle}deg)`,
              }}
            >
              <Link
                href={`/worlds/${w.slug}`}
                aria-label={w.title[lang]}
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

                {/* Label — sits ABOVE the orb, centred on it. The static
                    wrapper owns positioning and centring, the inner motion
                    div owns only opacity + y so framer's transform never
                    fights the centring translateX. */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "calc(100% + 14px)",
                    transform: "translateX(-50%)",
                    width: "clamp(150px, 18vw, 220px)",
                    pointerEvents: "none",
                  }}
                >
                  <motion.p
                    animate={{ opacity: isHover ? 1 : 0, y: isHover ? 0 : 4 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      margin: 0,
                      fontSize: "clamp(10px, 0.78vw, 11.5px)",
                      letterSpacing: "0.26em",
                      textTransform: "uppercase",
                      color: "white",
                      fontWeight: 600,
                      textAlign: "center",
                      lineHeight: 1.35,
                      textShadow: "0 1px 14px rgba(0,0,0,0.95)",
                    }}
                  >
                    {w.title[lang]}
                  </motion.p>
                </div>
              </Link>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
