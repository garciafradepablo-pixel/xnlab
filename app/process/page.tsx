import type { Metadata } from "next";
import Process from "./_process";

export const metadata: Metadata = {
  title: "Process — How Xnlab Studio Designs Brand Worlds",
  description:
    "The Xnlab Studio creative direction process for luxury hospitality, nightlife and architecture projects: listening, mapping atmospheres, building visual systems and living with the work through opening. Tangible deliverables included.",
  alternates: { canonical: "/process" },
  openGraph: {
    title: "Process · Xnlab Studio",
    description: "Slow, deliberate, intentional. How we work.",
    url: "https://xnlab.io/process",
    type: "website",
  },
};

export default function Page() {
  return <Process />;
}
