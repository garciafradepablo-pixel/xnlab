import type { Metadata } from "next";
import Manifesto from "./_manifesto";
import { getNonce } from "../_lib/csp";

const SITE = "https://xnlab.io";

export const metadata: Metadata = {
  title: "Manifesto",
  description:
    "Six statements that describe how Xnlab Studio thinks about worldbuilding, atmosphere, and the discipline of restraint.",
  keywords: [
    "XNLAB manifesto",
    "creative direction manifesto",
    "atmosphere worldbuilding",
    "restraint as practice",
    "premium brand philosophy",
  ],
  alternates: { canonical: "/manifesto" },
  openGraph: {
    title: "Manifesto · Xnlab Studio",
    description: "How we think about worldbuilding, atmosphere, and restraint.",
    url: `${SITE}/manifesto`,
    type: "article",
  },
};

// Article JSON-LD so the manifesto surfaces as a rich result when
// search engines (and AI assistants) crawl the studio's philosophy.
// Six statements declared as articleBody so the entity comes through
// even when the page is parsed without rendering.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "XNLAB Manifesto — Six Statements",
      description:
        "Six statements that describe how Xnlab Studio thinks about worldbuilding, atmosphere, and the discipline of restraint.",
      author: { "@type": "Organization", name: "XNLAB", url: SITE },
      publisher: {
        "@type": "Organization",
        name: "XNLAB",
        url: SITE,
        logo: { "@type": "ImageObject", url: `${SITE}/icon` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/manifesto` },
      articleSection: "Manifesto",
      inLanguage: ["en", "es"],
      articleBody: [
        "We design presence, not content.",
        "We work in silence — and call it concentration.",
        "Atmospheres before identities. Identities before logos.",
        "A space well designed is a space well remembered.",
        "Restraint is the loudest tool we own.",
        "Worlds are built slowly. We are patient.",
      ].join(" · "),
      keywords: "manifesto, worldbuilding, atmosphere, restraint, presence, creative direction",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Manifesto", item: `${SITE}/manifesto` },
      ],
    },
  ],
};

export default async function Page() {
  const nonce = await getNonce();
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Manifesto />
    </>
  );
}
