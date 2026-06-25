"use client";
import { useEffect, useState } from "react";
import { DietContext, useDietState } from "../_lib/store";
import type { Theme } from "../_lib/types";
import { Dashboard } from "./Dashboard";
import { MealPlan } from "./MealPlan";
import { Shopping } from "./Shopping";
import { EatingOut } from "./EatingOut";
import { Supplements } from "./Supplements";
import { Tracking } from "./Tracking";
import { TabBar, type TabId } from "./TabBar";

// Theme tokens consumed as CSS variables by every child component.
const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    "--dc-bg": "#0b0b0d",
    "--dc-card": "#15161a",
    "--dc-bar": "#0e0f12",
    "--dc-chip": "rgba(255,255,255,0.06)",
    "--dc-text": "#f4f5f7",
    "--dc-muted": "#8a8d96",
    "--dc-border": "rgba(255,255,255,0.08)",
    "--dc-border-strong": "rgba(255,255,255,0.18)",
    "--dc-green": "#34d399",
    "--dc-orange": "#fb923c",
    "--dc-green-soft": "rgba(52,211,153,0.14)",
    "--dc-orange-soft": "rgba(251,146,60,0.14)",
    "--dc-band": "rgba(52,211,153,0.16)",
  },
  light: {
    "--dc-bg": "#f4f5f7",
    "--dc-card": "#ffffff",
    "--dc-bar": "#ffffff",
    "--dc-chip": "rgba(0,0,0,0.05)",
    "--dc-text": "#0c0d10",
    "--dc-muted": "#6b7077",
    "--dc-border": "rgba(0,0,0,0.09)",
    "--dc-border-strong": "rgba(0,0,0,0.16)",
    "--dc-green": "#16a34a",
    "--dc-orange": "#ea580c",
    "--dc-green-soft": "rgba(22,163,74,0.12)",
    "--dc-orange-soft": "rgba(234,88,12,0.12)",
    "--dc-band": "rgba(22,163,74,0.14)",
  },
};

export function Shell() {
  const api = useDietState();
  const [tab, setTab] = useState<TabId>("dashboard");

  // This app lives inside the host site's root layout, which mounts a
  // first-visit splash and an exit/scroll Invitation popup gated by
  // sessionStorage. Pre-seed those flags so neither fires over our UI.
  useEffect(() => {
    try {
      sessionStorage.setItem("xn-splash-seen", "1");
      sessionStorage.setItem("xn-invitation-seen", "1");
    } catch {
      /* ignore */
    }
  }, []);

  const vars = THEMES[api.state.theme];

  return (
    <DietContext.Provider value={api}>
      <div
        style={{ ...vars, background: "var(--dc-bg)", color: "var(--dc-text)" }}
        className="fixed inset-0 z-[10000] flex flex-col font-sans antialiased"
      >
        {/* Header */}
        <header
          className="flex shrink-0 items-center justify-between border-b border-[var(--dc-border)] bg-[var(--dc-bar)] px-4 pb-3"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
        >
          <div>
            <h1 className="text-[17px] font-extrabold tracking-tight text-[var(--dc-text)]">
              Diet Coach <span className="text-[var(--dc-green)]">OS</span>
            </h1>
            <p className="text-[11px] text-[var(--dc-muted)]">Tailandia · volumen limpio</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={api.toggleTheme}
              aria-label="Cambiar tema"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--dc-border-strong)] text-[var(--dc-text)]"
            >
              {api.state.theme === "dark" ? <IconSun /> : <IconMoon />}
            </button>
            <button
              type="button"
              onClick={api.resetDay}
              className="rounded-full border border-[var(--dc-border-strong)] px-3 py-2 text-[12px] font-bold text-[var(--dc-orange)]"
            >
              Reset día
            </button>
          </div>
        </header>

        {/* Scrollable content — the body never scrolls, only this region. */}
        <main
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="mx-auto w-full max-w-md">
            {tab === "dashboard" && <Dashboard onGo={(t) => setTab(t as TabId)} />}
            {tab === "plan" && <MealPlan />}
            {tab === "compra" && <Shopping />}
            {tab === "fuera" && <EatingOut />}
            {tab === "supps" && <Supplements />}
            {tab === "track" && <Tracking />}
            <div className="h-4" />
          </div>
        </main>

        <TabBar active={tab} onChange={setTab} />
      </div>
    </DietContext.Provider>
  );
}

function IconSun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}
