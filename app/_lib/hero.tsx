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

// Six World Cores arranged in a dome above the wordmark. The central
// chrome orb at the apex is the studio's Central Core. Spacing between
// orbs is constant (one unit), vertical drop scales with distance from
// centre so the row reads as an arc. Sizes shrink outward; the centre
// is clearly the largest. Each Core arrives with its own entry vector
// for a 3D, abstract assembly.
// Seven orbs as one constellation. All six Cores carry the same visual
// weight (same size), and the Central Core is just barely larger — the
// only differentiator is a hair of scale and the subtle warm halo that
// already lives behind the wordmark. Less is more. Subtle arc only.
// Sizes and spacing scale with the viewport. The mins were chosen so the
// outermost orb (mult ±3) fits inside a 375px viewport with breathing
// room: 3·UNIT + ORB/2 must stay under half-viewport minus padding.
const ORB_SIZE = "clamp(36px,6.4vw,100px)";
const PLAN = [
  { idx: 0, mult: -3, dy: "3.5%", delay: 1.95 },
  { idx: 1, mult: -2, dy: "2%",   delay: 1.85 },
  { idx: 2, mult: -1, dy: "0.6%", delay: 1.75 },
  { idx: 3, mult: 1,  dy: "0.6%", delay: 1.8  },
  { idx: 4, mult: 2,  dy: "2%",   delay: 1.9  },
  { idx: 5, mult: 3,  dy: "3.5%", delay: 2.0  },
];
const UNIT = "clamp(50px,8.5vw,145px)";
const CENTRAL_SIZE = "clamp(44px,7.6vw,118px)";

export function Hero({ lang, copy }: { lang: "en" | "es"; copy: HeroCopy }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [centralHover, setCentralHover] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const sx = useSpring(rawX, { stiffness: 14, damping: 50 });
  const sy = useSpring(rawY, { stiffness: 14, damping: 50 });
  const orbX = useTransform(sx, [-1, 1], [-8, 8]);
  const orbY = useTransform(sy, [-1, 1], [-5, 5]);
  const sphX = useTransform(sx, [-1, 1], [-5, 5]);
  const sphY = useTransform(sy, [-1, 1], [-3, 3]);
  const symX = useTransform(sx, [-1, 1], [-12, 12]);
  const symY = useTransform(sy, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const fn = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      rawX.set(((e.clientX - left) / width - 0.5) * 2);
      rawY.set(((e.clientY - top) / height - 0.5) * 2);
    };
    el.addEventListener("mousemove", fn);
    return () => el.removeEventListener("mousemove", fn);
  }, [rawX, rawY, reduced]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        minHeight: 640,
        overflow: "hidden",
        background: "#060402",
      }}
    >
      {/* LAYER 1 — backdrop */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.62 }}>
          <Image
            src="/images/hero/01_background_desktop.png"
            alt=""
            fill
            sizes="100vw"
            className="opacity-0 sm:opacity-100"
            loading="eager"
            fetchPriority="high"
            style={{ objectFit: "cover", objectPosition: "center", transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1)" }}
          />
          <Image
            src="/images/hero/01_background_mobile.png"
            alt=""
            fill
            sizes="100vw"
            className="opacity-100 sm:opacity-0"
            loading="eager"
            fetchPriority="high"
            style={{ objectFit: "cover", objectPosition: "center", transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 42%, rgba(3,2,1,0.18) 0%, rgba(3,2,1,0.78) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(4,2,1,0.7) 0%, transparent 22%, transparent 70%, rgba(4,2,1,1) 100%)",
          }}
        />
      </div>

      {/* BLACK INTRO */}
      <motion.div
        style={{ position: "absolute", inset: 0, zIndex: 2, background: "#030201", pointerEvents: "none" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />

      {/* Warm aureole unifying the dome */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "30%",
          transform: "translate(-50%, -50%)",
          zIndex: 4,
          width: "min(110vw, 1600px)",
          height: "clamp(360px, 38vh, 600px)",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(228,180,128,0.11) 0%, rgba(190,140,90,0.045) 40%, rgba(60,40,30,0.012) 68%, transparent 82%)",
          filter: "blur(38px)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 4.2, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
      />

      {/* SHEEN top-right */}
      <motion.div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          zIndex: 4,
          width: "45vw",
          height: "45vw",
          pointerEvents: "none",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(255,235,200,0.1) 0%, rgba(255,220,180,0.05) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 0.55, 0.35], scale: [0.6, 1.1, 1.4] }}
        transition={{ duration: 4.2, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          zIndex: 4,
          width: "40vw",
          height: "40vw",
          pointerEvents: "none",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(200,180,255,0.045) 0%, rgba(180,160,255,0.015) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.4, 0.18], scale: [0.5, 1.0, 1.3] }}
        transition={{ duration: 4.2, ease: [0.22, 1, 0.36, 1], delay: 2.2 }}
      />

      {/* LAYER 2A — back orbits */}
      <motion.div
        style={{
          position: "absolute",
          zIndex: 3,
          x: orbX,
          y: orbY,
          left: "50%",
          top: "50%",
          translateX: "-50%",
          translateY: "-50%",
          width: "clamp(320px,55vw,680px)",
          height: "clamp(320px,55vw,680px)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 3.8, filter: "blur(32px)", rotate: -12 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <Image
          src="/images/hero/03_back_orbits.png"
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 55vw"
          loading="eager"
          style={{ objectFit: "contain", mixBlendMode: "screen", opacity: 0.16 }}
        />
      </motion.div>

      {/* LAYER 2B — Central Core, the dome's apex. A static wrapper holds
          the anchor + centring transform; the motion child carries the
          parallax. Mixing `x` motion values with `translate(-50%, -50%)`
          on the same element caused Framer to drop the centering, which
          shoved the orb to the right. Splitting them fixes that. */}
      <div
        style={{
          position: "absolute",
          zIndex: 8,
          left: "50%",
          top: "26%",
          width: CENTRAL_SIZE,
          height: CENTRAL_SIZE,
          transform: "translate(-50%, -50%)",
          pointerEvents: "auto",
        }}
      >
        <motion.div
          style={{ x: sphX, y: sphY, width: "100%", height: "100%" }}
          initial={{ opacity: 0, scale: 0.82, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 1.55 }}
        >
          <Link
            href="/worlds"
            aria-label={lang === "en" ? "The Universe" : "El Universo"}
            onMouseEnter={() => setCentralHover(true)}
            onMouseLeave={() => setCentralHover(false)}
            onFocus={() => setCentralHover(true)}
            onBlur={() => setCentralHover(false)}
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
                scale: centralHover ? 1.22 : 1,
                opacity: hovered !== null ? 0.45 : 1,
                y: [0, -4, 0],
              }}
              transition={{
                scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 7.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
              }}
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <Orb central size={260} />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* LAYER 2B2 — six World Cores arranged in the dome, all same size.
          Same split as the Central: static outer for left + top + centre
          translation, motion inner for parallax + entry animation. */}
      {PLAN.map(({ idx, mult, dy, delay }) => {
        const w = worlds[idx];
        const isHover = hovered === w.slug;
        const dimmed = (hovered !== null && hovered !== w.slug) || centralHover;
        const side = mult < 0 ? "-" : "+";
        const dist = Math.abs(mult);
        const leftCalc = `calc(50% ${side} (${UNIT} * ${dist}))`;
        return (
          <div
            key={w.slug}
            style={{
              position: "absolute",
              zIndex: 9,
              left: leftCalc,
              top: `calc(26% + ${dy})`,
              width: ORB_SIZE,
              height: ORB_SIZE,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}
          >
            <motion.div
              style={{ x: sphX, y: sphY, width: "100%", height: "100%" }}
              initial={{ opacity: 0, scale: 0.82, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay }}
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
                {/* Per-Core ambient halo */}
                <motion.div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: "-32%",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${w.color.glow} 0%, ${w.color.deep.replace(
                      ",1)",
                      ",0.04)"
                    )} 50%, transparent 75%)`,
                    filter: "blur(22px)",
                    pointerEvents: "none",
                  }}
                  animate={{ opacity: isHover ? 0.95 : dimmed ? 0.1 : 0.22 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  animate={{
                    scale: isHover ? 1.22 : 1,
                    opacity: dimmed ? 0.45 : 1,
                    y: [0, -3, 0],
                  }}
                  transition={{
                    scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 6.5 + idx * 0.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
                  }}
                  style={{ position: "relative", width: "100%", height: "100%" }}
                >
                  <Orb world={w} size={120} />
                </motion.div>

                {/* Hover label — ABOVE the orb, centred on it. Static
                    wrapper owns positioning + translateX(-50%); the inner
                    motion paragraph owns only opacity + y so framer's
                    transform never overwrites the centring. White, bold,
                    no number prefix — all six Cores read with the same
                    weight. */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "calc(100% + 14px)",
                    transform: "translateX(-50%)",
                    width: "clamp(140px, 16vw, 200px)",
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
            </motion.div>
          </div>
        );
      })}

      {/* LAYER 3 — XNLAB wordmark */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.p
          style={{
            fontSize: "clamp(10px,0.85vw,11px)",
            letterSpacing: "0.52em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            fontWeight: 400,
            textAlign: "center",
            textShadow: ts,
            marginBottom: "0.5em",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.2 }}
        >
          {copy.eyebrow}
        </motion.p>
        <motion.h1
          style={{
            fontSize: "clamp(88px,16vw,220px)",
            fontWeight: 400,
            letterSpacing: "-0.04em",
            lineHeight: 0.86,
            color: "white",
            textAlign: "center",
            textShadow: "0 2px 60px rgba(0,0,0,0.85)",
          }}
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
        >
          XNLAB
        </motion.h1>
      </div>

      {/* LAYER 2C — chrome X behind the wordmark */}
      <motion.div
        style={{
          position: "absolute",
          zIndex: 7,
          x: symX,
          y: symY,
          left: "50%",
          top: "62%",
          translateX: "-50%",
          translateY: "-50%",
          width: "clamp(140px,26vw,320px)",
          height: "clamp(140px,26vw,320px)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, filter: "blur(14px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
      >
        <motion.div
          style={{ width: "100%", height: "100%" }}
          animate={{ scale: [1, 1.01, 1], y: [0, -3, 0] }}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        >
          <Image
            src="/images/hero/05_main_bottom_symbol.png"
            alt=""
            fill
            sizes="(max-width: 768px) 220px, 380px"
            loading="eager"
            style={{
              objectFit: "contain",
              mixBlendMode: "screen",
              opacity: 0.18,
              filter: "drop-shadow(0 0 10px rgba(180,150,120,0.22))",
            }}
          />
        </motion.div>
      </motion.div>

      {/* HAZE */}
      <motion.div
        style={{ position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none" }}
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
          style={{ objectFit: "cover", objectPosition: "center top", mixBlendMode: "screen", opacity: 0.055 }}
        />
      </motion.div>

      <Dust count={10} opacity={0.07} />

      {/* Bottom copy */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "clamp(56px,9vh,96px)",
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
              color: "rgba(255,255,255,0.6)",
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

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "12%",
          background: "linear-gradient(to bottom, transparent, #060606)",
          pointerEvents: "none",
        }}
      />
    </section>
  );
}
