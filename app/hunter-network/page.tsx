import type { Metadata } from "next";
import HunterNetworkPage from "./_hunter-network";

// Hunter Network — the public face of the evaluated-seller network. Like
// /network, this is a campaign/door surface shared by direct link, not an SEO
// entry point, so it stays out of the index and out of sitemap.ts. The internal
// operator console (the application that runs the network) is a separate
// surface that lives in Connect, the internal app — not here.
export const metadata: Metadata = {
  title: "Hunter Network — XNLAB",
  description:
    "A private, performance-based network of evaluated remote Spanish-speaking sellers. Access is earned through a Commercial Access Evaluation — campaign access is bought by performance, never by payment. By request.",
  alternates: { canonical: "/hunter-network" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HunterNetworkPage />;
}
