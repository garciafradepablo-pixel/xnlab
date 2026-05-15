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

// Each World Core's place on the row. The horizontal step is constant
// (the unit gap is `clamp(80px,11vw,160px)`), so the gaps between
// neighbouring orbs are equal. The vertical offset describes a dome:
// the centre (chrome orb) sits at the top, and the further out a Core
// is, the lower it falls.
//
// Sizes shrink toward the edges to give a depth illusion — inner orbs
// feel "closer", outer orbs "further", like an aureole radiating from
// the central chrome orb.
//
// Each Core also gets its own entry vector so the composition does
// not assemble in one uniform fade: some pieces drift in from far
// (small + blurred), others rush in from close (large + blurred).
const PLAN = [
  { idx: 0, mult: -3, dy: "8%",   size: "clamp(52px,5.8vw,74px)", entry: { x: -160, y: 12,  scale: 0.32, blur: 22 }, delay: 2.05 },
  { idx: 1, mult: -2, dy: "4.5%", size: "clamp(62px,6.8vw,86px)", entry: { x: -40,  y: -52, scale: 1.55, blur: 20 }, delay: 1.85 },
  { idx: 2, mult: -1, dy: "1.5%", size: "clamp(72px,7.8vw,98px)", entry: { x: 30,   y: 60,  scale: 0.5,  blur: 14 }, delay: 1.65 },
  { idx: 3, mult: 1,  dy: "1.5%", size: "clamp(72px,7.8vw,98px)", entry: { x: -30,  y: -60, scale: 1.5,  blur: 16 }, delay: 1.75 },
  { idx: 4, mult: 2,  dy: "4.5%", size: "clamp(62px,6.8vw,86px)", entry: { x: 40,   y: 52,  scale: 0.45, blur: 14 }, delay: 1.95 },
  { idx: 5, mult: 3,  dy: "8%",   size: "clamp(52px,5.8vw,74px)", entry: { x: 160,  y: -12, scale: 0.3,  blur: 22 }, delay: 2.15 },
];
const UNIT = "clamp(80px,11vw,160px)"; // equal step between orbs

export function Hero({ lang, copy }: { lang: "en" | "es"; copy: HeroCopy }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  // Mouse parallax
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
        {/* Softer vignette and trimmed bottom fade — less heavy black margin */}
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

      {/* Warm aureole — a single radial halo centred where the chrome orb
          sits, unifying the seven orbs as one composition. */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "28%",
          transform: "translate(-50%, -50%)",
          zIndex: 4,
          width: "min(110vw, 1500px)",
          height: "clamp(360px, 40vh, 620px)",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(228,182,128,0.16) 0%, rgba(190,140,90,0.07) 35%, rgba(60,40,30,0.02) 65%, transparent 80%)",
          filter: "blur(30px)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3.6, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
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
        animate={{ opacity: [0, 1, 0.55], scale: [0.6, 1.1, 1.4] }}
        transition={{ duration: 3.6, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
      />
      {/* SHEEN bottom-left */}
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
            "radial-gradient(ellipse at center, rgba(200,180,255,0.06) 0%, rgba(180,160,255,0.02) 40%, transparent 70%)",
          filter: "blur(44px)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.7, 0.3], scale: [0.5, 1.0, 1.3] }}
        transition={{ duration: 3.6, ease: [0.22, 1, 0.36, 1], delay: 2.2 }}
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
          style={{ objectFit: "contain", mixBlendMode: "screen", opacity: 0.28 }}
        />
      </motion.div>

      {/* LAYER 2B — small chrome orb on top, dome apex */}
      <motion.div
        style={{
          position: "absolute",
          zIndex: 7,
          x: sphX,
          y: sphY,
          left: "50%",
          top: "28%",
          translateX: "-50%",
          translateY: "-50%",
          width: "clamp(78px,8.4vw,118px)",
          height: "clamp(78px,8.4vw,118px)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 0.55, filter: "blur(16px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
      >
        <motion.div
          style={{ width: "100%", height: "100%" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        >
          <Image
            src="/images/hero/04_main_orb.png"
            alt=""
            fill
            sizes="(max-width: 768px) 96px, 118px"
            loading="eager"
            style={{
              objectFit: "contain",
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 18px rgba(220,200,170,0.9)) drop-shadow(0 0 38px rgba(170,140,110,0.5))",
            }}
          />
        </motion.div>
      </motion.div>

      {/* LAYER 2B2 — the six World Cores, dome shape, equal gaps, mixed
          entry vectors so the composition assembles abstractly. */}
      {PLAN.map(({ idx, mult, dy, size, entry, delay }) => {
        const w = worlds[idx];
        const isHover = hovered === w.slug;
        const side = mult < 0 ? "-" : "+";
        const dist = Math.abs(mult);
        const leftCalc = `calc(50% ${side} (${UNIT} * ${dist}))`;
        return (
          <motion.div
            key={w.slug}
            style={{
              position: "absolute",
              zIndex: 8,
              x: sphX,
              y: sphY,
              left: leftCalc,
              top: `calc(28% + ${dy})`,
              translateX: "-50%",
              translateY: "-50%",
              width: size,
              height: size,
              pointerEvents: "auto",
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: entry.scale,
                x: entry.x,
                y: entry.y,
                filter: `blur(${entry.blur}px)`,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
              }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay }}
              style={{ width: "100%", height: "100%" }}
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
                {/* Per-Core ambient halo always present, brightened on hover */}
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
                  animate={{ opacity: isHover ? 0.95 : 0.35 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                  animate={{
                    scale: isHover ? 1.22 : 1,
                    y: [0, -3, 0],
                  }}
                  transition={{
                    scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 6.5 + idx * 0.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
                  }}
                  style={{ position: "relative", width: "100%", height: "100%" }}
                >
                  <Orb world={w} size={120} />
                </motion.div>

                {/* Persistent label — colour name above (eyebrow style),
                    world title below the orb. Always visible at low
                    opacity, lifted to full on hover. */}
                <motion.div
                  aria-hidden
                  animate={{ opacity: isHover ? 1 : 0.58 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "calc(100% + 8px)",
                    transform: "translateX(-50%)",
                    fontSize: "clamp(8px, 0.6vw, 10px)",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: w.color.hex,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    textShadow: "0 1px 12px rgba(0,0,0,0.85)",
                  }}
                >
                  {w.number} · {w.color.name}
                </motion.div>

                <motion.div
                  aria-hidden
                  animate={{ opacity: isHover ? 1 : 0.78, y: isHover ? -1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "calc(100% + 10px)",
                    transform: "translateX(-50%)",
                    fontSize: "clamp(10px, 0.78vw, 12.5px)",
                    letterSpacing: "-0.005em",
                    color: "white",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    textShadow: "0 1px 10px rgba(0,0,0,0.9)",
                  }}
                >
                  {w.title[lang]}
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
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
            textShadow: "0 2px 60px rgba(0,0,0,0.8)",
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
          zIndex: 9,
          x: symX,
          y: symY,
          left: "50%",
          top: "62%",
          translateX: "-50%",
          translateY: "-50%",
          width: "clamp(180px,32vw,380px)",
          height: "clamp(180px,32vw,380px)",
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
              opacity: 0.7,
              filter: "drop-shadow(0 0 18px rgba(180,150,120,0.5))",
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
          style={{ objectFit: "cover", objectPosition: "center top", mixBlendMode: "screen", opacity: 0.08 }}
        />
      </motion.div>

      <Dust count={14} opacity={0.09} />

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
              color: "rgba(255,255,255,0.28)",
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

      {/* Trimmed bottom fade — less heavy black */}
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
