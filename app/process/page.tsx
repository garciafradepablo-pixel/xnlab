import type { Metadata } from "next";
import Process from "./_process";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How Xnlab Studio works — listening, mapping atmospheres, building the system, living with the work. Slow, deliberate, intentional.",
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
