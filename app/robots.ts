import type { MetadataRoute } from "next";
import { SITE_URL, ALLOW_INDEXING } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ALLOW_INDEXING ? "/" : undefined,
      disallow: ALLOW_INDEXING ? undefined : "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
