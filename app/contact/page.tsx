import type { Metadata } from "next";
import Contact from "./_contact";

export const metadata: Metadata = {
  title: "Apply for a Project — XNLAB Digital Atmosphere Studio",
  description:
    "Apply to work with XNLAB on a cinematic website, campaign system, brand world, visual engine or digital atmosphere project.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Apply for a Project · XNLAB",
    description: "Apply to work with XNLAB on a cinematic website, brand world or digital atmosphere project.",
    url: "https://xnlab.io/contact",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Contact />;
}
