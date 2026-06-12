import type { Metadata } from "next";
import Dossier from "./_dossier";

export const metadata: Metadata = {
  title: "Studio dossier",
  description:
    "The XNLAB studio dossier for cycle MMXXVI. How the studio operates, the six surfaces, the six systems, the AI position, the discovery protocol. By request.",
  alternates: { canonical: "/dossier" },
  openGraph: {
    title: "Studio dossier · XNLAB",
    description:
      "The studio's working notes for MMXXVI — six surfaces, six systems, discovery protocol. By request.",
    url: "https://xnlab.io/dossier",
    type: "website",
  },
  // The landing is indexable. The content behind the gate is delivered
  // post-submission; crawlers see only the gate, which is the desired
  // public face of this conversion surface.
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Dossier />;
}
