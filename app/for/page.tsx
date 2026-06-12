import type { Metadata } from "next";
import { verticals } from "../_lib/verticals";
import VerticalsIndex from "./_verticals-index";
import { getNonce } from "../_lib/csp";

const SITE = "https://xnlab.io";

export const metadata: Metadata = {
  title: "Sectors — Atmosphere Systems by Industry",
  description:
    "The six surfaces, applied to your industry. Hospitality, clinics, restaurants, real estate — and the next sector each cycle. By appointment.",
  keywords: [
    "atmosphere systems by industry",
    "brand systems for hospitality",
    "brand systems for clinics",
    "brand systems for restaurants",
    "brand systems for real estate",
    "industry brand direction",
    "vertical brand studio",
    "XNLAB sectors",
  ],
  alternates: {
    canonical: "/for",
    languages: { "en-US": "/for", "es-ES": "/for", "x-default": "/for" },
  },
  openGraph: {
    title: "Sectors — Atmosphere Systems by Industry · XNLAB",
    description: "The six surfaces, applied to your industry. Hospitality, clinics, restaurants, real estate — and more each cycle.",
    url: `${SITE}/for`,
    type: "website",
  },
};

export default async function Page() {
  const nonce = await getNonce();
  // ItemList of every applied vertical — gives Google a structured map
  // of the industries the studio serves, each pointing at its own page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Sectors — XNLAB",
        description:
          "The six universal surfaces, applied to each industry the studio works with.",
        url: `${SITE}/for`,
        inLanguage: ["en", "es"],
      },
      {
        "@type": "ItemList",
        name: "Applied verticals",
        itemListElement: verticals.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: v.name.en,
          description: v.seoDesc,
          url: `${SITE}/for/${v.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Sectors", item: `${SITE}/for` },
        ],
      },
    ],
  };
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        suppressHydrationWarning
      />
      <VerticalsIndex />
    </>
  );
}
