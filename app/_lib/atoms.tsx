"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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
            hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.065 },
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
      initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
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

// Dust particles overlay
export function Dust({ count = 8, opacity = 0.08 }: { count?: number; opacity?: number }) {
  const [items, setItems] = useState<
    { x: number; y: number; s: number; d: number; del: number; anim: string }[]
  >([]);
  useEffect(() => {
    setItems(
      Array.from({ length: count }, (_, i) => ({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        s: Math.random() * 3 + 1,
        d: Math.random() * 18 + 10,
        del: Math.random() * 8,
        anim: ["dust0", "dust1", "dust2", "dust3"][i % 4],
      }))
    );
  }, [count]);
  if (!items.length) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>
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
            background: `radial-gradient(circle, rgba(230,205,165,${opacity * 0.7}) 0%, rgba(230,205,165,${opacity * 0.3}) 30%, transparent 55%)`,
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

// Bilingual language hook
export function useLang() {
  const [lang, setLang] = useState<"en" | "es">("en");
  useEffect(() => {
    const s = typeof window !== "undefined" ? window.localStorage.getItem("xn-lang") : null;
    if (s === "en" || s === "es") setLang(s);
    else if (
      typeof navigator !== "undefined" &&
      navigator.language?.toLowerCase().startsWith("es")
    )
      setLang("es");
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    if (typeof window !== "undefined") window.localStorage.setItem("xn-lang", lang);
  }, [lang]);
  return [lang, setLang] as const;
}
