import type { Metadata } from "next";
import Reading from "./_reading";

export const metadata: Metadata = {
  title: "A short reading",
  description:
    "Five quiet questions. The studio reads, then replies in person when the work suggests a fit. A second door into XNLAB for visitors not yet ready to write.",
  alternates: { canonical: "/reading" },
  openGraph: {
    title: "A short reading · XNLAB",
    description:
      "Five questions. The studio reads, then replies — when there is fit.",
    url: "https://xnlab.io/reading",
    type: "article",
  },
};

export default function Page() {
  return <Reading />;
}
