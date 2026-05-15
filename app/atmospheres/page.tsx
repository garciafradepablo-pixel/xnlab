import type { Metadata } from "next";
import Atmospheres from "./_atmospheres";

export const metadata: Metadata = {
  title: "Atmospheres — Sensory Notes from the Studio",
  description:
    "Six atmospheric vignettes from Xnlab Studio — sensory snapshots of the rooms, hours and surfaces we design. One vignette per World Core.",
  alternates: { canonical: "/atmospheres" },
  openGraph: {
    title: "Atmospheres · Xnlab Studio",
    description: "Six sensory snapshots, one per World Core.",
    url: "https://xnlab.io/atmospheres",
    type: "article",
  },
};

export default function Page() {
  return <Atmospheres />;
}
