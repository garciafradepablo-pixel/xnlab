import type { Metadata } from "next";
import WorkIndex from "./_work-index";
import { projects } from "./data";

export const metadata: Metadata = {
  title: "Selected Works",
  description:
    "Selected projects in hospitality, nightlife, architecture and cultural identity. Visual systems and atmospheres designed by XNLAB.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Selected Works · XNLAB",
    description:
      "Selected projects in hospitality, nightlife, architecture and cultural identity.",
    url: "https://xnlab.io/work",
    type: "website",
  },
};

export default function Page() {
  return <WorkIndex projects={projects} />;
}
