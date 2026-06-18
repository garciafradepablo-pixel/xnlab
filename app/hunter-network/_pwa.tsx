"use client";
// ---------------------------------------------------------------------------
// Hunter Network — PWA glue (install + service worker).
//
// Two small jobs, both client-only so they pass the site's strict CSP (no
// inline <script>, just normal client JS):
//   1. Register /hn-sw.js scoped to /hunter-network, so the app is installable
//      and works offline — without the worker ever touching the rest of the site.
//   2. Catch the `beforeinstallprompt` event and surface a quiet "Install app"
//      pill (Android/desktop Chrome). iOS has no such event; for Safari we show
//      a one-line hint on how to "Add to Home Screen" instead.
//
// Nothing here is essential to the page — it degrades to nothing if the browser
// doesn't support service workers or install prompts.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useLang, useMounted } from "../_lib/atoms";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const COPY = {
  en: { install: "Install app", ios: "Tap Share, then “Add to Home Screen” to install.", dismiss: "Dismiss" },
  es: { install: "Instalar app", ios: "Pulsa Compartir y “Añadir a inicio” para instalar.", dismiss: "Cerrar" },
};

// iOS Safari has no install event — detect it (client-only) so we can show a
// "how to add to home screen" hint instead. Computed during render off a
// mounted gate (server snapshot false), never via setState in an effect.
function isIosNotInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isIOS && !standalone;
}

export default function HNInstall() {
  const [lang] = useLang();
  const t = COPY[lang];
  const mounted = useMounted();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Register the worker after load so it never blocks first paint.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/hn-sw.js", { scope: "/hunter-network" }).catch(() => {});
    }
    // setState in an event handler (not directly in the effect) is allowed and
    // is the only way to catch the install prompt.
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // Derived in render — no setState cascade. iOS hint only after mount.
  const iosHint = mounted && isIosNotInstalled();

  if (hidden) return null;
  if (!deferred && !iosHint) return null;

  const onInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    setHidden(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "max(18px, env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0.6rem 0.7rem 0.6rem 1.1rem",
        borderRadius: 100,
        background: "rgba(12,9,6,0.92)",
        border: "1px solid rgba(255,138,76,0.4)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 10px 50px rgba(0,0,0,0.5)",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,138,76,0.95)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
        </svg>
        {deferred ? t.install : t.ios}
      </span>
      {deferred ? (
        <button
          onClick={onInstall}
          className="hn-focus"
          style={{ padding: "0.5rem 1.1rem", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a0d04", background: "linear-gradient(100deg, rgba(255,138,76,1), rgba(232,183,131,1))", border: "none", borderRadius: 100, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}
        >
          {t.install}
        </button>
      ) : (
        <button onClick={() => setHidden(true)} aria-label={t.dismiss} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 6px" }}>
          ×
        </button>
      )}
    </div>
  );
}
