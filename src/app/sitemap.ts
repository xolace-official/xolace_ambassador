import type { MetadataRoute } from "next";

const BASE_URL = "https://ambassadors.xolaceinc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // Only public, indexable routes. The portal and /login are per-user or
  // authenticated, so they stay out — the layouts also set robots noindex.
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/ambassadors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
