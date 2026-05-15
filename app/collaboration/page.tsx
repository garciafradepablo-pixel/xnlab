import type { Metadata } from "next";
import Collaboration from "./_collaboration";

export const metadata: Metadata = {
  title: "Collaboration — How to Engage Xnlab Studio",
  description:
    "Practical engagement guide for hospitality, nightlife and architecture clients considering working with Xnlab Studio. When to reach out, what to send, the first conversation, engagement shape. Boutique studio, four to six clients per year.",
  alternates: { canonical: "/collaboration" },
  openGraph: {
    title: "Collaboration · Xnlab Studio",
    description: "How to work with us — practical notes for serious inquiries.",
    url: "https://xnlab.io/collaboration",
    type: "article",
  },
};

export default function Page() {
  return <Collaboration />;
}
