import type { MetadataRoute } from "next";

const BASE_URL = "https://ambassadors.xolaceinc.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Per-user and authenticated surfaces. The layouts set noindex too;
        // this stops crawlers before they reach a page at all.
        disallow: ["/admin", "/ambassador", "/login"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
