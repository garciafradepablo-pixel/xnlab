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
  const title = `${w.title.en} — World ${w.number}`;
  const description = `${w.essence.en} ${w.energy.en}`;
  return {
    title,
    description,
    alternates: { canonical: `/worlds/${w.slug}` },
    openGraph: {
      title: `${w.title.en} · Xnlab Studio`,
      description,
      url: `https://xnlab.io/worlds/${w.slug}`,
      type: "article",
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
  return <WorldDetail world={world} />;
}
