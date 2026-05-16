import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { worlds, getWorld } from "../../_lib/worlds";
import WorldDetail from "./_world";

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
  return {
    title,
    description,
    alternates: { canonical: `/worlds/${w.slug}` },
    openGraph: {
      title: `${w.title.en} · XNLAB`,
      description,
      url: `https://xnlab.io/worlds/${w.slug}`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${world.title.en} — ${world.color.name}`,
        description: world.pitch.en,
        author: {
          "@type": "Organization",
          name: "XNLAB",
          url: "https://xnlab.io",
        },
        publisher: {
          "@type": "Organization",
          name: "XNLAB",
          url: "https://xnlab.io",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://xnlab.io/worlds/${world.slug}`,
        },
        articleSection: "Worlds",
        inLanguage: ["en", "es"],
        keywords: [world.title.en, world.color.name, "XNLAB", "creative direction", "digital atmosphere"].join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://xnlab.io" },
          { "@type": "ListItem", position: 2, name: "Worlds", item: "https://xnlab.io/worlds" },
          {
            "@type": "ListItem",
            position: 3,
            name: world.title.en,
            item: `https://xnlab.io/worlds/${world.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorldDetail world={world} />
    </>
  );
}
