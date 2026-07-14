import type { MetadataRoute } from "next";
import { SITE_URL, ALLOW_INDEXING } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ALLOW_INDEXING ? "/" : undefined,
      // The admin console and API are never crawlable, even when the
      // public site is indexed.
      disallow: ALLOW_INDEXING ? ["/admin", "/api"] : "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
