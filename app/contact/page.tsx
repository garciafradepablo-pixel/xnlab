import type { Metadata } from "next";
import Contact from "./_contact";

export const metadata: Metadata = {
  title: "Apply for a project — XNLAB",
  description:
    "Apply to work with XNLAB. Cinematic websites, campaign systems and AI-enhanced visual worlds for hospitality, architecture, wellness, nightlife and culture-led brands. By application only.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Apply for a project · XNLAB",
    description: "Apply to work with XNLAB. By application only.",
    url: "https://xnlab.io/contact",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Contact />;
}
