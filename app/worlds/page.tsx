import type { Metadata } from "next";
import Worlds from "./_worlds";

export const metadata: Metadata = {
  title: "Worlds — XNLAB Visual Systems for Hospitality, Nightlife, Luxury, Architecture & Music",
  description:
    "Explore the six XNLAB Worlds: emotional systems for hospitality, nightlife, luxury, architecture, music and digital culture.",
  alternates: { canonical: "/worlds" },
  openGraph: {
    title: "Worlds · XNLAB",
    description:
      "Six emotional systems. Six ways to build presence. The XNLAB methodology for premium brands.",
    url: "https://xnlab.io/worlds",
    type: "article",
  },
};

export default function Page() {
  return <Worlds />;
}
