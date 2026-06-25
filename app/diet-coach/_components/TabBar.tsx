"use client";
import type { ReactNode } from "react";

export type TabId = "dashboard" | "plan" | "compra" | "fuera" | "supps" | "track";

export const TABS: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Hoy", icon: <IconHome /> },
  { id: "plan", label: "Comidas", icon: <IconPlate /> },
  { id: "compra", label: "Compra", icon: <IconCart /> },
  { id: "fuera", label: "Fuera", icon: <IconPin /> },
  { id: "supps", label: "Supl.", icon: <IconPill /> },
  { id: "track", label: "Registro", icon: <IconChart /> },
];

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav
      className="flex shrink-0 items-stretch justify-around border-t border-[var(--dc-border)] bg-[var(--dc-bar)] px-1 pt-2"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
    >
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-semibold transition-colors ${
              on ? "text-[var(--dc-green)]" : "text-[var(--dc-muted)]"
            }`}
          >
            <span className="h-6 w-6">{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

function svg(path: ReactNode) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}
function IconHome() {
  return svg(<><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /></>);
}
function IconPlate() {
  return svg(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></>);
}
function IconCart() {
  return svg(<><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h2l2.4 12.2a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 7H5" /></>);
}
function IconPin() {
  return svg(<><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>);
}
function IconPill() {
  return svg(<><rect x="3" y="9" width="18" height="6" rx="3" /><path d="M12 9v6" /></>);
}
function IconChart() {
  return svg(<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>);
}
