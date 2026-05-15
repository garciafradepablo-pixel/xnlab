import type { Metadata } from "next";
import Collaboration from "./_collaboration";

export const metadata: Metadata = {
  title: "Collaboration",
  description:
    "How to work with Xnlab Studio. When to reach out, what to send, what the first conversation looks like, and how a typical engagement unfolds.",
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
