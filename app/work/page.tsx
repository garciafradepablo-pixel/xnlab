import type { Metadata } from "next";
import WorkIndex from "./_work-index";
import { projects } from "./data";

export const metadata: Metadata = {
  title: "Selected Works — Boutique Hotel, Nightlife & Architecture Projects",
  description:
    "Selected creative direction projects by Xnlab Studio: brand identities, atmosphere design and visual systems for luxury hospitality, boutique hotels, nightclubs, restaurants and cultural architecture. Worldwide engagements.",
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
