"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { serif, ts } from "./atoms";

// InkParagraph — a drop-in upgrade of <Commentary> for the one paragraph
// that should feel "written into the atmosphere": same serif-italic
// amber editorial look, plus an ink-in-glass treatment.
//
// The effect, three layers, all readable and all light:
//   1. Entry — the line resolves from a soft blur into focus (ink
//      settling), once, on enter.
//   2. Scroll-tied sheen — a brighter band of light travels through the
//      words as the paragraph passes the viewport. It moves only when
//      the reader scrolls (tied to scrollYProgress, not a loop), so it
//      reads as ink/light spreading through dark glass rather than a
//      gimmick. Built with background-clip:text; the base stops stay at
//      0.82 amber, so the text is never less than fully legible.
//   3. Depth — a faint dual text-shadow presses the glyphs into the
//      dark, like ink in glass.
//
// Performance / safety:
//   • The scroll target is THIS element (position:relative set), so
//     framer measures it correctly — no fixed-element breakage (no
//     fixed descendants live here).
//   • prefers-reduced-motion → solid amber, no clip, no sheen: the exact
//     legible Commentary look.
export function InkParagraph({
  children,
  delay = 0,
  maxWidth = 560,
}: {
  children: React.ReactNode;
  delay?: number;
  maxWidth?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sheen = useTransform(scrollYProgress, [0, 1], ["140% 50%", "-40% 50%"]);

  const ink: React.CSSProperties = reduced
    ? { color: "rgba(232,183,131,0.88)", textShadow: ts }
    : {
        color: "transparent",
        WebkitTextFillColor: "transparent",
        backgroundImage:
          "linear-gradient(100deg, rgba(214,166,108,0.82) 0%, rgba(214,166,108,0.82) 40%, rgba(255,242,220,1) 50%, rgba(214,166,108,0.82) 60%, rgba(214,166,108,0.82) 100%)",
        backgroundSize: "240% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        textShadow: "0 1px 1px rgba(0,0,0,0.5), 0 0 22px rgba(0,0,0,0.38)",
      };

  return (
    <motion.div
      ref={ref}
      className="text-center mx-auto"
      style={{ maxWidth, marginTop: "clamp(28px,3.4vw,44px)", position: "relative" }}
      initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          width: "clamp(32px,3.8vw,48px)",
          height: 1,
          marginBottom: "clamp(14px,1.8vw,22px)",
          background: "linear-gradient(to right, transparent 0%, rgba(232,183,131,0.6) 50%, transparent 100%)",
          filter: "drop-shadow(0 0 6px rgba(232,183,131,0.35))",
        }}
      />
      <motion.p
        style={{
          margin: 0,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: "clamp(1.1rem,1.5vw,1.45rem)",
          lineHeight: 1.5,
          letterSpacing: "-0.003em",
          textWrap: "balance",
          willChange: reduced ? undefined : "background-position",
          ...ink,
          ...(reduced ? {} : { backgroundPosition: sheen }),
        }}
      >
        {children}
      </motion.p>
    </motion.div>
  );
}
