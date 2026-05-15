import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { records, getRecord } from "../../_lib/lab-records";
import LabRecord from "./_lab-record";

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
    "@type": "Article",
    headline: record.title.en,
    description: record.lead.en,
    datePublished: new Date(record.date).toISOString(),
    author: { "@type": "Organization", name: "Xnlab Studio", url: "https://xnlab.io" },
    publisher: {
      "@type": "Organization",
      name: "Xnlab Studio",
      url: "https://xnlab.io",
    },
    mainEntityOfPage: `https://xnlab.io/lab-records/${record.slug}`,
    keywords: record.tags?.join(", "),
    articleSection: record.category.en,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LabRecord record={record} />
    </>
  );
}
