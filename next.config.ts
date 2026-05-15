import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // SEO slug rename — keep old paths working with 301 redirects so any
      // existing inbound link or cached crawler request lands on the new URL.
      { source: "/worlds/hospitality", destination: "/worlds/hospitality-experience", permanent: true },
      { source: "/worlds/nightlife", destination: "/worlds/nightlife-cultural-events", permanent: true },
      { source: "/worlds/lifestyle", destination: "/worlds/luxury-lifestyle-brands", permanent: true },
      { source: "/worlds/architecture", destination: "/worlds/architecture-spatial-design", permanent: true },
      { source: "/worlds/music", destination: "/worlds/music-cultural-artists", permanent: true },
      { source: "/worlds/digital", destination: "/worlds/cultural-digital-worlds", permanent: true },
    ];
  },
};

export default nextConfig;
