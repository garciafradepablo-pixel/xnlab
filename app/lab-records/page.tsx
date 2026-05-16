import type { Metadata } from "next";
import LabRecords from "./_lab-records";
import { records } from "../_lib/lab-records";

export const metadata: Metadata = {
  title: "Lab Records — Notes on Hospitality, Luxury, Music & Digital Atmosphere",
  description:
    "Editorial observations from XNLAB on hospitality branding, luxury, music identity, digital atmosphere and the future of cultural brands.",
  alternates: { canonical: "/lab-records" },
  openGraph: {
    title: "Lab Records · Xnlab Studio",
    description: "Cultural field notes on hospitality, luxury, music, architecture and digital identity.",
    url: "https://xnlab.io/lab-records",
    type: "article",
  },
};

export default function Page() {
  // JSON-LD ItemList so Google parses the archive as a structured collection
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Xnlab Studio Lab Records",
    description: "Editorial cultural observations from inside the studio.",
    numberOfItems: records.length,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: records.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://xnlab.io/lab-records/${r.slug}`,
      name: r.title.en,
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <LabRecords />
    </>
  );
}
