import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verticals, getVertical, SURFACES } from "../../_lib/verticals";
import VerticalPage from "./_vertical";
import { getNonce } from "../../_lib/csp";

const SITE = "https://xnlab.io";

export async function generateStaticParams() {
  return verticals.map((v) => ({ vertical: v.slug }));
}

// Lock the route to known verticals — unknown slugs 404 rather than
// rendering an empty shell. New verticals ship by appending to
// verticals.ts (then this list regenerates at build).
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vertical: string }>;
}): Promise<Metadata> {
  const { vertical } = await params;
  const v = getVertical(vertical);
  if (!v) return {};
  return {
    title: v.seoTitle,
    description: v.seoDesc,
    keywords: v.keywords,
    alternates: {
      canonical: `/for/${v.slug}`,
      languages: { "en-US": `/for/${v.slug}`, "es-ES": `/for/${v.slug}`, "x-default": `/for/${v.slug}` },
    },
    openGraph: {
      title: `${v.name.en} — Atmosphere Systems · XNLAB`,
      description: v.seoDesc,
      url: `${SITE}/for/${v.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${v.name.en} — Atmosphere Systems · XNLAB`,
      description: v.seoDesc,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const v = getVertical(vertical);
  if (!v) notFound();

  const url = `${SITE}/for/${v.slug}`;
  // @graph:
  // - Service: the applied offer for this industry (ranks for
  //   "<industry> brand direction / atmosphere" search intents)
  // - ItemList: the six surfaces as the structured offering, each
  //   pointing at its canonical world
  // - BreadcrumbList: Home → For → <Vertical>
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `${v.name.en} — Atmosphere Systems`,
        serviceType: v.seoDesc,
        description: v.gapIntro.en,
        provider: { "@type": "Organization", name: "XNLAB", url: SITE },
        areaServed: "Worldwide",
        audience: { "@type": "Audience", audienceType: v.name.en },
        url,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/LimitedAvailability",
          url: `${SITE}/contact`,
        },
        inLanguage: ["en", "es"],
      },
      {
        "@type": "ItemList",
        name: `Six surfaces — ${v.name.en}`,
        itemListElement: SURFACES.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.label.en,
          description: v.applied[i].en,
          url: `${SITE}/worlds/${s.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: v.name.en, item: url },
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
        suppressHydrationWarning
      />
      <VerticalPage vertical={v} />
    </>
  );
}
