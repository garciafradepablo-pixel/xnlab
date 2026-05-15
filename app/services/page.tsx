import type { Metadata } from "next";
import Services from "./_services";

const TITLE = "Services — Cinematic Web, Campaigns and Brand Worlds";
const DESCRIPTION =
  "Six engagements at XNLAB: Campaign Systems, Digital Atmospheres, Brand Worlds, Visual Engines, Technical/Growth Add-ons and Upgrade Sprints. Pricing in EUR. By application only.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: {
    title: `${TITLE} · XNLAB`,
    description: DESCRIPTION,
    url: "https://xnlab.io/services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} · XNLAB`,
    description: DESCRIPTION,
  },
};

const services = [
  {
    name: "Campaign System",
    price: "5000",
    desc:
      "Focused launch system across digital surfaces — campaign visuals, micro-pages, motion, copy.",
  },
  {
    name: "Digital Atmosphere",
    price: "10000",
    desc:
      "Cinematic single-page world. Direction, motion, structured data, technical build.",
  },
  {
    name: "Brand World",
    price: "25000",
    desc:
      "Full multi-page system. Visual language, motion, copy, build, launch.",
  },
  {
    name: "Visual Engine",
    price: "4000",
    unit: "MONTH",
    desc:
      "Continuous creative system — campaigns, visual production, AI-assisted direction.",
  },
  {
    name: "Technical / Growth Add-ons",
    price: "1500",
    desc:
      "SEO, analytics, structured data, conversion tuning, technical refinement.",
  },
  {
    name: "XNLAB Upgrade Sprint",
    price: "2500",
    desc:
      "Two-to-four-week intensive on an existing brand — direction, copy, surfaces, motion.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": services.map((s) => ({
    "@type": "Service",
    name: s.name,
    description: s.desc,
    provider: { "@type": "Organization", name: "XNLAB", url: "https://xnlab.io" },
    areaServed: "Worldwide",
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: s.price,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "EUR",
        minPrice: s.price,
        ...(s.unit ? { unitText: s.unit, billingIncrement: 1 } : {}),
      },
      url: "https://xnlab.io/services",
    },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Services />
    </>
  );
}
