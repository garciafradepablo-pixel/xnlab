import type { Metadata } from "next";
import PerceptionAudit from "./_perception-audit";

const TITLE = "Perception Audit — XNLAB";
const DESCRIPTION =
  "The Perception Audit is the diagnosis every XNLAB engagement begins with. We map the gap between what your brand is worth in person and what the market reads online — surface by surface — and hand you the fastest path to closing it. By application.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/perception-audit" },
  openGraph: {
    title: "Perception Audit · XNLAB",
    description:
      "See the gap before the market does. A structured reading of how your brand is perceived across every surface — and the fastest path to closing it. By application.",
    url: "https://xnlab.io/perception-audit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perception Audit · XNLAB",
    description:
      "See the gap before the market does. The diagnosis every engagement begins with. By application.",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <PerceptionAudit />;
}
