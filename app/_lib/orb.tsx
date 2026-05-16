"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import type { World } from "./worlds";

type OrbProps = {
  world?: World;
  // Central Core variant — overrides world. Used on the /worlds hero.
  central?: boolean;
  // Optional override of the PNG path (transparent background).
  // Falls back to world.image, then to the existing hero orb, then to CSS.
  image?: string;
  size?: number;
  className?: string;
};

// World Core visual.
// Renders a transparent PNG (the orb image the user provides) with framer-motion
// drift / float / vibrate / refract motion per Core, plus a soft halo behind in
// the Core's colour. If no image is provided, falls back to a CSS radial-gradient
// sphere so the layout never breaks.
//
// Where to drop the PNGs:
//   public/images/worlds/central.png            ← the dark crimson Central Core
//   public/images/worlds/hospitality.png        ← amber gold sphere
//   public/images/worlds/nightlife.png          ← electric violet sphere
//   public/images/worlds/lifestyle.png          ← ivory pearl sphere
//   public/images/worlds/architecture.png       ← mineral stone sphere
//   public/images/worlds/music.png              ← midnight indigo sphere
//   public/images/worlds/digital.png            ← iridescent cyan sphere
// PNG with transparent background. 1000x1000 minimum is enough. The orb image
// can sit naturally on the dark site; mix-blend is not required but works if you
// want extra atmospheric integration.
export function Orb({ world, central = false, image, size = 220, className }: OrbProps) {
  const isCentral = central;
  // Halo colour, motion personality and image source
  const haloColor = isCentral
    ? "rgba(180,50,30,0.5)"
    : world?.color.glow ?? "rgba(255,255,255,0.2)";
  const m = world?.motion;

  // central.png is the Central Core's own PNG — same status as a World's
  // own PNG (halo + colour already baked in). We treat it as an "own
  // image" too, so it does not get the chrome tint or circular clip.
  const SHARED_ORB = "/images/worlds/central.png";
  const orbImage = image ?? world?.image ?? SHARED_ORB;
  const usesOwnImage = isCentral || Boolean(image ?? world?.image);
  const tintColor = usesOwnImage ? null : world?.color.hex;
  const tintOpacity = isCentral
    ? 0.55
    : world?.slug === "luxury-lifestyle-brands" || world?.slug === "architecture-spatial-design"
    ? 0.32
    : 0.5;

  // Per-pulse animation for the orb itself
  const breatheScale = m?.breatheScale ?? (isCentral ? [1, 1.025] : [1, 1.03]);
  const breatheDuration = m?.breatheDuration ?? (isCentral ? 6 : 7);
  const drift = m?.drift ?? 4;
  const pulse = m?.pulse;

  const animByPulse: Record<string, Record<string, unknown>> = {
    still: { scale: breatheScale, y: [0, -drift, 0] },
    slow: { scale: breatheScale, y: [0, -drift, 0] },
    drift: { scale: breatheScale, x: [0, drift, 0, -drift, 0], y: [0, -drift, 0] },
    vibrate: { scale: breatheScale, x: [0, 1.5, -1, 1, 0], y: [0, -1, 1, -1, 0] },
    wave: { scale: breatheScale, y: [0, -drift, 0, drift / 2, 0] },
    refract: {
      scale: breatheScale,
      filter: ["hue-rotate(0deg)", "hue-rotate(15deg)", "hue-rotate(-10deg)", "hue-rotate(0deg)"],
    },
    central: { scale: breatheScale, y: [0, -2, 0] },
  };
  const animKey = pulse ?? "central";

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.85, filter: "blur(14px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        willChange: "transform, filter",
      }}
    >
      <motion.div
        animate={animByPulse[animKey]}
        transition={{
          duration: breatheDuration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
      >
        {/* Under-orb luminosity pool — light emitted DOWNWARD from the
            sphere onto an unseen surface. Positioned exclusively below
            the equator and tighter than the orb width, so the pool
            never wraps around the silhouette as a ring. Screen blend
            adds light additively to the page; if the orb is moved
            away nothing remains underneath. Creates the alveolus depth
            the user requested — each orb sits in its own colour pocket
            instead of floating like a sticker. */}
        {usesOwnImage && (
          <motion.div
            aria-hidden
            animate={{ opacity: [0.5, 0.78, 0.5] }}
            transition={{ duration: breatheDuration, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "absolute",
              left: "26%",
              right: "26%",
              top: "82%",
              height: "34%",
              background: `radial-gradient(ellipse 100% 60% at 50% 0%, ${haloColor} 0%, transparent 75%)`,
              mixBlendMode: "screen",
              filter: "blur(6px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
        {orbImage ? (
          usesOwnImage ? (
            <Image
              src={orbImage}
              alt={
                isCentral
                  ? "XNLAB Central Core — Creative Direction Studio"
                  : world
                  ? `${world.color.name} ${world.title.en} Core — XNLAB`
                  : "XNLAB World Core"
              }
              fill
              sizes={`${size}px`}
              style={{
                objectFit: "contain",
                position: "absolute",
                zIndex: 2,
              }}
              priority={isCentral}
            />
          ) : (
            // Chrome fallback — circular clip, colour tint and highlight
            // pass turn the shared chrome sphere into each Core's energy.
            // overflow:hidden + borderRadius:50% already clip the chrome
            // sphere into a circle; no drop-shadow needed (glow comes from
            // the box-shadow halo above).
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden" }}>
              <Image
                src={orbImage}
                alt={
                  isCentral
                    ? "XNLAB Central Core — Creative Direction Studio"
                    : world
                    ? `${world.color.name} ${world.title.en} Core — XNLAB`
                    : "XNLAB World Core"
                }
                fill
                sizes={`${size}px`}
                style={{
                  objectFit: "contain",
                }}
                priority={isCentral}
              />
              {tintColor && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: tintColor,
                    mixBlendMode: "color",
                    opacity: tintOpacity,
                    pointerEvents: "none",
                    maskImage:
                      "radial-gradient(circle at center, black 55%, transparent 75%)",
                    WebkitMaskImage:
                      "radial-gradient(circle at center, black 55%, transparent 75%)",
                  }}
                />
              )}
              {!isCentral && (
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 38% 30%, rgba(255,255,255,0.18) 0%, transparent 28%)",
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          )
        ) : (
          // CSS fallback — only if no PNG at all.
          <CssOrbFallback world={world} central={isCentral} />
        )}

      </motion.div>
    </motion.div>
  );
}

// CSS gradient fallback. Used when no PNG exists yet so the page never breaks.
function CssOrbFallback({ world, central }: { world?: World; central: boolean }) {
  if (central) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 30%, rgba(255,120,80,0.95) 0%, rgba(180,50,30,0.85) 18%, rgba(80,12,8,0.95) 50%, rgba(20,5,4,1) 78%)",
          boxShadow:
            "0 0 60px rgba(180,50,30,0.45), inset 0 -20px 60px rgba(0,0,0,0.7), inset 0 20px 40px rgba(255,140,90,0.18)",
        }}
      />
    );
  }
  if (!world) return null;
  const c = world.color;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: `radial-gradient(circle at 38% 32%, ${c.core} 0%, ${c.mid} 35%, ${c.deep} 78%)`,
        boxShadow: `0 0 50px ${c.glow}, inset 0 -18px 50px rgba(0,0,0,0.55)`,
      }}
    />
  );
}
