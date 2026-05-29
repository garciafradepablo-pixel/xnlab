"use client";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, useInView, useScroll } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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
const ORB_SIZE = "clamp(40px,6vw,96px)";
// dy in viewport-height units so the dome's gentle arc scales with the
// section height. Same numeric values as before (3.5%, 2%, 0.6%).
// Each orb carries its own depth profile. The constellation reads as an
// alveolus — a pocket of space with curvature — instead of a flat tiara
// of identical jewels. Outer orbs sit further back (lower opacity, smaller
// scale, deeper vertical drop). Inner orbs sit closer to the viewer
// (full opacity, full scale, almost at the apex of the arc).
// Equalized constellation — every surface a brand reaches its
// customer through carries the same visual weight. The arc is still
// present (the centre is the Central Core, the outers drop slightly)
// but the depth gradient has been flattened so no surface reads as
// "secondary". Six rooms, equal citizens.
//
//   op: 0.94 → 1 → 1 → 0.94 instead of 0.55 → 1 → 0.55
//   sc: 0.94 → 1 → 1 → 0.94 instead of 0.82 → 1 → 0.82
//   dy: outer drop softened so the dome is a gentle smile, not an
//       alveolus pocket — keeps the spatial arrangement, removes
//       the hierarchy.
// ─────────────────────────────────────────────────────────────────
// MASTER ENTRY ORCHESTRATION
//
// One curve across the entire piece: [0.22, 1, 0.36, 1] (expo-out,
// the luxury deceleration). One signature effect — the wordmark's
// subtle blur-in — and everything else fades in via opacity only.
//
// The temptation in motion design is to give every element its own
// flourish: blur here, scale there, a stagger, a sequence. The cost
// of that maximalism is the "Pinterest tutorial" feel — six effects
// reading as one cheap event. Premium reads as restraint. Here:
//
//   0.0 → 0.6s    Veil clears (black intro)
//   0.4 → 1.6s    Atmospherics ignite (warm aureole, copper halo)
//                 subtle scale 0.92→1, opacity 0→target — these two
//                 are the stage lights coming up together
//   0.6 → 1.8s    Background composition appears
//                 chrome X (sculpture), back orbits (trace) —
//                 pure opacity, no blur, no scale, no rotate
//   0.7 → 1.9s    Dome appears
//                 Central Core + six world orbs — pure opacity,
//                 same delay across all seven so the dome reads as
//                 ONE composed shape, not seven popcorn arrivals
//   0.8 → 2.4s    Wordmark — single signature blur(14px→0) + opacity
//   1.6 → 2.6s    Eyebrow + strapline + scarcity — opacity
//   0.9 → 2.9s    Haze — long quiet fade underneath everything
//
// After ~2.9s the page is at rest. Idle life continues from a small
// set of intentional sources: chrome X breath (11s), Central Core
// y-float (8.5s), each world orb y-float (5.5–8.2s, idx-staggered),
// back-orbits 180s rotation, and the AmbientBackdrop heartbeat (11s,
// delegated to the layout layer). Nothing else moves — restraint.
// ─────────────────────────────────────────────────────────────────

// All six world orbs share the same entry delay as the Central Core
// (0.7). The seven elements of the dome appear together as a single
// composed shape — no centre-out stagger, no theatrical sequencing.
// Premium reads as "the dome was already there, the light came on";
// staggered popcorn reads as "look at me animating each thing."
// The depth modulation (op, sc, dy) still produces the alveolus arc
// at rest — that's a spatial property of the constellation, not a
// timing one. Six rooms, equal citizens, equal entrance.
// Atmospheric perspective. The constellation is a crescent receding into
// depth, not a flat row of equal jewels: the outer Cores sit further back
// (smaller, dimmer, softly out of focus, dropped lower) while the inner
// pair sit forward of the picture plane (larger, sharp, full colour). The
// `blur` value is depth-of-field — it is cleared the instant a Core is
// hovered so the visitor pulls it into focus.
const PLAN = [
  { idx: 0, mult: -3, dy: 4.8, delay: 0.7, op: 0.66, sc: 0.72, blur: 1.7 },
  { idx: 1, mult: -2, dy: 2.5, delay: 0.7, op: 0.84, sc: 0.87, blur: 0.7 },
  { idx: 2, mult: -1, dy: 0.6, delay: 0.7, op: 1,    sc: 1.07, blur: 0   },
  { idx: 3, mult: 1,  dy: 0.6, delay: 0.7, op: 1,    sc: 1.07, blur: 0   },
  { idx: 4, mult: 2,  dy: 2.5, delay: 0.7, op: 0.84, sc: 0.87, blur: 0.7 },
  { idx: 5, mult: 3,  dy: 4.8, delay: 0.7, op: 0.66, sc: 0.72, blur: 1.7 },
];
const UNIT = "clamp(44px,7vw,130px)";
const CENTRAL_SIZE = "clamp(42px,6.5vw,108px)";
// Dome top position: a single source of truth that scales with viewport
// height — header position on mobile (~100px from top), more centred
// on tall desktops (~260px). Without this, top:14% looked like a header
// on phones but left a huge empty gap above the wordmark on desktops.
const DOME_TOP = "clamp(168px, calc(40svh - 40px), 320px)";

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

  // Pause the heaviest continuous animations (the back-orbits and
  // chrome X linear rotations on large images) when the hero leaves
  // the viewport. The breath loops on small gradient divs are cheap
  // enough to leave running; the two rotations are the expensive
  // ones — large DOM nodes carrying a Next/Image, repainted every
  // frame. Skipping their rAF callbacks while the visitor is reading
  // sections further down the page cuts the steady-state CPU/GPU
  // cost meaningfully. The state is preserved on return via
  // framer-motion's animate={false} freeze pattern.
  const inView = useInView(ref, { amount: 0.15 });

  // Star / cosmic-dust field. A single 1px node carries the whole field
  // as one box-shadow list (N stars, zero extra DOM, painted once), so it
  // fills the negative space with depth for free. Positions/tints come
  // from a seeded PRNG so SSR and client render the identical string —
  // no hydration mismatch, no Math.random-at-render. A few stars take a
  // jewel tint (gold / cyan / violet / rose) to echo the world palette
  // rather than a flat white speckle.
  const starShadow = useMemo(() => {
    let s = 0x9e3779b1;
    const rnd = () => {
      s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const tints = [
      "255,247,232", // warm white
      "255,247,232",
      "255,247,232",
      "255,206,138", // gold
      "150,214,224", // cyan
      "196,160,236", // violet
      "244,168,176", // rose
    ];
    const out: string[] = [];
    for (let i = 0; i < 78; i++) {
      const x = (rnd() * 100).toFixed(2);
      const y = (rnd() * 100).toFixed(2);
      const b = (0.18 + rnd() * 0.62).toFixed(2);
      const spread = rnd() > 0.82 ? "0.6px" : rnd() > 0.5 ? "0.3px" : "0";
      const tint = tints[Math.floor(rnd() * tints.length)];
      out.push(`${x}vw ${y}vh 0 ${spread} rgba(${tint},${b})`);
    }
    return out.join(", ");
  }, []);

  // Scroll-linked parallax. framer batches reads to rAF and writes pure
  // GPU transforms/opacity (no layout, no paint of large surfaces), so the
  // exit stays cheap even on mobile. As the hero scrolls away each plane
  // travels at its own rate — wordmark drifts down and dissolves, the
  // sculpture sinks slower and swells, the dome lifts and the nebula
  // trails — which is what gives the composition real Z-depth instead of
  // a flat picture sliding off. Reduced-motion users get static values.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sp = (input: number[], output: number[]) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(scrollYProgress, input, output);
  const nebulaY = sp([0, 1], reduced ? [0, 0] : [0, -90]);
  const nebulaScale = sp([0, 1], reduced ? [1, 1] : [1, 1.14]);
  const domeY = sp([0, 1], reduced ? [0, 0] : [0, -64]);
  const xY = sp([0, 1], reduced ? [0, 0] : [0, 120]);
  const xScroB = sp([0, 1], reduced ? [1, 1] : [1, 1.08]);
  const wordY = sp([0, 1], reduced ? [0, 0] : [0, 150]);
  const wordOpacity = sp([0, 0.72], reduced ? [1, 1] : [1, 0]);
  const bottomOpacity = sp([0, 0.5], reduced ? [1, 1] : [1, 0]);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    // Desktop only — touch and small viewports never see the parallax
    // effect cleanly anyway, and they pay the full cost of mousemove
    // firing at ~60Hz driving six useTransform chains. Gating to a
    // fine-pointer + ≥1024px viewport keeps the CPU/main-thread cost
    // off mobile entirely.
    const matchesDesktop = () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    if (!matchesDesktop()) return;
    // rAF throttle — mousemove fires per pixel; the spring only needs
    // one update per frame. Coalescing to rAF cuts the handler's effective
    // rate to the display's refresh, eliminating redundant spring updates.
    let pending = false;
    let lastEvent: MouseEvent | null = null;
    const fn = (e: MouseEvent) => {
      lastEvent = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (!lastEvent) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        rawX.set(((lastEvent.clientX - left) / width - 0.5) * 2);
        rawY.set(((lastEvent.clientY - top) / height - 0.5) * 2);
      });
    };
    el.addEventListener("mousemove", fn, { passive: true });
    return () => el.removeEventListener("mousemove", fn);
  }, [rawX, rawY, reduced]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        // 100svh on regular phones and most desktops; capped at 1100px
        // on very tall viewports (≥1440 high) so the hero stays
        // cinematic at 4K / ultrawide without losing its proportion
        // on smaller screens.
        height: "min(100svh, 1100px)",
        minHeight: 560,
        overflow: "hidden",
        // Warm-neutral near-black instead of the old brown-black (#060402).
        // Keeps a breath of warmth without the muddy cast that read as
        // "mediocre brown" once the washes stacked on top of it.
        background: "#070605",
        // CRITICAL: isolate the hero's stacking context so the
        // mix-blend-mode: screen layers inside (chrome X, back orbits,
        // haze) only compose against the hero's own contents — never
        // against the AmbientBackdrop's fixed-position layers below.
        //
        // Without this, scrolling produces visible "calado" (bleed):
        // the hero translates while the fixed AmbientBackdrop layers
        // don't, so the screen-blend math hits a different pixel
        // every frame and the symbols appear to seep through their
        // background. Isolation pins each blend to a stable partner.
        isolation: "isolate",
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
        <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
          <Image
            src="/images/hero/01_background_mobile.png"
            alt=""
            fill
            sizes="100vw"
            // Eager, but NOT fetchPriority high — the chrome X (LAYER
            // 2C) is the page's LCP and should win the priority queue.
            // This image renders behind a 28px blur, so quality is
            // dropped to 45 — invisible loss after the blur, 40-50%
            // payload savings on the AVIF/WebP variant.
            loading="eager"
            quality={45}
            style={{
              objectFit: "cover",
              objectPosition: "center",
              // Pull the saturation down further: the baked-in bokeh of this
              // PNG is what carried most of the muddy brown. Desaturating it
              // lets the clean champagne washes above set the hue instead.
              filter: "blur(28px) saturate(0.62)",
            }}
          />
        </div>
        {/* Vignette mask — the first 14% used to sit at 82% black,
            which read as "the page didn't load" when the visitor
            scrolled back to the top. Top stops lifted so the chrome
            aura survives from the first pixel; mid stays open, bottom
            fade still carries the eye into the next section. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(4,3,2,0.42) 0%, rgba(4,3,2,0.28) 14%, rgba(4,3,2,0.18) 38%, rgba(4,3,2,0.5) 70%, rgba(6,4,2,1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 92% 88% at 50% 46%, rgba(3,2,1,0.0) 0%, rgba(3,2,1,0.1) 48%, rgba(3,2,1,0.52) 80%, rgba(2,1,1,0.9) 100%)",
          }}
        />
      </div>

      {/* BLACK INTRO — kept short so the first frame the visitor sees
          is already content, not a black wash. 0.6s fade is enough to
          give the cinematic veil without delaying the wordmark. */}
      <motion.div
        style={{ position: "absolute", inset: 0, zIndex: 2, background: "#030201", pointerEvents: "none" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0 }}
      />

      {/* NEBULA — saturated cosmic colour field. Several large jewel-tone
          radials (brand gold + violet + sea-teal + copper-rose, the
          studio's own world palette) drift, breathe and counter-rotate on
          long out-of-phase loops, screen-blended so they read as coloured
          light suspended in space — depth through HUE, not just value.
          This is the single biggest cure for "flat": the dark stops being
          one brown plane and becomes a graded, living atmosphere. */}
      <motion.div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", y: nebulaY, scale: nebulaScale, willChange: "transform" }}
      >
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-12%",
          pointerEvents: "none",
          mixBlendMode: "screen",
          background: [
            // ASYMMETRIC BALANCE — one dominant warm bloom off the
            // upper-left axis, answered by smaller cooler masses on the
            // opposite diagonal. The classic painter's triangle: a big
            // warm protagonist, a medium cool counterweight, a small
            // accent — never a mirror. Opacities are pushed hard so the
            // dark reads as a SATURATED nebula, not a tea stain.
            // DUALITY — warm hemisphere LEFT (the brand, premium in
            // person) vs cool hemisphere RIGHT (the customer, premium on
            // every screen). The chrome X sits on the meeting line: "the
            // atmosphere between them is the work." Centre stays calm for
            // the wordmark.
            "radial-gradient(ellipse 58% 60% at 13% 30%, rgba(255,176,88,0.46) 0%, rgba(255,138,66,0.13) 33%, transparent 62%)",
            "radial-gradient(ellipse 44% 48% at 7% 66%, rgba(238,140,84,0.26) 0%, transparent 60%)",
            "radial-gradient(ellipse 42% 44% at 30% 88%, rgba(242,120,92,0.2) 0%, transparent 58%)",
            "radial-gradient(ellipse 52% 56% at 87% 28%, rgba(152,96,228,0.34) 0%, transparent 60%)",
            "radial-gradient(ellipse 48% 52% at 94% 62%, rgba(60,152,214,0.3) 0%, transparent 60%)",
            "radial-gradient(ellipse 44% 46% at 74% 90%, rgba(72,112,232,0.2) 0%, transparent 58%)",
          ].join(", "),
          willChange: "transform, opacity",
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={
          reduced || !inView
            ? { opacity: 0.95, scale: 1 }
            : { opacity: [0.78, 1, 0.78], scale: [1, 1.08, 1], x: [0, 22, -14, 0], y: [0, -16, 12, 0] }
        }
        transition={
          reduced
            ? { duration: 1.4, delay: 0.5 }
            : { duration: 28, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.5 }
        }
      />
      </motion.div>

      {/* STAR / COSMIC-DUST FIELD — fills the negative space with depth.
          One node, one box-shadow list; drifts and twinkles on a long
          loop, screen-blended, paused off-screen. The jewel-tinted stars
          tie the empty dark into the same palette as the orbs. */}
      <motion.div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", mixBlendMode: "screen", willChange: "transform, opacity" }}
        initial={{ opacity: 0 }}
        animate={inView && !reduced ? { opacity: [0.72, 1, 0.72], x: [0, -16, 0], y: [0, 12, 0] } : { opacity: 0.85 }}
        transition={reduced ? { duration: 1.6, delay: 0.9 } : { duration: 38, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.9 }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 1, height: 1, borderRadius: "50%", backgroundColor: "transparent", boxShadow: starShadow }} />
      </motion.div>

      {/* LIGHT SHAFTS — volumetric god-rays projected from the optical
          centre. A slow conic sweep of faint gold sectors, masked to a
          soft disc with a hollow core and screen-blended, rotating on a
          long loop so the light feels cast by an unseen source above the
          sculpture. Concentric with the chrome X / copper halo (same Y
          offset) so the rays emanate from behind the wordmark. */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "clamp(600px, 98vw, 1500px)",
          height: "clamp(600px, 98vw, 1500px)",
          transform: "translate(-50%, calc(-50% + clamp(40px, 8svh, 90px)))",
          zIndex: 4,
          pointerEvents: "none",
          mixBlendMode: "screen",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,198,132,0.11) 11deg, transparent 28deg, transparent 58deg, rgba(255,182,120,0.07) 72deg, transparent 92deg, transparent 146deg, rgba(255,204,142,0.10) 165deg, transparent 190deg, transparent 250deg, rgba(255,186,122,0.07) 266deg, transparent 294deg, transparent 318deg, rgba(255,196,130,0.08) 332deg, transparent 352deg, transparent 360deg)",
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent 6%, #000 22%, rgba(0,0,0,0.55) 40%, transparent 66%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent 6%, #000 22%, rgba(0,0,0,0.55) 40%, transparent 66%)",
          willChange: "transform, opacity",
        }}
        initial={{ opacity: 0, rotate: 0 }}
        animate={inView && !reduced ? { opacity: 0.9, rotate: 360 } : { opacity: 0.85, rotate: 0 }}
        transition={{
          opacity: { duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
          rotate: { duration: 120, ease: "linear", repeat: Infinity },
        }}
      />

      {/* Warm aureole unifying the dome — Movement II of the master
          timeline. Enters with a single graceful expansion to a stable
          atmospheric backdrop. The independent breath loop that lived
          here previously fought the AmbientBackdrop's own heartbeat
          and the chrome X's breath, producing the "spit out in cells"
          effect. The stage is now still; the protagonists breathe. */}
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
            "radial-gradient(ellipse at center, rgba(255,202,132,0.26) 0%, rgba(244,176,112,0.09) 36%, rgba(180,120,70,0.02) 56%, transparent 74%)",
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.95, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      />

      {/* LAYER 2A — back orbits. Static outer wrapper does the
          centering transform so the orbital image stays anchored to
          the hero centre; the motion child carries the parallax
          x/y and the cinematic entry transform. Mixing motion `x` with
          `translateX: "-50%"` on the same node was pulling the orbit
          off-centre relative to the wordmark. */}
      <div
        style={{
          position: "absolute",
          zIndex: 3,
          left: "50%",
          top: "50%",
          width: "clamp(240px,38vw,460px)",
          height: "clamp(240px,38vw,460px)",
          // Concentric with the chrome X and the copper halo — same Y
          // offset — so the orbital trace actually orbits the X's
          // optical centre instead of the viewport centre. Without this
          // the X sat ~70px below the centre of its own orbital ring,
          // reading as "off-centre" even though every element shares
          // the same horizontal centre.
          transform: "translate(-50%, calc(-50% + clamp(40px, 8svh, 90px)))",
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{ position: "relative", x: orbX, y: orbY, width: "100%", height: "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Pure opacity. The previous scale 3.8 → 1 + blur 32 → 0 +
          // rotate -12 → 0 entry was three theatrical effects stacked
          // on a 9%-opacity backdrop trace — the most expensive
          // possible entrance for the least visible element. Now: a
          // quiet fade. The 180s rotation that runs after entry is
          // the trace's actual life; the entrance just unmutes it.
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          {/* Continuous slow rotation on the orbital trace — 180s per
              revolution. Imperceptible per-frame, but over a 5-second
              dwell the eye reads "the field is alive" without ever
              catching motion in the act. The opacity is also lifted
              slightly so the trace contributes to atmosphere, not
              just decoration. */}
          <motion.div
            style={{ position: "relative", width: "100%", height: "100%", willChange: "transform" }}
            animate={inView ? { rotate: 360 } : false}
            transition={{ duration: 180, ease: "linear", repeat: Infinity }}
          >
            <Image
              src="/images/hero/03_back_orbits.png"
              alt=""
              fill
              sizes="(max-width: 768px) 60vw, 38vw"
              // Screen-blend at 9% opacity, rotating continuously.
              // Quality 50 saves payload without visible loss.
              loading="lazy"
              quality={50}
              style={{ objectFit: "contain", mixBlendMode: "screen", opacity: 0.18 }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* LAYER 2B — Central Core, the dome's apex. A static wrapper holds
          the anchor + centring transform; the motion child carries the
          parallax. Mixing `x` motion values with `translate(-50%, -50%)`
          on the same element caused Framer to drop the centering, which
          shoved the orb to the right. Splitting them fixes that.
          zIndex 11: above the chrome X (6) so the dome is always read
          in front of the sculpture, never behind or pierced by it. */}
      <div
        style={{
          position: "absolute",
          zIndex: 11,
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Pure opacity. Central Core + the six world orbs share the
          // SAME delay (0.7) so the dome reads as one composed shape,
          // not seven sequential pops. The previous scale 0.82 + blur
          // 14 entry made each orb assert itself — exactly the
          // "popcorn" effect the user objected to.
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
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
              borderRadius: "50%",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <motion.div
              animate={{
                // Central Core keeps its full presence at all times.
                // On its own hover it lifts to 1.22. When a world is
                // hovered we do not dim or shrink it — the world orb
                // claims the protagonist position through scale and
                // glow, not by dimming the centre. Silence over
                // contrast. Breath is wider than the satellites so
                // the centre feels heavier and more anchored.
                scale: centralHover ? 1.22 : 1,
                opacity: 1,
                y: [0, -7, 0],
              }}
              transition={{
                scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 8.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
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
      {PLAN.map(({ idx, mult, dy, delay, op, sc, blur }) => {
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
        // depthZ floor bumped to 11 so even the outermost orbs (mult ±3,
        // depthZ = 11 - 3 = 8) sit ABOVE the chrome X (zIndex 6). The
        // previous floor of 9 left mult ±3 at zIndex 6 and mult ±2 at
        // zIndex 7, both below or equal to the chrome X — which is why
        // "la estrella pasa por delante de las esferas." Outer-to-inner
        // depth ranking preserved: 11→10→9→8 for ±0→±3.
        const depthZ = 11 - Math.abs(mult) + (dockBoost > 0 ? 6 : 0);
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
            <motion.div style={{ y: domeY, position: "relative", width: "100%", height: "100%" }}>
            {/* Colour pocket — a soft pool of THIS Core's own light bled
                into the surrounding atmosphere and screen-blended, so the
                sphere reads as embedded in a lit volume of space rather
                than pasted onto it. Brighter/larger for the near Cores,
                fainter for those receding into depth. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "-78%",
                borderRadius: "50%",
                background: `radial-gradient(circle at 50% 42%, ${w.color.hex} 0%, ${w.color.glow} 30%, transparent 62%)`,
                mixBlendMode: "screen",
                filter: "blur(15px)",
                opacity: op * (0.7 + 0.6 * (1 - dist / 3)),
                pointerEvents: "none",
              }}
            />
            <motion.div
              style={{ x: sphX, y: sphY, width: "100%", height: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: op }}
              // Pure opacity. All six orbs share the Central Core's
              // delay (0.7) — the dome appears as ONE shape, not as
              // a sequence of six entries. The depth properties (op,
              // sc, dy) shape the constellation spatially at rest;
              // they no longer animate from a smaller/blurrier start.
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay }}
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
                  borderRadius: "50%",
                  WebkitTapHighlightColor: "transparent",
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
                      ? `drop-shadow(0 0 30px ${w.color.glow}) drop-shadow(0 0 58px ${w.color.glow}) drop-shadow(0 0 16px rgba(255,255,255,0.42))`
                      : blur
                      ? `blur(${blur}px) saturate(0.9) brightness(0.95)`
                      : "none",
                    y: [0, -6, 0],
                  }}
                  transition={{
                    scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                    filter: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 5.5 + idx * 0.45, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
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
            </motion.div>
          </div>
        );
      })}

      {/* LAYER 3 — XNLAB wordmark. Pulled a touch above the visual centre
          on shorter viewports so it sits closer to the dome, removing the
          empty zone between them. Falls back to centred on tall screens.
          Carries the scroll-parallax: drifts down and dissolves as the
          hero leaves, so the brand mark hands off to the page below
          instead of scrolling away rigidly. */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          // zIndex 12 — above the entire dome stack (orbs go to 11)
          // so the wordmark always reads as the dominant element. The
          // dome and the wordmark don't visually overlap (dome lives
          // up top, wordmark at the optical centre), but if they ever
          // did the wordmark would win — which is the correct
          // hierarchy for the brand mark.
          zIndex: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          // Responsive vertical placement WITHOUT a media query (Tailwind
          // v4 / Lightning CSS was dropping the @media class rule). The
          // `(640px - 100vw)` term is positive only below a 640px viewport,
          // so on phones the mark block drops clear of the lowered orb dome
          // (no more eyebrow/dome collision); on desktop both terms resolve
          // to the original raise. Pure inline calc — never touched by the
          // CSS pipeline.
          paddingTop: "max(0px, calc((640px - 100vw) * 0.12))",
          paddingBottom: "clamp(0px, calc((100vw - 560px) * 0.05), 20px)",
          y: wordY,
          opacity: wordOpacity,
          willChange: "transform, opacity",
        }}
      >
        <motion.p
          style={{
            fontSize: "clamp(10px,0.85vw,11px)",
            // Letter-spacing tightens on mobile so the long ES eyebrow
            // ("Estudio de atmósfera de marca · MMXXII") doesn't outrun
            // a 390px viewport. Caps at 0.52em on desktop where the
            // editorial dateline reads as intended.
            letterSpacing: "clamp(0.22em, 1.4vw, 0.52em)",
            // Match the trailing letter-spacing so the line reads as
            // optically centred under the wordmark (without this the
            // last glyph's right margin pushes the line off-centre).
            paddingLeft: "clamp(0.22em, 1.4vw, 0.52em)",
            // Without an explicit max-width the flex-column parent sizes
            // this paragraph to its max-content (one long line) and lets
            // it overflow the viewport on mobile. Capping it forces a
            // clean wrap; balance keeps the two lines even.
            maxWidth: "92vw",
            textWrap: "balance",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            fontWeight: 400,
            textAlign: "center",
            textShadow: ts,
            marginBottom: "0.5em",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Eyebrow lands a beat after the wordmark begins resolving
          // out of its blur. Pure opacity — same restraint as the
          // rest of the composition.
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 1.4 }}
        >
          {copy.eyebrow}
        </motion.p>
        <motion.h1
          style={{
            fontSize: "clamp(64px,11vw,184px)",
            fontWeight: 400,
            letterSpacing: "-0.05em",
            lineHeight: 0.86,
            color: "white",
            textAlign: "center",
            // Warm rim + deep drop: the wordmark sits inside the gold
            // light pool, so it carries a faint champagne halo as well as
            // the dark shadow that lifts it off the sculpture behind it.
            textShadow: "0 2px 70px rgba(0,0,0,0.9), 0 0 36px rgba(255,200,140,0.18)",
          }}
          initial={{ opacity: 0, filter: "blur(14px)", scale: 1.02 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          // The ONE signature effect in the entire entry. Blur 22→0
          // and scale 1.04→1 was dramatic; 14→0 and 1.02→1 reads as
          // "the wordmark resolves into focus" — present but
          // restrained, the way the brand should sound.
          //
          // Delay 0.8 places the wordmark right as the dome (0.7→1.9)
          // and the chrome X (0.6→1.8) are settling. Everything in
          // the scene arrives within a 400ms window so the visitor
          // reads ONE composition coming into focus, not a sequence.
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
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
      </motion.div>

      {/* LAYER 2C — chrome X rising from below the hero edge.
          The symbol's vertical CENTRE sits BELOW the bottom of the
          hero (negative bottom offset), so only the top arc of the
          chrome X peeks above the page edge. Reads as a halo rising
          out of the next section rather than a foreground watermark.
          Clamp keeps it sensible across viewports. */}
      {/* Static outer wrapper handles the centering transform; the
          motion child carries only the parallax x/y. Mixing `x` motion
          values with `translateX: "-50%"` on the same element causes
          Framer Motion to drop the centering and shoves the symbol off
          to one side — the same bug the Central Core split fixes. */}
      {/* Copper halo behind the chrome X — Movement II of the master
          timeline. Rim-light gradient from which the chrome X catches
          its reflections. Sits at zIndex 6 (below the X at 7, above
          the back orbits at 3) so the X reads as if rising out of it.
          The 13s breath loop that lived here previously phased against
          three other independent breaths (warm aureole, ambient
          backdrop, chrome X) and was the heart of the entry chaos.
          Now: a single graceful entry to a stable rim-light. */}
      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          // zIndex 5 — behind the chrome X (6) so it acts as the
          // rim-light the X catches reflections from, not as a glow
          // sitting on top of the sculpture.
          zIndex: 5,
          left: "50%",
          top: "50%",
          width: "clamp(420px, 72vw, 1080px)",
          height: "clamp(420px, 72vw, 1080px)",
          transform: "translate(-50%, calc(-50% + clamp(40px, 8svh, 90px)))",
          pointerEvents: "none",
          borderRadius: "50%",
          background:
            // DUAL RIM-LIGHT — warm source from the left (the brand, in
            // person), cool source from the right (the customer, on screen).
            // The chrome X sits between them and catches both, so the
            // sculpture itself embodies the duality of the whole field.
            "radial-gradient(circle at 30% 48%, rgba(255,184,112,0.3) 0%, rgba(238,158,96,0.09) 32%, transparent 62%), radial-gradient(circle at 70% 52%, rgba(116,154,236,0.24) 0%, rgba(96,128,224,0.07) 32%, transparent 62%)",
          filter: "blur(26px)",
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        // Same delay as the warm aureole — they ignite together as
        // the atmospheric stage. Identical timing (no 150ms offset)
        // reads as one event; offsets read as choreography.
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      />

      {/* LAYER 2C — chrome X as the centerpiece of the background.
          Anchored to the hero's vertical centre so the chrome X
          gravitates BEHIND the XNLAB wordmark (zIndex 10). The Y
          translate offset mirrors the wordmark's paddingBottom so the
          two share the same optical centre. Scale up on desktop so the
          sculpture has real weight, opacity lifted so it reads as
          present (not vestigial), and a continuous slow rotation on
          a 220s loop makes the chrome catch new highlights as the
          visitor dwells — imperceptible per frame, registers as
          "the sculpture is breathing" over time. */}
      <div
        style={{
          position: "absolute",
          // zIndex 6 — sits ABOVE the copper halo (5) so the X catches
          // its rim-light, and BELOW every orb in the dome (8–11) so
          // the sculpture is always read behind the spheres, never
          // piercing through them. This is the fix for "la estrella
          // pasa por delante de las esferas."
          zIndex: 6,
          left: "50%",
          top: "50%",
          width: "clamp(280px, 52vw, 720px)",
          height: "clamp(280px, 52vw, 720px)",
          transform: "translate(-50%, calc(-50% + clamp(40px, 8svh, 90px)))",
          pointerEvents: "none",
        }}
      >
        <motion.div style={{ y: xY, scale: xScroB, width: "100%", height: "100%", willChange: "transform" }}>
        <motion.div
          style={{ position: "relative", x: symX, y: symY, width: "100%", height: "100%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Pure opacity entrance. The previous blur(18px) → 0 was
          // a tutorial-style effect that competed with the wordmark's
          // signature blur. One blur-in per page (the wordmark)
          // reads as a deliberate signature; two reads as a tic.
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          <motion.div
            style={{ position: "relative", width: "100%", height: "100%" }}
            animate={inView ? { scale: [1, 1.025, 1], y: [0, -4, 0] } : { scale: 1, y: 0 }}
            transition={{ duration: 11, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
          >
              <Image
                src="/images/hero/05_main_bottom_symbol.png"
                alt=""
                fill
                sizes="(max-width: 768px) 300px, 600px"
                // Now centred behind the wordmark above the fold, Next
                // detects this as the page's LCP — so we mark it as
                // priority. That sets loading="eager" + fetchPriority
                // ="high" and pre-emits the <link rel="preload"> hint
                // in the HTML so the optimized AVIF/WebP variant is on
                // the critical path. The entry transition (blur(18px)
                // → 0, scale 0.94 → 1, opacity 0 → 1 over 1.6s) gives
                // the image room to decode and fade in cleanly.
                priority
                style={{
                  objectFit: "contain",
                  mixBlendMode: "screen",
                  opacity: 0.85,
                  // Single stronger drop-shadow instead of two stacked.
                  // Stacked drop-shadows blow up paint cost — Chromium
                  // re-rasterises the full layer per shadow. One wider
                  // shadow reads as the same atmospheric copper rim.
                  // Dual edge-glow: warm bloom thrown to the left, cool to
                  // the right, so the chrome reads as lit by both worlds at
                  // once. Two offset shadows on a single static image —
                  // rasterised once, composited cheaply by the parent.
                  filter:
                    "drop-shadow(-18px 1px 46px rgba(255,176,104,0.58)) drop-shadow(18px 1px 46px rgba(120,156,238,0.52))",
                }}
              />
          </motion.div>
        </motion.div>
        </motion.div>
      </div>

      {/* HAZE */}
      <motion.div
        style={{ position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // Slow quiet fade underneath everything. The haze is the air
        // the composition breathes through — it can't have a
        // perceptible arrival or it stops being air.
        transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
      >
        <Image
          src="/images/hero/02_haze_overlay.png"
          alt=""
          fill
          sizes="100vw"
          // Screen-blend overlay at 5.5% opacity. Quality 40 is enough
          // for an effect that is statistically invisible at full
          // resolution. 50%+ payload savings.
          loading="lazy"
          quality={40}
          style={{ objectFit: "cover", objectPosition: "center top", mixBlendMode: "screen", opacity: 0.055 }}
        />
      </motion.div>

      {/* FILM GRAIN — fractal-noise texture over the whole hero, soft-light
          blended at low opacity and drifting in stepped jumps. Reads as the
          analog grain of a graded film frame: it unifies the layers, hides
          gradient banding, and is the texture that separates "rendered in a
          browser" from "directed." Pure CSS noise (no asset), one GPU
          transform loop; the reduced-motion block freezes it. */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, zIndex: 26, pointerEvents: "none", overflow: "hidden", opacity: 0.3 }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-50%",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px 180px",
            mixBlendMode: "soft-light",
            opacity: 0.55,
            animation: "xn-grain 0.7s steps(5) infinite",
            // Pause the grain shimmer when the hero is off-screen — no
            // point repainting a texture nobody is looking at.
            animationPlayState: inView ? "running" : "paused",
            willChange: "transform",
          }}
        />
      </div>

      <Dust count={6} opacity={0.07} />

      {/* Bottom — strapline + scroll cue stacked in one column so they
          never collide on short viewports. Single flex container at the
          bottom of the hero, scroll cue follows the strapline below. */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          // Footer breathing room + safe-area inset so the scarcity line
          // never tucks under the phone's home indicator / browser chrome.
          // Extra bottom space below 640px via the same media-query-free
          // calc trick.
          paddingBottom:
            "calc(env(safe-area-inset-bottom, 0px) + clamp(22px,3vh,36px) + max(0px, calc((640px - 100vw) * 0.045)))",
          gap: "clamp(18px,2.6vh,44px)",
          pointerEvents: "none",
          opacity: bottomOpacity,
          willChange: "opacity",
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
          // Last to arrive, after the scene is composed and the
          // wordmark is in focus. The visitor's eye finishes reading
          // the visual statement; then the words appear exactly when
          // wanted. Pure opacity, single curve across the piece.
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 1.6 }}
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
              ? "First cycle of MMXXVI · Open"
              : "Primer ciclo de MMXXVI · Abierto"}
          </p>
        </motion.div>


      </motion.div>

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

