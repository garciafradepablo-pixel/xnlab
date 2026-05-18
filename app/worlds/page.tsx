import type { Metadata } from "next";
import Worlds from "./_worlds";

export const metadata: Metadata = {
  title: "Worlds — Six Surfaces of Modern Brand-Building · XNLAB",
  description:
    "The six XNLAB worlds — product, owned digital, retail and physical, customer operations, communication and community. The six surfaces where a modern brand reaches its customer, each with its own physics.",
  alternates: { canonical: "/worlds" },
  openGraph: {
    title: "Worlds · Six Surfaces of Modern Brand-Building · XNLAB",
    description:
      "Six surfaces where a modern brand touches its customer. Each one calibrated, each one signed by the same hand.",
    url: "https://xnlab.io/worlds",
    type: "article",
  },
};

export default function Page() {
  return <Worlds />;
}
