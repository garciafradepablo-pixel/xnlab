import type { Metadata } from "next";
import WorkIndex from "./_work-index";
import { projects } from "./data";
import { getNonce } from "../_lib/csp";

export const metadata: Metadata = {
  title: "Atelier Studies — Internal Visual Systems",
  description:
    "Internal XNLAB studies published while the first wave of client work matures. Aesthetic exercises in atmosphere, identity, campaign systems and digital presence — the same framework used in every engagement.",
  alternates: { canonical: "/studies" },
  openGraph: {
    title: "Atelier Studies · XNLAB",
    description:
      "Internal visual systems from the studio — atmosphere, identity, campaign systems and digital presence.",
    url: "https://xnlab.io/studies",
    type: "website",
  },
};

export default async function Page() {
  const nonce = await getNonce();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Atelier Studies",
    description: "Internal visual systems by Xnlab Studio.",
    numberOfItems: projects.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://xnlab.io/studies/${p.slug}`,
      name: p.title,
      image: `https://xnlab.io${p.hero}`,
    })),
  };
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <WorkIndex projects={projects} />
    </>
  );
}
