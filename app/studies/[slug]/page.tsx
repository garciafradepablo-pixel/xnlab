import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "../data";
import WorkDetail from "./_work-detail";
import { getNonce } from "../../_lib/csp";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = `${p.title} · ${p.discipline}`;
  const description = p.excerpt.en;
  return {
    title,
    description,
    alternates: { canonical: `/studies/${p.slug}` },
    openGraph: {
      title: `${p.title} · XNLAB`,
      description,
      url: `https://xnlab.io/studies/${p.slug}`,
      type: "article",
      images: [
        {
          url: p.hero,
          alt: p.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.title} · XNLAB`,
      description,
      images: [p.hero],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.title,
        headline: project.title,
        description: project.excerpt.en,
        creator: { "@type": "Organization", name: "XNLAB", legalName: "Xnlab Studio", url: "https://xnlab.io" },
        dateCreated: project.year,
        image: `https://xnlab.io${project.hero}`,
        about: project.discipline,
        url: `https://xnlab.io/studies/${project.slug}`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://xnlab.io/studies/${project.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://xnlab.io" },
          { "@type": "ListItem", position: 2, name: "Studies", item: "https://xnlab.io/studies" },
          { "@type": "ListItem", position: 3, name: project.title, item: `https://xnlab.io/studies/${project.slug}` },
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
      <WorkDetail project={project} />
    </>
  );
}
