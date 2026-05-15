import type { Metadata } from "next";
import Contact from "./_contact";

export const metadata: Metadata = {
  title: "Contact — Start a Creative Direction Collaboration",
  description:
    "Contact Xnlab Studio for creative direction, brand identity and atmosphere design in luxury hospitality, nightlife, architecture or cultural identity. Worldwide engagements. By appointment only.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact · XNLAB",
    description: "Start a conversation. By appointment only.",
    url: "https://xnlab.io/contact",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Contact />;
}
