import type { MetadataRoute } from "next";
import { projects } from "./studies/data";
import { worlds } from "./_lib/worlds";
import { records } from "./_lib/lab-records";
import { verticals } from "./_lib/verticals";

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
  const manifesto: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/manifesto`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
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
  const dossier: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/dossier`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  };
  // /perception-audit — the commercial entry product and the primary
  // CTA target from the home hero and contact section. High priority.
  const perceptionAudit: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/perception-audit`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.95,
  };
  // /for/[vertical] — the applied verticals system. Each industry page
  // is a dedicated, high-intent entry point (a hospitality founder, a
  // clinic owner, an estate agency all land on their own surface). High
  // priority because these are the most commercial pages on the site.
  // /hospitality 301s to /for/hospitality (next.config.ts) and is not
  // listed here so the sitemap only carries canonical URLs.
  const verticalsIndex: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/for`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  };
  const verticalsList: MetadataRoute.Sitemap = verticals.map((v) => ({
    url: `${SITE}/for/${v.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.92,
  }));
  const workIndex: MetadataRoute.Sitemap[number] = {
    url: `${SITE}/studies`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  };
  const works: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE}/studies/${p.slug}`,
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
  return [home, perceptionAudit, verticalsIndex, ...verticalsList, worldsIndex, ...worldsList, labRecordsIndex, ...labRecords, manifesto, workIndex, ...works, dossier, contact, imprint];
}
