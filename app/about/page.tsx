import type { Metadata } from "next";
import About from "./_about";

export const metadata: Metadata = {
  title: "About — Global Creative Direction Studio",
  description:
    "Xnlab Studio is a global creative direction agency for luxury hospitality, nightlife venues, emotional architecture and cultural brands. We design atmospheres, brand identities and visual systems for clients worldwide. Boutique studio, by appointment only.",
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
