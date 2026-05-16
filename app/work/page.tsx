import type { Metadata } from "next";
import WorkIndex from "./_work-index";
import { projects } from "./data";

export const metadata: Metadata = {
  title: "Selected Studies — XNLAB Internal Visual Systems",
  description:
    "Explore internal XNLAB studies showing how the studio designs atmosphere, identity, campaign systems and digital presence.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Selected Studies · XNLAB",
    description:
      "Internal visual systems showing how XNLAB designs atmosphere, identity and digital presence.",
    url: "https://xnlab.io/work",
    type: "website",
  },
};

export default function Page() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Selected Works",
    description: "Selected projects by Xnlab Studio.",
    numberOfItems: projects.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://xnlab.io/work/${p.slug}`,
      name: p.title,
      image: `https://xnlab.io${p.hero}`,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <WorkIndex projects={projects} />
    </>
  );
}
