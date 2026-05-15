import type { Metadata } from "next";
import Imprint from "./_imprint";

export const metadata: Metadata = {
  title: "Colophon",
  description:
    "Studio details, typography credits, technical colophon, and a brief privacy and terms note for Xnlab Studio.",
  alternates: { canonical: "/imprint" },
  openGraph: {
    title: "Colophon · Xnlab Studio",
    description: "Studio details, typography credits, and brief legal note.",
    url: "https://xnlab.io/imprint",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Imprint />;
}
