"use client";
// ---------------------------------------------------------------------------
// Hunter Network (HN) — UI primitives
//
// The operator console's vocabulary: cards, stat cards, badges, score bars,
// risk labels, tables. Built in the studio's dark/gold language (inline styles,
// Inter + Cormorant, accent rgba(232,183,131)) so HN feels native to the
// XNLAB surface while reading as an operational tool, not the marketing site.
//
// Pure presentational primitives — no data fetching, no business logic.
// ---------------------------------------------------------------------------

import type { CSSProperties, ReactNode } from "react";

export const ACCENT = "232,183,131"; // warm gold, the studio accent
export const PANEL = "rgba(255,255,255,0.02)";
export const HAIR = "rgba(255,255,255,0.08)";
export const serifFont = "var(--font-serif,'Cormorant Garamond',Georgia,serif)";

// Semantic colour per tone — risk, status and score share one scale.
export type Tone = "neutral" | "good" | "warn" | "bad" | "accent" | "info";
const TONE_RGB: Record<Tone, string> = {
  neutral: "255,255,255",
  good: "120,200,150",
  warn: "232,183,131",
  bad: "230,120,110",
  accent: ACCENT,
  info: "140,170,210",
};

export function toneColor(tone: Tone, alpha = 1): string {
  return `rgba(${TONE_RGB[tone]},${alpha})`;
}

// --- Card -------------------------------------------------------------------

export function Card({ children, style, pad = true }: { children: ReactNode; style?: CSSProperties; pad?: boolean }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${HAIR}`,
        borderRadius: 14,
        padding: pad ? "clamp(16px,1.6vw,22px)" : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// --- StatCard ---------------------------------------------------------------

export function StatCard({ label, value, tone = "neutral", hint }: { label: string; value: string | number; tone?: Tone; hint?: string }) {
  return (
    <div
      style={{
        background: PANEL,
        border: `1px solid ${tone === "bad" ? toneColor("bad", 0.35) : HAIR}`,
        borderRadius: 12,
        padding: "clamp(14px,1.4vw,18px)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
        {label}
      </span>
      <span style={{ fontSize: "clamp(1.5rem,2.4vw,2.1rem)", fontWeight: 300, letterSpacing: "-0.02em", color: toneColor(tone === "neutral" ? "neutral" : tone, tone === "neutral" ? 0.95 : 0.95), lineHeight: 1 }}>
        {value}
      </span>
      {hint && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{hint}</span>}
    </div>
  );
}

// --- Badge ------------------------------------------------------------------

export function Badge({ children, tone = "neutral", solid = false }: { children: ReactNode; tone?: Tone; solid?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0.22rem 0.6rem",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        color: toneColor(tone, solid ? 1 : 0.9),
        background: toneColor(tone, solid ? 0.16 : 0.08),
        border: `1px solid ${toneColor(tone, 0.35)}`,
      }}
    >
      {children}
    </span>
  );
}

// A filled dot + label, for risk levels where the dot carries the signal.
export function RiskLabel({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: toneColor(tone, 0.9) }}>
      <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, background: toneColor(tone, 1), boxShadow: `0 0 8px ${toneColor(tone, 0.6)}` }} />
      {label}
    </span>
  );
}

// --- ScoreBar ---------------------------------------------------------------

export function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tone: Tone = value === 0 ? "neutral" : pct >= 85 ? "good" : pct >= 60 ? "warn" : "bad";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 110 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: toneColor(tone, 0.85), borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: toneColor(tone, 0.95), minWidth: 34, textAlign: "right" }}>
        {value ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

// --- Section header ---------------------------------------------------------

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: `rgba(${ACCENT},0.7)`, margin: "0 0 14px" }}>
      {children}
    </p>
  );
}

// --- Table primitives -------------------------------------------------------

export function Table({ children }: { children: ReactNode }) {
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${HAIR}`, borderRadius: 14, background: PANEL }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>{children}</table>
    </div>
  );
}

export function Th({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: "12px 16px",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.4)",
        borderBottom: `1px solid ${HAIR}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", style }: { children: ReactNode; align?: "left" | "right" | "center"; style?: CSSProperties }) {
  return (
    <td style={{ textAlign: align, padding: "12px 16px", borderBottom: `1px solid rgba(255,255,255,0.04)`, color: "rgba(255,255,255,0.82)", verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
}
