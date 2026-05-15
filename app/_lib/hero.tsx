"use client";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ts, tsS, Dust } from "./atoms";
import { Orb } from "./orb";
import { worlds } from "./worlds";

type HeroCopy = {
  eyebrow: string;
  s1: string;
  s2: string;
  s3: string;
  s4: string;
};

// The hero arranges the six World Cores in a wave / arc above the XNLAB
// wordmark. The Central Core sits at the very centre, slightly larger, as
// the axis. Each World Core is a link to its detail page; hovering reveals
// its title and colour name. The whole composition breathes with a subtle
// mouse-parallax drift.
export function Hero({ lang, copy }: { lang: "en" | "es"; copy: HeroCopy }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  // Mouse parallax — same gentle spring as before
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const sx = useSpring(rawX, { stiffness: 14, damping: 50 });
  const sy = useSpring(rawY, { stiffness: 14, damping: 50 });
  const fieldX = useTransform(sx, [-1, 1], [-12, 12]);
  const fieldY = useTransform(sy, [-1, 1], [-8, 8]);
  const centralX = useTransform(sx, [-1, 1], [-6, 6]);
  const centralY = useTransform(sy, [-1, 1], [-4, 4]);

  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    const fn = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      rawX.set(((e.clientX - left) / width - 0.5) * 2);
      rawY.set(((e.clientY - top) / height - 0.5) * 2);
    };
    el.addEventListener("mousemove", fn);
    return () => el.removeEventListener("mousemove", fn);
  }, [rawX, rawY, reduced]);

  // Arc geometry — 6 orbs around the top half of the wordmark.
  // Angle 0 is straight up; positive sweeps clockwise.
  const arc = [-65, -39, -13, 13, 39, 65]; // degrees, evenly distributed across the arch
  const orbSize = "clamp(72px, 8vw, 124px)";
  const arcRadius = "clamp(190px, 32vw, 360px)";

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        height: "100svh",
        overflow: "hidden",
        background: "#060402",
      }}
    >
      {/* LAYER 1 — Backdrop / curtain. Same atmospheric still as before. */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.45 }}>
          <Image
            src="/images/hero/01_background_desktop.png"
            alt=""
            fill
            sizes="100vw"
            className="opacity-0 sm:opacity-100"
            loading="eager"
            fetchPriority="high"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          <Image
            src="/images/hero/01_background_mobile.png"
            alt=""
            fill
            sizes="100vw"
            className="opacity-100 sm:opacity-0"
            loading="eager"
            fetchPriority="high"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(3,2,1,0.18) 0%, rgba(3,2,1,0.92) 80%)",
          }}
        />
        {/* Top + bottom fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(4,2,1,0.85) 0%, transparent 26%, transparent 62%, rgba(4,2,1,1) 100%)",
          }}
        />
      </div>

      {/* BLACK INTRO — fades to reveal the composition */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "#030201",
          pointerEvents: "none",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />

      {/* SHEEN — distant atmospheric warmth */}
      <motion.div
        style={{
          position: "absolute",
          top: "-12%",
          right: "-6%",
          zIndex: 4,
          width: "48vw",
          height: "48vw",
          pointerEvents: "none",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,235,200,0.07) 0%, rgba(255,220,180,0.03) 38%, transparent 70%)",
          filter: "blur(56px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 0.55], scale: [0.6, 1.1, 1.3] }}
        transition={{ duration: 4.4, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "-12%",
          left: "-6%",
          zIndex: 4,
          width: "42vw",
          height: "42vw",
          pointerEvents: "none",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(200,180,255,0.05) 0%, rgba(180,160,255,0.02) 38%, transparent 70%)",
          filter: "blur(60px)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.6, 0.3], scale: [0.5, 1.05, 1.25] }}
        transition={{ duration: 4.4, ease: [0.22, 1, 0.36, 1], delay: 1.8 }}
      />

      {/* COMPOSITION LAYER — wordmark, central core, the arc of six */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 15,
          x: fieldX,
          y: fieldY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(1100px, 96vw)",
            height: "min(720px, 78svh)",
          }}
        >
          {/* Eyebrow — sits above the wordmark */}
          <motion.p
            style={{
              position: "absolute",
              left: "50%",
              top: "calc(50% - clamp(110px, 12vw, 170px))",
              transform: "translate(-50%, -50%)",
              fontSize: "clamp(10px, 0.85vw, 11px)",
              letterSpacing: "0.52em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 400,
              textAlign: "center",
              textShadow: ts,
              whiteSpace: "nowrap",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1.4 }}
          >
            {copy.eyebrow}
          </motion.p>

          {/* XNLAB wordmark — centred, dominant */}
          <motion.h1
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "clamp(86px, 16vw, 220px)",
              fontWeight: 400,
              letterSpacing: "-0.04em",
              lineHeight: 0.86,
              color: "white",
              textAlign: "center",
              textShadow: "0 2px 60px rgba(0,0,0,0.85)",
              margin: 0,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
          >
            XNLAB
          </motion.h1>

          {/* Central Core — the axis. Sits behind the wordmark, slightly
              offset down so it reads as the studio's centre of gravity. */}
          <motion.div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: -1,
              x: centralX,
              y: centralY,
              width: "clamp(140px, 18vw, 260px)",
              height: "clamp(140px, 18vw, 260px)",
              pointerEvents: "none",
              opacity: 0.85,
            }}
            initial={{ opacity: 0, scale: 0.6, filter: "blur(14px)" }}
            animate={{ opacity: 0.85, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
          >
            <Orb central size={260} />
          </motion.div>

          {/* The six World Cores — distributed along an arc above XNLAB */}
          {worlds.map((w, i) => {
            const angleDeg = arc[i] ?? 0;
            const rad = (angleDeg * Math.PI) / 180;
            // We position with calc() so the trig stays at render time.
            // x: center + radius * sin(angle); y: center - radius * cos(angle)
            const dx = `calc(${Math.sin(rad).toFixed(4)} * ${arcRadius})`;
            const dy = `calc(${(-Math.cos(rad)).toFixed(4)} * ${arcRadius})`;
            const isHover = hovered === w.slug;
            return (
              <motion.div
                key={w.slug}
                initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 1.8,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 1.9 + i * 0.12,
                }}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${dx})`,
                  top: `calc(50% + ${dy})`,
                  transform: "translate(-50%, -50%)",
                  width: orbSize,
                  height: orbSize,
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
                    textDecoration: "none",
                    color: "inherit",
                    outline: "none",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: isHover ? 1.18 : 1,
                      filter: isHover
                        ? `drop-shadow(0 0 22px ${w.color.glow})`
                        : "drop-shadow(0 0 0 transparent)",
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Orb world={w} size={140} />
                  </motion.div>

                  {/* Hover label — number, name and the colour identifier.
                      Positioned just below the orb. */}
                  <motion.div
                    aria-hidden
                    initial={false}
                    animate={{ opacity: isHover ? 1 : 0, y: isHover ? 0 : 6 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "calc(100% + 14px)",
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.34em",
                        textTransform: "uppercase",
                        color: w.color.hex,
                        fontWeight: 500,
                        textShadow: "0 1px 12px rgba(0,0,0,0.85)",
                      }}
                    >
                      {w.number} · {w.color.name}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        letterSpacing: "-0.005em",
                        color: "white",
                        fontWeight: 400,
                        textShadow: "0 1px 12px rgba(0,0,0,0.9)",
                      }}
                    >
                      {w.title[lang]}
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* HAZE — atmospheric ceiling */}
      <motion.div
        style={{ position: "absolute", inset: 0, zIndex: 26, pointerEvents: "none" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 5, delay: 1.4 }}
      >
        <Image
          src="/images/hero/02_haze_overlay.png"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          style={{
            objectFit: "cover",
            objectPosition: "center top",
            mixBlendMode: "screen",
            opacity: 0.07,
          }}
        />
      </motion.div>

      <Dust count={14} opacity={0.08} />

      {/* BOTTOM COPY — strapline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "clamp(56px,9vh,100px)",
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{ textAlign: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 2.6 }}
        >
          <p
            style={{
              fontSize: "clamp(11px,0.9vw,12px)",
              lineHeight: 1.85,
              color: "rgba(255,255,255,0.62)",
              fontWeight: 300,
              textShadow: tsS,
              letterSpacing: "0.02em",
              maxWidth: "80vw",
              margin: "0 auto",
            }}
          >
            {copy.s1} {copy.s2}
          </p>
          <p
            style={{
              fontSize: "clamp(11px,0.9vw,12px)",
              lineHeight: 1.85,
              color: "rgba(255,255,255,0.3)",
              fontWeight: 300,
              textShadow: ts,
              letterSpacing: "0.02em",
              marginTop: 4,
            }}
          >
            {copy.s3} {copy.s4}
          </p>
        </motion.div>
      </div>

      {/* Bottom fade into next section */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "18%",
          background: "linear-gradient(to bottom, transparent, #060606)",
          pointerEvents: "none",
        }}
      />
    </section>
  );
}
