import type { Metadata } from "next";
import About from "./_about";

export const metadata: Metadata = {
  title: "About",
  description:
    "XNLAB is a creative direction studio that designs atmospheres, identities and visual systems for hospitality, nightlife, architecture and cultural identity. By appointment only.",
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
