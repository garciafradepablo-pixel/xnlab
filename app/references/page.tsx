import type { Metadata } from "next";
import References from "./_references";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Books, architects, films, hotels and makers that inform the work at Xnlab Studio. A curated reference set, not a portfolio.",
  alternates: { canonical: "/references" },
  openGraph: {
    title: "Library · Xnlab Studio",
    description: "The studio's reading list. Books, architects, films, perfumers, hotels.",
    url: "https://xnlab.io/references",
    type: "article",
  },
};

export default function Page() {
  return <References />;
}
