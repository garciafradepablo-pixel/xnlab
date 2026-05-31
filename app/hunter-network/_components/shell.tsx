"use client";
// ---------------------------------------------------------------------------
// Hunter Network (HN) — operator console shell
//
// The frame every HN section renders inside: fixed top bar (wordmark, mode
// pill, EN·ES, back to Connect) + left section nav (the 8 sections) + content
// slot. Uses the studio's useLang() so HN respects the same language toggle as
// the rest of the site (house rule 6).
//
// In v1 only Overview is wired; the other nav items render as present-but-quiet
// so the information architecture is visible and the later phases drop in.
// ---------------------------------------------------------------------------

import Link from "next/link";
import type { ReactNode } from "react";
import { useLang } from "../../_lib/atoms";
import { HN_COPY, type Lang } from "../_core/i18n";
import { ACCENT, HAIR } from "./primitives";

export type HNSection = "overview" | "hunters" | "evaluations" | "testCalls" | "campaigns" | "leads" | "ranking" | "settings";

const SECTION_ORDER: HNSection[] = ["overview", "hunters", "evaluations", "testCalls", "campaigns", "leads", "ranking", "settings"];

export function HNShell({
  active,
  mode,
  children,
}: {
  active: HNSection;
  mode: "shadow" | "live";
  children: ReactNode;
}) {
  const [lang, setLang] = useLang();
  const t = HN_COPY[lang];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        color: "white",
        fontFamily: "var(--font-sans,'Inter','Helvetica Neue',sans-serif)",
      }}
    >
      <HNTopBar lang={lang} setLang={setLang} mode={mode} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr)",
          maxWidth: 1500,
          margin: "0 auto",
          padding: "calc(64px + clamp(20px,3vw,36px)) clamp(16px,4vw,48px) 80px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: "clamp(20px,3vw,44px)", alignItems: "start" }} className="hn-grid">
          <HNNav active={active} t={t} />
          <main style={{ minWidth: 0 }}>{children}</main>
        </div>
      </div>

      {/* Collapse the side nav to a horizontal scroller on narrow screens. */}
      <style>{`@media (max-width: 860px){.hn-grid{grid-template-columns:minmax(0,1fr) !important}.hn-nav{position:static !important;flex-direction:row !important;overflow-x:auto;gap:4px !important}.hn-nav a{white-space:nowrap}}`}</style>
    </div>
  );
}

function HNTopBar({ lang, setLang, mode }: { lang: Lang; setLang: (l: Lang) => void; mode: "shadow" | "live" }) {
  const t = HN_COPY[lang];
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 64,
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        background: "rgba(4,3,2,0.92)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
    >
      <nav style={{ maxWidth: 1500, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.18em", color: "white" }}>HN</span>
          <span style={{ fontSize: 11, letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} className="hn-tagline">
            {t.tagline}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ModePill mode={mode} lang={lang} />
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
          >
            <span style={{ color: lang === "en" ? "white" : "rgba(255,255,255,0.35)" }}>EN</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span style={{ color: lang === "es" ? "white" : "rgba(255,255,255,0.35)" }}>ES</span>
          </button>
        </div>
      </nav>
      <style>{`@media (max-width: 680px){.hn-tagline{display:none}}`}</style>
    </header>
  );
}

// Shadow vs live indicator. Shadow is the safe default; live reads in warning
// gold so it's never mistaken for the simulation.
function ModePill({ mode, lang }: { mode: "shadow" | "live"; lang: Lang }) {
  const t = HN_COPY[lang];
  const live = mode === "live";
  const rgb = live ? "230,120,110" : ACCENT;
  return (
    <span
      title={live ? "Live wallet / real market" : "Hidden virtual world — deterministic simulation"}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "0.28rem 0.7rem", borderRadius: 999, fontSize: 10, fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase", color: `rgba(${rgb},0.95)`, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.4)` }}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: `rgb(${rgb})`, boxShadow: `0 0 8px rgba(${rgb},0.7)` }} />
      {live ? t.mode_live : t.mode_shadow}
    </span>
  );
}

function HNNav({ active, t }: { active: HNSection; t: (typeof HN_COPY)["en"] }) {
  return (
    <nav className="hn-nav" style={{ position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 2 }}>
      {SECTION_ORDER.map((s) => {
        const on = s === active;
        const href = s === "overview" ? "/hunter-network" : `/hunter-network/${slug(s)}`;
        return (
          <Link
            key={s}
            href={href}
            style={{
              display: "block",
              padding: "9px 12px",
              borderRadius: 9,
              fontSize: 13,
              letterSpacing: "0.01em",
              textDecoration: "none",
              color: on ? "white" : "rgba(255,255,255,0.55)",
              background: on ? `rgba(${ACCENT},0.08)` : "transparent",
              border: `1px solid ${on ? `rgba(${ACCENT},0.3)` : "transparent"}`,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {t.nav[s]}
          </Link>
        );
      })}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${HAIR}` }}>
        <Link href="/network" style={{ display: "block", padding: "9px 12px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          {t.back}
        </Link>
      </div>
    </nav>
  );
}

// Map a section key to its URL slug. Test calls is the only multi-word slug.
function slug(s: HNSection): string {
  return s === "testCalls" ? "test-calls" : s.toLowerCase();
}
