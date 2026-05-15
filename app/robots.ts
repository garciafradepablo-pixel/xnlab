import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://xnlab.io/sitemap.xml",
    host: "https://xnlab.io",
  };
}
