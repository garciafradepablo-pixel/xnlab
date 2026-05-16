import type { Metadata } from "next";
import Services from "./_services";

const TITLE = "Services — Cinematic Websites, Campaign Systems & Brand Worlds · XNLAB";
const DESCRIPTION =
  "Explore XNLAB's fixed-scope creative direction engagements: campaign systems, digital atmospheres, brand worlds, visual engines, SEO layers and perception upgrade sprints.";

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
    desc:
      "Focused launch system across digital surfaces — campaign visuals, micro-pages, motion, copy.",
  },
  {
    name: "Digital Atmosphere",
    desc:
      "Cinematic single-page world. Direction, motion, structured data, technical build.",
  },
  {
    name: "Brand World",
    desc:
      "Full multi-page system. Visual language, motion, copy, build, launch.",
  },
  {
    name: "Visual Engine",
    desc:
      "Continuous creative system — campaigns, visual production, AI-assisted direction.",
  },
  {
    name: "SEO & Conversion Layer",
    desc:
      "For existing websites that look good but are not being found, understood or converted. Technical SEO, structured data, analytics and conversion tuning.",
  },
  {
    name: "Perception Upgrade Sprint",
    desc:
      "A focused two-to-four-week upgrade for brands whose digital presence no longer matches the level of the product.",
  },
];

const faqs = [
  {
    q: "How do you bill?",
    a: "Fixed-scope projects, paid in milestones (typically 40% / 30% / 30%). Monthly engagements bill in advance.",
  },
  {
    q: "Do you work with agencies or in-house teams?",
    a: "Yes. We collaborate with internal marketing and brand teams. We are happy to white-label when the relationship asks for it.",
  },
  {
    q: "What languages do you deliver in?",
    a: "We deliver in English and Spanish, natively. Other languages are available on request.",
  },
  {
    q: "What stack do you build on?",
    a: "Next.js, modern motion, AI-enhanced production. Hosted on Vercel by default. We are open to existing stacks.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    ...services.map((s) => ({
      "@type": "Service",
      name: s.name,
      description: s.desc,
      provider: { "@type": "Organization", name: "XNLAB", url: "https://xnlab.io" },
      areaServed: "Worldwide",
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        availabilityStarts: "2026-01-01",
        url: "https://xnlab.io/contact",
      },
    })),
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://xnlab.io" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://xnlab.io/services" },
      ],
    },
  ],
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
