import type { MetadataRoute } from "next";
import { projects } from "./work/data";

const SITE = "https://xnlab.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const home: MetadataRoute.Sitemap[number] = {
    url: SITE,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 1,
    alternates: {
      languages: { en: SITE, es: SITE, "x-default": SITE },
    },
  };
  const about: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/about`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  };
  const process: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/process`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  };
  const imprint: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/imprint`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
  };
  const contact: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/contact`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.8,
  };
  const workIndex: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/work`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  };
  const works: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
    images: [`${SITE}${p.hero}`],
  }));
  return [home, about, process, workIndex, ...works, contact, imprint];
}
