/* Hunter Network — service worker.
 *
 * Registered with scope "/hunter-network" only, so it NEVER controls the rest
 * of the XNLAB site — no risk of stale-caching the premium marketing surface.
 *
 * Strategy, deliberately conservative:
 *   • Navigations (the HN document): network-first, fall back to the cached
 *     shell when offline. The visitor always gets the latest page when online.
 *   • Static icons/manifest: cache-first (they rarely change).
 *   • Everything else: passthrough (let the network handle it).
 *
 * It exists mainly so the browser offers "Install / Add to Home Screen" and so
 * the app opens instantly and survives a flaky connection. No API/form POSTs
 * are ever cached.
 */
const CACHE = "hn-shell-v1";
const SHELL = ["/hunter-network", "/hn.webmanifest", "/hn-icon-192.png", "/hn-icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only ever touch GET requests inside our scope. Forms/APIs (POST) pass through.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Document navigations → network-first with offline shell fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/hunter-network", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/hunter-network").then((r) => r || caches.match("/hunter-network"))),
    );
    return;
  }

  // Static shell assets → cache-first.
  if (SHELL.includes(url.pathname) || url.pathname.startsWith("/hn-icon")) {
    event.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
