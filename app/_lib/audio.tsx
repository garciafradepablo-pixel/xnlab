"use client";
import { useEffect, useRef, useState } from "react";

// Ambient audio toggle. Place an audio file at /public/audio/ambient.mp3 to enable.
// If the file is missing the toggle hides itself.
export function AmbientAudio({
  src = "/audio/ambient.mp3",
  volume = 0.32,
  label,
}: {
  src?: string;
  volume?: number;
  label?: { on: string; off: string };
}) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem("xn-audio") : null;
    if (v === "on") setOn(true);
  }, []);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = volume;
    if (on) {
      a.play().catch(() => {
        setOn(false);
      });
    } else {
      a.pause();
    }
    if (typeof window !== "undefined")
      window.localStorage.setItem("xn-audio", on ? "on" : "off");
  }, [on, volume]);

  const l = label ?? { on: "Sound on", off: "Sound off" };

  if (missing) return null;

  return (
    <>
      <audio
        ref={ref}
        src={src}
        loop
        preload="none"
        onError={() => setMissing(true)}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        aria-label={on ? l.on : l.off}
        title={on ? l.on : l.off}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          padding: 0,
          color: on ? "white" : "rgba(255,255,255,0.5)",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "color 0.3s",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "flex-end",
            gap: 2,
            height: 12,
            width: 14,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: 2,
                height: on ? [4, 9, 6][i] : 2,
                background: "currentColor",
                transition: "height 0.4s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </span>
      </button>
    </>
  );
}
