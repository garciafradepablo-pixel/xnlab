import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { records, getRecord } from "../../_lib/lab-records";
import LabRecord from "./_lab-record";
import { getNonce } from "../../_lib/csp";

export async function generateStaticParams() {
  return records.map((r) => ({ slug: r.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = getRecord(slug);
  if (!r) return {};
  return {
    title: r.title.en,
    description: r.lead.en,
    alternates: { canonical: `/lab-records/${r.slug}` },
    openGraph: {
      title: `${r.title.en} · Xnlab Studio`,
      description: r.lead.en,
      url: `https://xnlab.io/lab-records/${r.slug}`,
      type: "article",
      publishedTime: new Date(r.date).toISOString(),
      authors: ["Xnlab Studio"],
    },
    twitter: {
      card: "summary_large_image",
      title: r.title.en,
      description: r.lead.en,
    },
    keywords: r.tags,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = getRecord(slug);
  if (!record) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: record.title.en,
        alternativeHeadline: record.title.es,
        description: record.lead.en,
        datePublished: new Date(record.date).toISOString(),
        dateModified: new Date(record.date).toISOString(),
        author: {
          "@type": "Organization",
          name: "Xnlab Studio",
          url: "https://xnlab.io",
        },
        publisher: {
          "@type": "Organization",
          name: "Xnlab Studio",
          url: "https://xnlab.io",
          logo: {
            "@type": "ImageObject",
            url: "https://xnlab.io/icon",
            width: 512,
            height: 512,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://xnlab.io/lab-records/${record.slug}`,
        },
        keywords: record.tags?.join(", "),
        articleSection: record.category.en,
        inLanguage: ["en", "es"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://xnlab.io" },
          { "@type": "ListItem", position: 2, name: "Lab Records", item: "https://xnlab.io/lab-records" },
          { "@type": "ListItem", position: 3, name: record.title.en, item: `https://xnlab.io/lab-records/${record.slug}` },
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
      <LabRecord record={record} />
    </>
  );
}
