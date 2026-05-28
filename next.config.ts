import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimisation.
  // - AVIF first (≈20–30% smaller than WebP) then WebP fallback. Older
  //   browsers receive the original JPG/PNG.
  // - 31-day immutable cache so optimized variants live longer in CDN.
  // - Larger device size buckets so hero PNGs that need to fill 4K
  //   screens get a proper width without next/image flooring to a
  //   smaller bucket.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1440, 1920, 2560, 3840],
  },
  // Security headers — applied to every response from the Next server.
  // - Strict-Transport-Security: force HTTPS for 2y including subdomains.
  //   `preload` makes us eligible for the HSTS preload list.
  // - X-Content-Type-Options: disables MIME-sniffing — stops a browser
  //   from interpreting a JSON response as JS, for example.
  // - X-Frame-Options: blocks the site from being iframed (clickjacking).
  // - Referrer-Policy: only send origin on cross-site requests so the
  //   destination doesn't learn the full URL the visitor came from.
  // - Permissions-Policy: deny browser APIs we never need (camera, mic,
  //   geolocation, payment), reducing the blast radius of any future
  //   third-party script.
  // - Cross-Origin-Opener-Policy: process isolation against XS-Leaks.
  // - X-DNS-Prefetch-Control: opt-in to DNS prefetch only where useful.
  // CSP is set per-request in `proxy.ts` with a fresh nonce, not here,
  // because the JSON-LD blocks use dangerouslySetInnerHTML and a
  // strict CSP would require nonces or hashes per build, which a
  // static header pipeline cannot generate.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // SEO slug rename — keep old paths working with 301 redirects so any
      // existing inbound link or cached crawler request lands on the new URL.
      // Two generations of legacy slugs map onto the new "surface" slugs.
      // Mapping is by orb position + color (visual continuity) and editorial
      // role in the universe.
      // Generation (a) — original short names.
      { source: "/worlds/hospitality", destination: "/worlds/product", permanent: true },
      { source: "/worlds/nightlife", destination: "/worlds/retail-physical", permanent: true },
      { source: "/worlds/lifestyle", destination: "/worlds/customer-operations", permanent: true },
      { source: "/worlds/architecture", destination: "/worlds/communication", permanent: true },
      { source: "/worlds/music", destination: "/worlds/owned-digital", permanent: true },
      { source: "/worlds/digital", destination: "/worlds/community-culture", permanent: true },
      // Generation (b) — hospitality-vertical slugs.
      { source: "/worlds/hotels-resorts", destination: "/worlds/product", permanent: true },
      { source: "/worlds/restaurants-bars", destination: "/worlds/owned-digital", permanent: true },
      { source: "/worlds/nightlife-venues", destination: "/worlds/retail-physical", permanent: true },
      { source: "/worlds/wellness-destinations", destination: "/worlds/customer-operations", permanent: true },
      { source: "/worlds/cultural-hospitality", destination: "/worlds/communication", permanent: true },
      { source: "/worlds/experiential-hospitality", destination: "/worlds/community-culture", permanent: true },
      // Asset-derived slugs that briefly lived as image-name URLs.
      { source: "/worlds/hospitality-experience", destination: "/worlds/product", permanent: true },
      { source: "/worlds/nightlife-cultural-events", destination: "/worlds/retail-physical", permanent: true },
      { source: "/worlds/luxury-lifestyle-brands", destination: "/worlds/customer-operations", permanent: true },
      { source: "/worlds/architecture-spatial-design", destination: "/worlds/communication", permanent: true },
      { source: "/worlds/music-cultural-artists", destination: "/worlds/owned-digital", permanent: true },
      { source: "/worlds/cultural-digital-worlds", destination: "/worlds/community-culture", permanent: true },
      // /work renamed to /studies — agency vocabulary → laboratory vocabulary.
      // Index + every slug redirect so the previous URL surface stays linkable.
      { source: "/work", destination: "/studies", permanent: true },
      { source: "/work/:slug*", destination: "/studies/:slug*", permanent: true },
      // Verticals system — /hospitality was a bespoke page; it is now the
      // first instance of the /for/[vertical] applied system. The old URL
      // 301s to its place in the system so inbound links and crawler
      // memory survive. New verticals live at /for/<slug>.
      { source: "/hospitality", destination: "/for/hospitality", permanent: true },
    ];
  },
};

export default nextConfig;
