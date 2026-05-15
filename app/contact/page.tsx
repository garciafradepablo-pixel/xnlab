import type { Metadata } from "next";
import Contact from "./_contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with XNLAB. By appointment only — collaborations in hospitality, nightlife, architecture and cultural identity.",
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
