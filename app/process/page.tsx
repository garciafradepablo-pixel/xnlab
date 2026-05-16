import type { Metadata } from "next";
import Process from "./_process";

export const metadata: Metadata = {
  title: "Process — How XNLAB Builds Digital Atmospheres and Brand Worlds",
  description:
    "XNLAB's process moves through Diagnose, Direct, Build and Activate — closing the perception gap between a brand's real-world experience and digital presence.",
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
