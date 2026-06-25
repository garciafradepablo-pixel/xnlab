"use client";
import { useEffect } from "react";
import { Shell } from "./_components/Shell";

export default function DietCoachPage() {
  // Register the PWA service worker (best-effort; offline shell only).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/diet-coach/sw.js", { scope: "/diet-coach/" }).catch(() => {
      /* SW unsupported / blocked — app still works online */
    });
  }, []);

  return <Shell />;
}
