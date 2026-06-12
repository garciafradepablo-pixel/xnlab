import type { Metadata } from "next";
import Contact from "./_contact";

export const metadata: Metadata = {
  title: "Write to the studio",
  description:
    "Write to XNLAB. Atmosphere systems across six surfaces — product, owned digital, retail and physical, customer operations, communication and community. By appointment. A small number of selected engagements remain for 2026.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Write to the studio · XNLAB",
    description:
      "Atmosphere systems for brands, customers and channels. By appointment.",
    url: "https://xnlab.io/contact",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Contact />;
}
