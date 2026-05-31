import type { Metadata } from "next";
import type { ReactNode } from "react";

// Hunter Network is an internal operator console, not a public surface. It is
// kept out of the index and out of sitemap.ts (same convention as /network and
// the /dossier gate) so the studio's public face stays the six worlds. The
// route still resolves for anyone with the link; noindex only stops crawlers
// from listing it. No PII is published — the seeded data is fictional.
export const metadata: Metadata = {
  title: "Hunter Network — Connect",
  description: "Private performance-based network of evaluated remote sellers. Internal operator console.",
  robots: { index: false, follow: false },
};

export default function HunterNetworkLayout({ children }: { children: ReactNode }) {
  return children;
}
