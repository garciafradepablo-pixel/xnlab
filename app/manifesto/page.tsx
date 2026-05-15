import type { Metadata } from "next";
import Manifesto from "./_manifesto";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Six statements that describe how Xnlab Studio thinks about worldbuilding, atmosphere, and the discipline of restraint.",
  alternates: { canonical: "/manifesto" },
  openGraph: {
    title: "Manifesto · Xnlab Studio",
    description: "How we think about worldbuilding, atmosphere, and restraint.",
    url: "https://xnlab.io/manifesto",
    type: "article",
  },
};

export default function Page() {
  return <Manifesto />;
}
