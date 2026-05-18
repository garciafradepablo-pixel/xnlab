"use client";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ts, tsS, Dust } from "./atoms";
import { Orb } from "./orb";
import { worlds } from "./worlds";
import { AtelierStar } from "./ornaments";

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
const ORB_SIZE = "clamp(28px,4.4vw,68px)";
// dy in viewport-height units so the dome's gentle arc scales with the
// section height. Same numeric values as before (3.5%, 2%, 0.6%).
// Each orb carries its own depth profile. The constellation reads as an
// alveolus — a pocket of space with curvature — instead of a flat tiara
// of identical jewels. Outer orbs sit further back (lower opacity, smaller
// scale, deeper vertical drop). Inner orbs sit closer to the viewer
// (full opacity, full scale, almost at the apex of the arc).
const PLAN = [
  { idx: 0, mult: -3, dy: 4.6, delay: 1.55, op: 0.55, sc: 0.82 },
  { idx: 1, mult: -2, dy: 2.6, delay: 1.5,  op: 0.78, sc: 0.92 },
  { idx: 2, mult: -1, dy: 0.6, delay: 1.45, op: 1,    sc: 1    },
  { idx: 3, mult: 1,  dy: 0.6, delay: 1.45, op: 1,    sc: 1    },
  { idx: 4, mult: 2,  dy: 2.6, delay: 1.5,  op: 0.78, sc: 0.92 },
  { idx: 5, mult: 3,  dy: 4.6, delay: 1.55, op: 0.55, sc: 0.82 },
];
const UNIT = "clamp(40px,6vw,104px)";
const CENTRAL_SIZE = "clamp(34px,5.2vw,82px)";
// Dome top position: a single source of truth that scales with viewport
// height — header position on mobile (~100px from top), more centred
// on tall desktops (~260px). Without this, top:14% looked like a header
// on phones but left a huge empty gap above the wordmark on desktops.
const DOME_TOP = "clamp(140px, calc(35svh - 100px), 280px)";

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

  // Scroll-tied breath for the Atelier sigil that watermarks the hero.
  // As the visitor scrolls down through the first viewport, the sigil
  // compresses ~5% and dims slightly — the site is exhaling. As they
  // scroll back up, it expands again. Bound to the hero section ref so
  // it only animates while the sigil is on screen.
  const { scrollYProgress: heroScroll } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const sigilScale = useTransform(heroScroll, [0, 1], [1, 0.95]);
  const sigilOpacity = useTransform(heroScroll, [0, 0.8], [0.6, 0.18]);

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
        // 100svh on regular phones, capped at 880px on tall viewports
        // so the hero never grows past a comfortable luxury frame.
        height: "min(100svh, 880px)",
        minHeight: 560,
        overflow: "hidden",
        background: "#060402",
      }}
    >
      {/* LAYER 1 — backdrop.
          The hero background PNG ships with baked-in bokeh and glow
          spots that — once the orbs landed on top of it — created
          visible "halos" around each sphere. We hide most of those
          spots with a strong blur + low opacity + a heavy dark
          vignette mask. The result is a uniform warm-dark atmosphere
          (the original chrome aura around the wordmark area survives
          softly) without distinct light artifacts behind the orbs. */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.32 }}>
          <Image
            src="/images/hero/01_background_mobile.png"
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              filter: "blur(32px) saturate(0.85)",
            }}
          />
        </div>
        {/* Vignette mask — kills any residual baked-in highlight in
            the constellation zone (top third of the hero) where the
            orbs live. Concentrated darkness top, atmospheric warmth
            in the middle, fade-to-page-black at the bottom. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(4,3,2,0.92) 0%, rgba(4,3,2,0.7) 14%, rgba(4,3,2,0.35) 38%, rgba(4,3,2,0.55) 70%, rgba(6,4,2,1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, rgba(3,2,1,0.0) 0%, rgba(3,2,1,0.5) 75%, rgba(3,2,1,0.85) 100%)",
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
          top: "18%",
          transform: "translate(-50%, -50%)",
          zIndex: 4,
          width: "min(110vw, 1600px)",
          height: "clamp(360px, 38vh, 600px)",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(228,180,128,0.09) 0%, rgba(190,140,90,0.035) 35%, rgba(60,40,30,0.008) 58%, transparent 75%)",
          filter: "blur(64px)",
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
            "radial-gradient(ellipse at center, rgba(255,235,200,0.085) 0%, rgba(255,220,180,0.035) 38%, transparent 62%)",
          filter: "blur(70px)",
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
            "radial-gradient(ellipse at center, rgba(200,180,255,0.038) 0%, rgba(180,160,255,0.012) 40%, transparent 65%)",
          filter: "blur(80px)",
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
          width: "clamp(240px,38vw,460px)",
          height: "clamp(240px,38vw,460px)",
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
          sizes="(max-width: 768px) 60vw, 38vw"
          loading="eager"
          style={{ objectFit: "contain", mixBlendMode: "screen", opacity: 0.06 }}
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
          top: DOME_TOP,
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
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
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
                // Central Core keeps its full presence at all times.
                // On its own hover it lifts to 1.22. When a world is
                // hovered we do not dim or shrink it — the world orb
                // claims the protagonist position through scale and
                // glow, not by dimming the centre. Silence over
                // contrast.
                scale: centralHover ? 1.22 : 1,
                opacity: 1,
                y: [0, -4, 0],
              }}
              transition={{
                scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 7.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
              }}
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <Orb central size={260} />
            </motion.div>

            {/* Hover label — "Lab X" appears centred on the orb, over
                the X. A soft dark radial backdrop ensures the white
                type reads even when the underlying orb is bright. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              <motion.div
                animate={{ opacity: centralHover ? 1 : 0, scale: centralHover ? 1 : 0.92 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "relative", display: "inline-block" }}
              >
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: "-18% -16%",
                    background:
                      "radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 35%, transparent 70%)",
                    filter: "blur(3px)",
                    pointerEvents: "none",
                  }}
                />
                <p
                  style={{
                    position: "relative",
                    margin: 0,
                    fontSize: "clamp(10px, 0.8vw, 11.5px)",
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: "white",
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.35,
                    whiteSpace: "nowrap",
                    textShadow: "0 1px 14px rgba(0,0,0,0.95)",
                  }}
                >
                  Lab&nbsp;X
                </p>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* LAYER 2B2 — six World Cores arranged in the dome, all same size.
          Same split as the Central: static outer for left + top + centre
          translation, motion inner for parallax + entry animation.

          Dock magnification: when one orb is hovered, neighbours scale
          and brighten with a distance falloff (peak on the hovered
          orb, smaller on each step away, none at distance ≥ 3). No
          sibling dimming — Apple's Dock doesn't dim neighbours, it
          just enlarges them, and that reads as luxurious rather than
          stagey. */}
      {PLAN.map(({ idx, mult, dy, delay, op, sc }) => {
        const w = worlds[idx];
        const isHover = hovered === w.slug;
        // Strict isolation: only the hovered orb reacts. Even a tiny
        // boost on the neighbour reads as "two orbs grew at once" when
        // you hover one in the middle of the row (it has two
        // neighbours), so the gesture loses its singular focus.
        const dockBoost = isHover ? 1 : 0;
        const dimmed = centralHover;
        const side = mult < 0 ? "-" : "+";
        const dist = Math.abs(mult);
        const leftCalc = `calc(50% ${side} (${UNIT} * ${dist}))`;
        // Depth modulation. Outer orbs sit further back: lower opacity,
        // smaller scale, lower z-index so the inner ones overlap them on
        // hover. Creates the alveolus arc instead of a flat constellation.
        // When dock-boosted, lift the z-index so neighbours surface above
        // the dimmed background of the central or unrelated areas.
        const depthZ = 9 - Math.abs(mult) + (dockBoost > 0 ? 6 : 0);
        return (
          <div
            key={w.slug}
            style={{
              position: "absolute",
              zIndex: depthZ,
              left: leftCalc,
              top: `calc(${DOME_TOP} + ${dy}svh)`,
              width: ORB_SIZE,
              height: ORB_SIZE,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}
          >
            <motion.div
              style={{ x: sphX, y: sphY, width: "100%", height: "100%" }}
              initial={{ opacity: 0, scale: 0.82, filter: "blur(14px)" }}
              animate={{ opacity: op, scale: sc, filter: "blur(0px)" }}
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
                <motion.div
                  animate={{
                    // Hovered: +42%. Neighbour: +9%. Others: untouched.
                    scale: sc * (1 + dockBoost * 0.42),
                    opacity: dimmed
                      ? op * 0.45
                      : Math.min(1, op + (isHover ? 0.35 : 0)),
                    // Glow lives almost entirely on the hovered orb.
                    // The neighbour gets a whisper to acknowledge the
                    // gesture without competing for attention.
                    filter: isHover
                      ? `drop-shadow(0 0 28px ${w.color.glow}) drop-shadow(0 0 52px ${w.color.glow}) drop-shadow(0 0 14px rgba(255,255,255,0.35))`
                      : "none",
                    y: [0, -3, 0],
                  }}
                  transition={{
                    scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    filter: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 6.5 + idx * 0.4, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
                  }}
                  style={{ position: "relative", width: "100%", height: "100%", willChange: "transform, filter" }}
                >
                  <Orb world={w} size={120} />
                </motion.div>

                {/* Hover label — centred ON the orb, over the X. Same
                    soft dark radial backdrop as the Central Core so the
                    white type reads on every Core colour. The text
                    overflows the orb on long titles by design; dimmed
                    neighbours leave room. */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "clamp(140px, 16vw, 200px)",
                    pointerEvents: "none",
                  }}
                >
                  <motion.div
                    animate={{ opacity: isHover ? 1 : 0, scale: isHover ? 1 : 0.92 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: "relative" }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: "-18% -12%",
                        background:
                          "radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 35%, transparent 70%)",
                        filter: "blur(3px)",
                        pointerEvents: "none",
                      }}
                    />
                    <p
                      style={{
                        position: "relative",
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
                    </p>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          </div>
        );
      })}

      {/* LAYER 2D — Atelier sigil. The four-point star (the same symbol
          inside the XNLAB mark) is pinned to the lower third of the hero,
          aligned with the CTA height in the previous design so it reads
          as the signature beneath the wordmark, not as a watermark on it.
          zIndex 9 puts it above all background imagery and orbs but
          below the wordmark and CTAs (10/30). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 9,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pointerEvents: "none",
          paddingBottom: "clamp(60px, 11svh, 140px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 2.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            // Scroll-driven breath layered on top of the entry animation.
            // After mount the entry transition resolves to scale 1 /
            // opacity 0.6; from there these motion values take over and
            // bind continuous compression to scroll progress through
            // the hero. AtelierStar's internal infinite breath keeps
            // running underneath — the two combine to a living watermark.
            scale: sigilScale,
            opacity: sigilOpacity,
            willChange: "transform, opacity",
          }}
        >
          <AtelierStar
            size={72}
            color="rgba(232,183,131,0.85)"
            shadow="rgba(232,183,131,0.65)"
          />
        </motion.div>
      </div>

      {/* LAYER 3 — XNLAB wordmark. Pulled a touch above the visual centre
          on shorter viewports so it sits closer to the dome, removing the
          empty zone between them. Falls back to centred on tall screens. */}
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
          paddingBottom: "clamp(0px, 8svh, 80px)",
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
          transition={{ duration: 1.4, delay: 0.8 }}
        >
          {copy.eyebrow}
        </motion.p>
        <motion.h1
          style={{
            fontSize: "clamp(56px,9.6vw,138px)",
            fontWeight: 400,
            letterSpacing: "-0.045em",
            lineHeight: 0.88,
            color: "white",
            textAlign: "center",
            textShadow: "0 2px 60px rgba(0,0,0,0.85)",
          }}
          initial={{ opacity: 0, filter: "blur(22px)", scale: 1.04 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
        >
          XNLAB
          {/* SEO-only descriptive heading — invisible to sighted users
              (keeps the cinematic wordmark intact) but indexed by search
              engines and read by screen readers as the page's H1. */}
          <span className="sr-only">
            {lang === "en"
              ? " (also XN Lab, XN Studio, XNL, Xnlab Studio; pronounced X-N-Lab, sometimes heard as «x en la app») — Atmosphere systems for brands, customers and channels. Product, owned digital, retail and physical, customer operations, communication and community — the six surfaces where a modern brand reaches its customer. By appointment."
              : " (también XN Lab, XN Studio, XNL, Xnlab Studio; se pronuncia X-N-Lab, a veces se oye como «x en la app») — Sistemas de atmósfera para marcas, clientes y canales. Producto, digital propio, retail y físico, operaciones de cliente, comunicación y comunidad — las seis superficies por las que una marca moderna llega a su cliente. Solo con cita previa."}
          </span>
        </motion.h1>
      </div>

      {/* LAYER 2C — chrome X rising from below the hero edge.
          The symbol's vertical CENTRE sits BELOW the bottom of the
          hero (negative bottom offset), so only the top arc of the
          chrome X peeks above the page edge. Reads as a halo rising
          out of the next section rather than a foreground watermark.
          Clamp keeps it sensible across viewports. */}
      <motion.div
        style={{
          position: "absolute",
          zIndex: 7,
          x: symX,
          y: symY,
          left: "50%",
          bottom: "clamp(-110px, -8vh, -60px)",
          translateX: "-50%",
          translateY: "50%",
          width: "clamp(180px,32vw,420px)",
          height: "clamp(180px,32vw,420px)",
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
            sizes="(max-width: 768px) 260px, 420px"
            loading="eager"
            style={{
              objectFit: "contain",
              mixBlendMode: "screen",
              opacity: 0.55,
              filter: "drop-shadow(0 0 24px rgba(212,140,80,0.42))",
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

      {/* Bottom — strapline + scroll cue stacked in one column so they
          never collide on short viewports. Single flex container at the
          bottom of the hero, scroll cue follows the strapline below. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "clamp(20px,3vh,36px)",
          gap: "clamp(26px,3.6vh,44px)",
          pointerEvents: "none",
        }}
      >
        {/* Strapline — the lead phrase + small-caps dek. The two share
            the same max-width so they read as one block, and the gap
            between them and the dek's letter-spacing have been opened
            so the lines never feel pinched between the wordmark above
            and the CTA below. `text-wrap: balance` evens out line
            lengths so the dek does not wrap with a lone word at the
            end. */}
        <motion.div
          style={{
            textAlign: "center",
            padding: "0 clamp(20px,5vw,48px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "clamp(14px,1.8vw,22px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.95 }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "clamp(12px,1.05vw,14px)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.82)",
              fontWeight: 300,
              textShadow: tsS,
              letterSpacing: "0.005em",
              maxWidth: "min(620px, 90vw)",
              textWrap: "balance",
            }}
          >
            {copy.s1} {copy.s2}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "clamp(9px,0.78vw,10px)",
              lineHeight: 1.95,
              color: "rgba(255,255,255,0.48)",
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              textShadow: ts,
              maxWidth: "min(620px, 90vw)",
              textWrap: "balance",
            }}
          >
            {copy.s3} {copy.s4}
          </p>
          {/* Scarcity signal — quiet, real, anchored to the studio
              pulse tooltip. Premium minimalism, not a banner. Amber
              dot to align with the indicator above. */}
          <p
            style={{
              margin: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: "clamp(9px,0.78vw,10px)",
              lineHeight: 1,
              color: "rgba(232,183,131,0.78)",
              fontWeight: 500,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              textShadow: ts,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#e8b783",
                boxShadow: "0 0 8px rgba(232,183,131,0.55)",
                display: "inline-block",
              }}
            />
            {lang === "en"
              ? "5 of 6 engaged · One place remains"
              : "5 de 6 con encargo · Queda una plaza"}
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
          height: "10%",
          background: "linear-gradient(to bottom, transparent, #060606)",
          pointerEvents: "none",
        }}
      />
    </section>
  );
}
