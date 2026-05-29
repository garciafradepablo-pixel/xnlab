"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

// Hydration gate. useSyncExternalStore returns the server snapshot
// (`false`) during SSR + first render, then the client snapshot (`true`)
// after hydration — without the setState-in-effect cascade a
// useState/useEffect mounted flag would trigger under React 19.
const subscribeMountedNoop = () => () => {};
const getMountedTrue = () => true;
const getMountedFalse = () => false;
export function useMounted() {
  return useSyncExternalStore(subscribeMountedNoop, getMountedTrue, getMountedFalse);
}

// Shared design tokens
export const ts = "0 1px 20px rgba(0,0,0,0.9)";
export const tsS = "0 2px 40px rgba(0,0,0,0.95),0 0 20px rgba(0,0,0,0.8)";
export const serif = "var(--font-serif,'Cormorant Garamond',Georgia,serif)";

// Word-by-word reveal
export function W({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      className={"inline " + className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-6%" }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.075 },
            },
          }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Block reveal
export function R({
  children,
  className = "",
  delay = 0,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 38, scale: 0.984, filter: "blur(7px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-9%" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Small all-caps label
export function Label({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.38em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.42)",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

// Editorial commentary subtitle — the italic gold aside that follows
// a section heading. Anchored above by a soft amber hairline and
// balanced wrap so the lines never break awkwardly. Replaces ad-hoc
// `<p>` blocks that had the same intent but no consistent treatment.
//
// Alignment is controlled by Tailwind classes on the wrapper. The
// default `text-center mx-auto` centres both the hairline and the
// text on the page axis. For a column inside a side-by-side layout,
// pass e.g. `text-center lg:text-left mx-auto lg:mx-0` to switch
// alignment at the responsive breakpoint. Inline styles deliberately
// do not set text-align or horizontal margin so the class wins.
export function Commentary({
  children,
  delay = 0,
  maxWidth = 560,
  className = "text-center mx-auto",
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <R delay={delay}>
      <div
        className={className}
        style={{
          maxWidth,
          marginTop: "clamp(28px,3.4vw,44px)",
          ...style,
        }}
      >
        <motion.span
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-9%" }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: delay + 0.18 }}
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            width: "clamp(32px,3.8vw,48px)",
            height: 1,
            marginBottom: "clamp(14px,1.8vw,22px)",
            transformOrigin: "center",
            background:
              "linear-gradient(to right, transparent 0%, rgba(232,183,131,0.6) 50%, transparent 100%)",
            filter: "drop-shadow(0 0 6px rgba(232,183,131,0.35))",
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(1.1rem,1.5vw,1.45rem)",
            lineHeight: 1.5,
            color: "rgba(232,183,131,0.88)",
            letterSpacing: "-0.003em",
            textShadow: ts,
            textWrap: "balance",
          }}
        >
          {children}
        </p>
      </div>
    </R>
  );
}

// Dust particles overlay.
//
// `tint` accepts an "r,g,b" triplet (no rgba() wrapper, no #hex — just
// the comma-separated channels) so the same particle system can speak
// in any world's colour. Default is the warm cream that lives across
// the studio's main surface. Used on /worlds/[slug] to drift the
// particles in that world's accent — same restraint, signed by the
// sphere the visitor is reading.
export function Dust({
  count = 8,
  opacity = 0.08,
  tint = "230,205,165",
}: {
  count?: number;
  opacity?: number;
  tint?: string;
}) {
  // Lazy state initializer keeps the random positions stable across
  // re-renders without a setState-in-effect cascade. The mounted gate
  // skips render during SSR/hydration so each particle's random style
  // attrs can't trip a hydration mismatch.
  const [items] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      s: Math.random() * 3 + 1,
      d: Math.random() * 18 + 10,
      del: Math.random() * 8,
      anim: ["dust0", "dust1", "dust2", "dust3"][i % 4],
    }))
  );
  const mounted = useMounted();
  if (!mounted) return null;
  // Mobile: skip the dust particles entirely. They are pure decoration,
  // already near-invisible (opacity 0.03-0.08), and each particle is a
  // separately-animated blurred div — heavy on mobile GPU for almost
  // zero visual return. Tailwind `hidden md:block` ships zero motion
  // nodes below 768px.
  return (
    <div className="hidden md:block" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>
      {items.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s * 14,
            height: p.s * 14,
            borderRadius: "50%",
            // Softer destello — gradient fades from a low-opacity centre
            // straight to transparent, with extra CSS blur on top. The
            // particle becomes a real bokeh haze instead of a defined
            // dot. Cinematic film grain feel.
            background: `radial-gradient(circle, rgba(${tint},${opacity * 0.7}) 0%, rgba(${tint},${opacity * 0.3}) 30%, transparent 55%)`,
            filter: "blur(5px)",
            animation: `${p.anim} ${p.d}s ${p.del}s infinite ease-in-out`,
            transform: "translate(-50%,-50%)",
            willChange: "transform,opacity",
          }}
        />
      ))}
    </div>
  );
}

// Injects keyframes used by Dust
export function DustStyles() {
  return (
    <style>{`@keyframes dust0{0%,100%{transform:translate(-50%,-50%) translate(0,0);opacity:0}10%{opacity:1}50%{transform:translate(-50%,-50%) translate(18px,-22px);opacity:0.7}90%{opacity:0.8}}@keyframes dust1{0%,100%{transform:translate(-50%,-50%) translate(0,0);opacity:0}15%{opacity:0.8}50%{transform:translate(-50%,-50%) translate(-24px,16px);opacity:0.5}85%{opacity:0.6}}@keyframes dust2{0%,100%{transform:translate(-50%,-50%) translate(0,0);opacity:0}20%{opacity:0.9}50%{transform:translate(-50%,-50%) translate(20px,28px);opacity:0.4}80%{opacity:0.7}}@keyframes dust3{0%,100%{transform:translate(-50%,-50%) translate(0,0);opacity:0}12%{opacity:0.6}50%{transform:translate(-50%,-50%) translate(-16px,-20px);opacity:0.8}88%{opacity:0.5}}`}</style>
  );
}

// Bilingual language hook — module-level store so the read happens in a
// useSyncExternalStore snapshot (client-only) instead of a setState-in-
// effect cascade. Server snapshot is always "en"; client resolves from
// localStorage, falling back to navigator.language.
type Lang = "en" | "es";
let langCache: Lang | null = null;
const langListeners = new Set<() => void>();

function getLangSnapshot(): Lang {
  if (langCache) return langCache;
  const s = window.localStorage.getItem("xn-lang");
  if (s === "en" || s === "es") return (langCache = s);
  if (navigator.language?.toLowerCase().startsWith("es")) return (langCache = "es");
  return (langCache = "en");
}

function subscribeLang(cb: () => void) {
  langListeners.add(cb);
  return () => {
    langListeners.delete(cb);
  };
}

function setLangValue(l: Lang) {
  langCache = l;
  window.localStorage.setItem("xn-lang", l);
  document.documentElement.lang = l;
  langListeners.forEach((cb) => cb());
}

export function useLang() {
  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, () => "en" as Lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return [lang, setLangValue] as const;
}
