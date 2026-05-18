import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { worlds, getWorld } from "../../_lib/worlds";
import WorldDetail from "./_world";
import { getNonce } from "../../_lib/csp";

const SITE = "https://xnlab.io";

export async function generateStaticParams() {
  return worlds.map((w) => ({ slug: w.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = getWorld(slug);
  if (!w) return {};
  const title = `${w.title.en} — XNLAB World ${w.number}`;
  const description = w.pitch.en;
  // No explicit openGraph.images / twitter.images — the colocated
  // opengraph-image.tsx in this same route segment is auto-discovered
  // by Next and used as the share card. Setting an explicit URL here
  // would override the dynamic per-world OG card with a static image.
  return {
    title,
    description,
    keywords: [
      w.title.en,
      w.title.es,
      `${w.color.name} world`,
      "XNLAB",
      "creative direction",
      "brand worldbuilding",
      "premium brand identity",
    ],
    alternates: { canonical: `/worlds/${w.slug}` },
    openGraph: {
      title: `${w.title.en} · XNLAB`,
      description,
      url: `${SITE}/worlds/${w.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${w.title.en} · XNLAB`,
      description,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();

  // Richer @graph for the World page:
  // - Article: the editorial essay (already there)
  // - Service: the commercial offer attached to this World (helps the
  //   page rank for "<sector> brand identity" / "<sector> creative
  //   direction" search intents)
  // - CreativeWork: the World itself as a cultural object — the
  //   visual/atmospheric system XNLAB authors for that sector
  // - BreadcrumbList: trail for rich results
  const url = `${SITE}/worlds/${world.slug}`;
  const ogImage = world.discipline?.image
    ? `${SITE}${world.discipline.image}`
    : `${SITE}/images/01_hero_chrome.jpg`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${world.title.en} — ${world.color.name}`,
        description: world.pitch.en,
        image: [ogImage],
        author: {
          "@type": "Organization",
          name: "XNLAB",
          url: SITE,
        },
        publisher: {
          "@type": "Organization",
          name: "XNLAB",
          url: SITE,
          logo: {
            "@type": "ImageObject",
            url: `${SITE}/icon`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        articleSection: "Worlds",
        inLanguage: ["en", "es"],
        keywords: [
          world.title.en,
          world.title.es,
          world.color.name,
          "XNLAB",
          "creative direction",
          "digital atmosphere",
          "brand worldbuilding",
        ].join(", "),
      },
      {
        "@type": "Service",
        name: `${world.title.en} — Creative Direction`,
        serviceType: `${world.title.en} brand identity and atmospheric direction`,
        description: world.pitch.en,
        provider: {
          "@type": "Organization",
          name: "XNLAB",
          url: SITE,
        },
        areaServed: "Worldwide",
        audience: {
          "@type": "Audience",
          audienceType: world.title.en,
        },
        url,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/LimitedAvailability",
          url: `${SITE}/contact`,
        },
        inLanguage: ["en", "es"],
      },
      {
        "@type": "CreativeWork",
        name: world.title.en,
        alternativeHeadline: world.essence.en,
        description: world.pitch.en,
        creator: {
          "@type": "Organization",
          name: "XNLAB",
          url: SITE,
        },
        material: world.material.en,
        about: world.color.name,
        keywords: [world.title.en, world.color.name, "atmosphere", "worldbuilding"].join(", "),
        inLanguage: ["en", "es"],
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Worlds", item: `${SITE}/worlds` },
          {
            "@type": "ListItem",
            position: 3,
            name: world.title.en,
            item: url,
          },
        ],
      },
    ],
  };

  const nonce = await getNonce();
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorldDetail world={world} />
    </>
  );
}
