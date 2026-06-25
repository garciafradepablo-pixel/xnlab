"use client";
import type { ReactNode } from "react";

// Small set of themable primitives. Colours come from CSS variables set
// on the app shell (see page.tsx), so every primitive works in both
// dark and light without per-component branching.

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-[var(--dc-border)] bg-[var(--dc-card)] p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_18px_40px_-30px_rgba(0,0,0,0.7)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3 mt-1">
      <h2 className="text-[22px] font-semibold tracking-tight text-[var(--dc-text)]">{title}</h2>
      {sub && <p className="mt-0.5 text-[13px] text-[var(--dc-muted)]">{sub}</p>}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "orange" | "muted";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--dc-chip)] text-[var(--dc-text)]",
    green: "bg-[var(--dc-green-soft)] text-[var(--dc-green)]",
    orange: "bg-[var(--dc-orange-soft)] text-[var(--dc-orange)]",
    muted: "bg-[var(--dc-chip)] text-[var(--dc-muted)]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

// Round checkbox — fills green when checked.
export function Check({ checked, onClick, label }: { checked: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      onClick={onClick}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked
          ? "border-[var(--dc-green)] bg-[var(--dc-green)] text-black"
          : "border-[var(--dc-border-strong)] bg-transparent text-transparent"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </button>
  );
}

// Linear progress with an optional target band overlay.
export function ProgressBar({
  value,
  max,
  bandMin,
  bandMax,
  tone = "green",
}: {
  value: number;
  max: number;
  bandMin?: number;
  bandMax?: number;
  tone?: "green" | "orange";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const color = tone === "green" ? "var(--dc-green)" : "var(--dc-orange)";
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--dc-chip)]">
      {bandMin !== undefined && bandMax !== undefined && (
        <div
          className="absolute inset-y-0 bg-[var(--dc-band)]"
          style={{ left: `${(bandMin / max) * 100}%`, width: `${((bandMax - bandMin) / max) * 100}%` }}
        />
      )}
      <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// Segmented control (used for adjust & 1–5 scores).
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-[var(--dc-chip)] p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-full px-2 py-1.5 text-[12px] font-semibold transition-colors ${
              active ? "bg-[var(--dc-text)] text-[var(--dc-bg)]" : "text-[var(--dc-muted)]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stat({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: "green" | "orange" }) {
  const color = tone === "green" ? "text-[var(--dc-green)]" : tone === "orange" ? "text-[var(--dc-orange)]" : "text-[var(--dc-text)]";
  return (
    <div className="flex flex-col">
      <span className="text-[12px] font-medium uppercase tracking-wide text-[var(--dc-muted)]">{label}</span>
      <span className={`mt-1 text-[26px] font-bold leading-none ${color}`}>
        {value}
        {unit && <span className="ml-1 text-[14px] font-semibold text-[var(--dc-muted)]">{unit}</span>}
      </span>
    </div>
  );
}
