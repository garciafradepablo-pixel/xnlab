import type { Metadata } from "next";
import NetworkWindow from "./_network";

// The network window is a campaign surface — shared by direct link on
// social, LinkedIn and ads, not an SEO entry point. It is kept out of the
// index (and out of sitemap.ts) so the studio's public face stays the six
// worlds, not a recruitment door. The link still resolves for anyone who
// has it; noindex only keeps crawlers from listing it.
export const metadata: Metadata = {
  title: "The network",
  description:
    "The studio's collaborator window for cycle MMXXVI. Four disciplines — distribution, systems, creation, direction. By request.",
  alternates: { canonical: "/network" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NetworkWindow />;
}
