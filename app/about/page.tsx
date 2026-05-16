import type { Metadata } from "next";
import About from "./_about";

export const metadata: Metadata = {
  title: "About — XNLAB Digital Atmosphere Studio",
  description:
    "XNLAB is a Digital Atmosphere Studio building cinematic websites, campaign systems and visual worlds for luxury hospitality, nightlife venues, lifestyle brands, architecture and cultural projects worldwide. Boutique studio, by appointment only.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · XNLAB",
    description:
      "A worldbuilding studio for modern luxury. We design how a brand is remembered, not what it says.",
    url: "https://xnlab.io/about",
    type: "website",
  },
};

export default function Page() {
  return <About />;
}
