import type { MetadataRoute } from "next";
import { projects } from "./work/data";
import { worlds } from "./_lib/worlds";
import { records } from "./_lib/lab-records";

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
  const services: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/services`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.95,
  };
  const process: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/process`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  };
  const manifesto: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/manifesto`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  };
  const atmospheres: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/atmospheres`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  };
  const nowPage: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/now`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  };
  const references: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/references`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  };
  const collaboration: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/collaboration`,
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
  const worldsIndex: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/worlds`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.95,
  };
  const worldsList: MetadataRoute.Sitemap = worlds.map((w) => ({
    url: `${SITE}/worlds/${w.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const labRecordsIndex: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/lab-records`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  };
  const labRecords: MetadataRoute.Sitemap = records.map((r) => ({
    url: `${SITE}/lab-records/${r.slug}`,
    lastModified: new Date(r.date),
    changeFrequency: "yearly",
    priority: 0.7,
  }));
  return [home, services, worldsIndex, ...worldsList, labRecordsIndex, ...labRecords, about, process, collaboration, manifesto, atmospheres, nowPage, references, workIndex, ...works, contact, imprint];
}
