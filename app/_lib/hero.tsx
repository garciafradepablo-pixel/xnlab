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

// The hero keeps the original layered composition — backdrop, back orbits,
// the chrome X symbol behind XNLAB, the small chrome orb on top, the haze
// and dust. On top of that, six World Core orbs flank the central chrome
// orb: three to the left, three to the right. Each one is a button into
// its World detail page.
export function Hero({ lang, copy }: { lang: "en" | "es"; copy: HeroCopy }) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  // Mouse parallax — same gentle spring as the original
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

  // The six World Cores flanking the chrome orb. Index 0..2 sit on the
  // left, 3..5 on the right. `dx` is the absolute horizontal distance
  // from centre; the outer pair sits slightly higher than the inner so
  // the row reads as a subtle wing rather than a flat line.
  const flanks = [
    { idx: 0, side: -1, dx: "clamp(180px,26vw,360px)", dy: "-4%" }, // far left
    { idx: 1, side: -1, dx: "clamp(120px,18vw,240px)", dy: "-2%" }, // mid left
    { idx: 2, side: -1, dx: "clamp(72px,11vw,150px)",  dy: "0%"  }, // near left
    { idx: 3, side: 1,  dx: "clamp(72px,11vw,150px)",  dy: "0%"  }, // near right
    { idx: 4, side: 1,  dx: "clamp(120px,18vw,240px)", dy: "-2%" }, // mid right
    { idx: 5, side: 1,  dx: "clamp(180px,26vw,360px)", dy: "-4%" }, // far right
  ];

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
      {/* LAYER 1 — BACKDROP / CURTAIN */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
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
            background: "radial-gradient(ellipse at 50% 40%, rgba(3,2,1,0.3) 0%, rgba(3,2,1,0.92) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(4,2,1,0.85) 0%, transparent 25%, transparent 60%, rgba(4,2,1,1) 100%)",
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

      {/* SHEEN top-right */}
      <motion.div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          zIndex: 46,
          width: "45vw",
          height: "45vw",
          pointerEvents: "none",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(255,235,200,0.1) 0%, rgba(255,220,180,0.05) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 1.4] }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
      />
      {/* SHEEN bottom-left */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          zIndex: 46,
          width: "40vw",
          height: "40vw",
          pointerEvents: "none",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(200,180,255,0.06) 0%, rgba(180,160,255,0.02) 40%, transparent 70%)",
          filter: "blur(44px)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.0, 1.3] }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 2.4 }}
      />

      {/* LAYER 2A — ORBITS / FIELD — large but quiet, behind everything */}
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

      {/* LAYER 2B — small chrome orb on top, the anchor of the upper row */}
      <motion.div
        style={{
          position: "absolute",
          zIndex: 6,
          x: sphX,
          y: sphY,
          left: "50%",
          top: "28%",
          translateX: "-50%",
          translateY: "-50%",
          width: "clamp(70px,8vw,110px)",
          height: "clamp(70px,8vw,110px)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scale: 0.6, filter: "blur(14px)" }}
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
            sizes="(max-width: 768px) 90px, 110px"
            loading="eager"
            style={{
              objectFit: "contain",
              mixBlendMode: "screen",
              filter: "drop-shadow(0 0 16px rgba(200,180,160,0.95)) drop-shadow(0 0 32px rgba(160,130,110,0.5))",
            }}
          />
        </motion.div>
      </motion.div>

      {/* LAYER 2B2 — six World Cores flanking the chrome orb, three each side */}
      {flanks.map(({ idx, side, dx, dy }, i) => {
        const w = worlds[idx];
        const isHover = hovered === w.slug;
        return (
          <motion.div
            key={w.slug}
            style={{
              position: "absolute",
              zIndex: 7,
              x: sphX,
              y: sphY,
              left: `calc(50% ${side === -1 ? "-" : "+"} ${dx})`,
              top: `calc(28% + ${dy})`,
              translateX: "-50%",
              translateY: "-50%",
              width: "clamp(58px,6.6vw,92px)",
              height: "clamp(58px,6.6vw,92px)",
              pointerEvents: "auto",
            }}
            initial={{ opacity: 0, scale: 0.55, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 1.8 + i * 0.1 }}
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
                  scale: isHover ? 1.22 : 1,
                  y: [0, -3, 0],
                  filter: isHover
                    ? `drop-shadow(0 0 18px ${w.color.glow})`
                    : "drop-shadow(0 0 0 transparent)",
                }}
                transition={{
                  scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  filter: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 7 + i * 0.3, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
                }}
                style={{ width: "100%", height: "100%" }}
              >
                <Orb world={w} size={92} />
              </motion.div>

              {/* Hover label — number, colour, title. Sits below the orb. */}
              <motion.div
                aria-hidden
                initial={false}
                animate={{ opacity: isHover ? 1 : 0, y: isHover ? 0 : 6 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "calc(100% + 12px)",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
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
                    marginTop: 3,
                    fontSize: 12,
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

      {/* LAYER 3 — XNLAB WORDMARK / AUTHORITY — centre, dominant */}
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

      {/* LAYER 2C — chrome X / identity anchor — lower, behind wordmark */}
      <motion.div
        style={{
          position: "absolute",
          zIndex: 8,
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

      {/* HAZE — atmospheric ceiling */}
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

      {/* BOTTOM COPY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "clamp(80px,12vh,120px)",
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{ textAlign: "center" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 2.0 }}
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
