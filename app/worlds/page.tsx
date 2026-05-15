import type { Metadata } from "next";
import Worlds from "./_worlds";

export const metadata: Metadata = {
  title: "The Universe — Worlds, ORUN & CHIO",
  description:
    "Inside the Xnlab Studio universe: the Central Core, six World Cores (Hospitality, Nightlife, Lifestyle, Architecture, Music, Digital) and the mythology of ORUN and CHIO. A living creative laboratory.",
  alternates: { canonical: "/worlds" },
  openGraph: {
    title: "The Universe · Xnlab Studio",
    description:
      "Six World Cores, one Central Core, and the mythology that holds them — ORUN, CHIO and the anomalies.",
    url: "https://xnlab.io/worlds",
    type: "article",
  },
};

export default function Page() {
  return <Worlds />;
}
