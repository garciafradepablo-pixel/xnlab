import type { Metadata } from "next";
import Now from "./_now";

export const metadata: Metadata = {
  title: "Now — Currently in the Studio",
  description:
    "A live note from inside Xnlab Studio. What we are working on, reading, listening to and observing right now. Updated periodically.",
  alternates: { canonical: "/now" },
  openGraph: {
    title: "Now · Xnlab Studio",
    description: "A live note from inside the studio. Updated periodically.",
    url: "https://xnlab.io/now",
    type: "article",
  },
};

export default function Page() {
  return <Now />;
}
