import { NextRequest, NextResponse } from "next/server";

// Per-request Content-Security-Policy with a fresh nonce.
//
// The site emits a few inline JSON-LD blocks (Organization, WebSite,
// per-page Service / Article / Breadcrumb). A strict CSP without
// nonces would block them, and using 'unsafe-inline' on script-src
// erases most of the protection CSP provides. Instead we mint a
// base64 nonce per request, attach it to the request headers so
// every server component can read it via `next/headers`, and emit it
// in the CSP `script-src` directive. The inline scripts then carry
// `nonce={…}` and pass.
//
// `'strict-dynamic'` is added in production so any script trusted by
// the nonce can load additional scripts — required for Next/React
// runtime bootstrap chunks that import other chunks. In dev we add
// `'unsafe-eval'` and `'unsafe-inline'` (alongside the nonce) because
// Turbopack/React-Refresh use eval and inject inline boot scripts
// without nonces during HMR.
//
// `style-src` keeps `'unsafe-inline'` everywhere because React inline
// `style={...}` attributes (used heavily across this site) cannot be
// hashed individually and `style-src-attr` browser support is too
// thin to rely on for production hardening today.

const SELF = "'self'";
const NONE = "'none'";

function buildCsp(nonce: string, isDev: boolean): string {
  const scriptSrc = isDev
    ? [SELF, `'nonce-${nonce}'`, "'strict-dynamic'", "'unsafe-eval'", "'unsafe-inline'"]
    : [SELF, `'nonce-${nonce}'`, "'strict-dynamic'", "https:"];

  // Vercel Analytics endpoints — script chunk + insights ingest.
  const connectSrc = isDev
    ? [SELF, "https:", "ws:", "wss:"]
    : [SELF, "https://vitals.vercel-insights.com", "https://*.vercel-analytics.com"];

  const directives: Record<string, string[]> = {
    "default-src": [SELF],
    "script-src": scriptSrc,
    "style-src": [SELF, "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": [SELF, "data:", "blob:", "https:"],
    "font-src": [SELF, "data:", "https://fonts.gstatic.com"],
    "connect-src": connectSrc,
    "media-src": [SELF, "data:", "blob:"],
    "object-src": [NONE],
    "base-uri": [SELF],
    "form-action": [SELF, "mailto:"],
    "frame-ancestors": [NONE],
    "frame-src": [NONE],
    "worker-src": [SELF, "blob:"],
    "manifest-src": [SELF],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

export function proxy(request: NextRequest) {
  // 16 random bytes → 24-char base64 nonce. Crypto.randomUUID would
  // also work; bytes give us slightly more entropy per character.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const nonce = btoa(String.fromCharCode(...bytes));

  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildCsp(nonce, isDev);
  // CSP header value cannot contain newlines — collapse any accidental
  // whitespace runs and trim. Defensive against future edits.
  const cspHeader = csp.replace(/\s{2,}/g, " ").trim();

  // Make the nonce visible to server components on this request, plus
  // mirror the CSP into request headers so server-side renders can be
  // aware of it if needed. Then attach the CSP to the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

// Run CSP on HTML routes only. Static assets, image optimizer and the
// OG generator do not need CSP headers and would only add overhead.
export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2)).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
