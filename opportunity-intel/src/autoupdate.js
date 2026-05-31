// =============================================================================
// autoupdate.js — Recarga automática cuando hay un deploy nuevo.
//
// El workflow de despliegue reescribe VERSION.txt con un timestamp en cada
// publicación. Cada ventana abierta vigila ese archivo; si cambia respecto al
// que cargó, recarga sola → todas las pestañas y dispositivos saltan a la última
// versión sin que nadie tenga que hacer Cmd+Shift+R.
//
// Cuidados: no recarga mientras escribes (no se pierde lo tecleado); si no hay
// VERSION.txt (p.ej. en local) no hace nada; tolera fallos de red sin romper.
// =============================================================================

const POLL_MS = 45000; // cada 45 s; ligero y suficiente

async function fetchVersion() {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`VERSION.txt?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const t = (await res.text()).trim();
    return t || null;
  } catch {
    return null;
  }
}

// No interrumpir si el usuario está escribiendo (input/textarea/editable).
function busyTyping() {
  if (typeof document === "undefined") return false;
  const a = document.activeElement;
  if (!a) return false;
  const tag = (a.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || a.isContentEditable === true;
}

let started = false;

/** Arranca la vigilancia de versión. Idempotente. */
export async function startAutoUpdate() {
  if (started || typeof window === "undefined") return;
  started = true;
  const booted = await fetchVersion();
  if (!booted) return; // sin VERSION.txt → nada que vigilar (local/dev)
  setInterval(async () => {
    const v = await fetchVersion();
    if (!v || v === booted) return;
    if (busyTyping()) return; // recargará en el siguiente ciclo, sin perder lo escrito
    try { location.reload(); } catch { /* */ }
  }, POLL_MS);
  // Además, al volver a la pestaña tras un rato, comprueba de inmediato.
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState !== "visible") return;
      const v = await fetchVersion();
      if (v && v !== booted && !busyTyping()) { try { location.reload(); } catch { /* */ } }
    });
  }
}
