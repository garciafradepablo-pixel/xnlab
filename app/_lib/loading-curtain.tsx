"use client";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useState } from "react";
import { Orb } from "./orb";
import { worlds } from "./worlds";

// XNLAB cold-open. Instead of a flat dark sheet, the visitor sees the
// atelier "warm up": three layers of pigment-smoke drifting and
// reacting to the cursor, an amber orb forming in the centre, a
// hairline progress meter, sequential calibration captions, and a
// final "touch to enter" prompt the visitor can click to push through.
// The curtain dismisses on click after the stages settle, or auto-
// dismisses at the hard timeout if the visitor hasn't moved.
const STAGES = [
  "Initialising the atmosphere",
  "Mixing pigments",
  "Tuning resonance",
  "Calibrating the room",
  "Open the laboratory",
];

const STAGE_MS = 620;

export function LoadingCurtain() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);

  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const px = useSpring(rawX, { stiffness: 55, damping: 22, mass: 0.8 });
  const py = useSpring(rawY, { stiffness: 55, damping: 22, mass: 0.8 });

  // Cursor / touch parallax — drives the smoke layers' translation.
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      rawX.set(e.clientX / window.innerWidth);
      rawY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, rawX, rawY]);

  // Stage progression.
  useEffect(() => {
    if (reduced) {
      setStage(STAGES.length - 1);
      setReady(true);
      const t = setTimeout(() => setShow(false), 220);
      return () => clearTimeout(t);
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < STAGES.length; i++) {
      timers.push(setTimeout(() => setStage(i), STAGE_MS * i));
    }
    timers.push(
      setTimeout(() => setReady(true), STAGE_MS * (STAGES.length - 1) + 80)
    );
    // Hard cap — auto-dismiss even if no click.
    timers.push(setTimeout(() => setShow(false), STAGE_MS * (STAGES.length + 2)));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  // Lock body scroll so the page never shifts under the curtain.
  useEffect(() => {
    if (!show || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  const dismiss = () => {
    if (ready) setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          onPointerDown={dismiss}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99998,
            overflow: "hidden",
            cursor: ready ? "pointer" : "wait",
            background:
              "radial-gradient(ellipse 90% 70% at 50% 45%, rgba(28,16,10,1) 0%, #050302 78%)",
          }}
        >
          {/* Pigment smoke — three layers, different speeds + parallax */}
          <SmokeLayer
            x={px}
            y={py}
            hue="rgba(232,150,80,0.18)"
            scale={1.35}
            duration={26}
            parallax={36}
            reduced={!!reduced}
          />
          <SmokeLayer
            x={px}
            y={py}
            hue="rgba(180,80,40,0.14)"
            scale={1.7}
            duration={42}
            parallax={-50}
            reduced={!!reduced}
            delay={4}
          />
          <SmokeLayer
            x={px}
            y={py}
            hue="rgba(60,38,28,0.22)"
            scale={2.1}
            duration={58}
            parallax={22}
            reduced={!!reduced}
            delay={9}
          />

          {/* Constellation forming — the real XNLAB universe assembles
              itself: the Central Core PNG appears first, the six World
              PNGs swarm in from outside and settle into the hexagonal
              ring. Each orb keeps its own breathing / drifting motion
              (handled inside <Orb/>), and the whole ring slowly drifts
              as a body so the constellation never feels static. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.7, filter: "blur(18px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative",
                width: "clamp(260px, 40vw, 460px)",
                aspectRatio: "1",
              }}
            >
              {/* Slow rotating ring — carries the six worlds. Period is
                  long enough that the rotation reads as drift, not spin. */}
              <motion.div
                animate={reduced ? undefined : { rotate: 360 }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute", inset: 0 }}
              >
                {worlds.map((w, i) => {
                  const angle = -90 + i * 60;
                  return (
                    <motion.div
                      key={w.slug}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 1.3,
                        delay: 0.55 + i * 0.22,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "clamp(56px, 8vw, 92px)",
                        height: "clamp(56px, 8vw, 92px)",
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * clamp(100px, 14.5vw, 180px))) rotate(${-angle}deg)`,
                      }}
                    >
                      <Orb world={w} size={92} />
                    </motion.div>
                  );
                })}
              </motion.div>
              {/* Central Core stays still in the centre */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "clamp(110px, 15vw, 170px)",
                  height: "clamp(110px, 15vw, 170px)",
                }}
              >
                <Orb central size={170} />
              </motion.div>
              {/* Soft amber wash behind the constellation */}
              <motion.div
                aria-hidden
                animate={reduced ? undefined : { opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: "-15%",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(232,150,80,0.16) 0%, transparent 65%)",
                  filter: "blur(28px)",
                  zIndex: -1,
                  pointerEvents: "none",
                }}
              />
            </motion.div>
          </div>

          {/* Top zone — wordmark + hairline divider, anchored to the top
              of the viewport so it never collides with the centred orb. */}
          <div
            style={{
              position: "absolute",
              top: "clamp(40px, 9vh, 88px)",
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.8em" }}
              animate={{ opacity: 0.92, letterSpacing: "0.5em" }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(10px, 0.95vw, 12px)",
                fontWeight: 500,
                color: "rgba(232,183,131,0.92)",
                textTransform: "uppercase",
                margin: 0,
                textShadow: "0 2px 24px rgba(0,0,0,0.85)",
              }}
            >
              XNLAB
            </motion.p>
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 64, opacity: 1 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 14,
                height: 1,
                background:
                  "linear-gradient(to right, transparent, rgba(232,183,131,0.5), transparent)",
              }}
            />
          </div>

          {/* Bottom zone — stage caption, progress, prompt. Sits below
              the orb with generous breathing room. */}
          <div
            style={{
              position: "absolute",
              bottom: "clamp(36px, 8vh, 80px)",
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
              padding: "0 24px",
              gap: 16,
            }}
          >
            <div
              style={{
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "min(420px, 80vw)",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.72, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    margin: 0,
                    fontFamily:
                      "var(--font-serif,'Cormorant Garamond',Georgia,serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(13px, 1.2vw, 15px)",
                    color: "rgba(255,255,255,0.72)",
                    letterSpacing: "-0.005em",
                    textShadow: "0 2px 18px rgba(0,0,0,0.85)",
                  }}
                >
                  {STAGES[stage]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div
              style={{
                width: "min(220px, 44vw)",
                height: 1,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{
                  width: ready
                    ? "100%"
                    : `${Math.round(((stage + 1) / STAGES.length) * 100)}%`,
                }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: "100%",
                  background:
                    "linear-gradient(to right, rgba(232,183,131,0.25), rgba(232,183,131,0.95))",
                  boxShadow: "0 0 14px rgba(232,183,131,0.55)",
                }}
              />
            </div>
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismiss();
              }}
              animate={
                ready
                  ? { opacity: [0.5, 0.95, 0.5], y: [0, -2, 0] }
                  : { opacity: 0 }
              }
              transition={
                ready
                  ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.4 }
              }
              style={{
                marginTop: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.82)",
                fontWeight: 500,
                background: "transparent",
                border: "none",
                cursor: ready ? "pointer" : "default",
                padding: "10px 16px",
                pointerEvents: ready ? "auto" : "none",
                textShadow: "0 2px 16px rgba(0,0,0,0.85)",
              }}
            >
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "rgba(232,183,131,0.95)",
                  boxShadow: "0 0 10px rgba(232,183,131,0.85)",
                  display: "inline-block",
                }}
              />
              Touch to enter
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SmokeLayer({
  x,
  y,
  hue,
  scale,
  duration,
  parallax,
  delay = 0,
  reduced,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  hue: string;
  scale: number;
  duration: number;
  parallax: number;
  delay?: number;
  reduced: boolean;
}) {
  const tx = useTransform(x, [0, 1], [-parallax, parallax]);
  const ty = useTransform(y, [0, 1], [-parallax * 0.6, parallax * 0.6]);

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: "-15%",
        pointerEvents: "none",
        x: reduced ? 0 : tx,
        y: reduced ? 0 : ty,
        willChange: "transform",
      }}
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : {
                x: ["-5%", "5%", "-5%"],
                y: ["-3%", "3%", "-3%"],
                scale: [1, 1.05, 1],
              }
        }
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse ${60 * scale}% ${
            48 * scale
          }% at 50% 50%, ${hue} 0%, transparent 72%)`,
          filter: "blur(48px)",
          willChange: "transform",
        }}
      />
    </motion.div>
  );
}
