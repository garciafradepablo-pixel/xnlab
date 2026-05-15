import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, getProject } from "../data";
import WorkDetail from "./_work-detail";

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
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: {
      title: `${p.title} · XNLAB`,
      description,
      url: `https://xnlab.io/work/${p.slug}`,
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
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.excerpt.en,
    creator: { "@type": "Organization", name: "XNLAB", url: "https://xnlab.io" },
    dateCreated: project.year,
    image: `https://xnlab.io${project.hero}`,
    about: project.discipline,
    url: `https://xnlab.io/work/${project.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkDetail project={project} />
    </>
  );
}
