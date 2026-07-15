import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublicProducts, getPublicSitemapBrands } from "@/lib/content/publicContent";

// Content is DB-backed as of Phase 5 — the database only exists once the
// server has booted and instrumentation has run migrations, which hasn't
// happened yet at `next build` time. Forcing dynamic rendering keeps this
// route from being prerendered during the build (it would otherwise query
// a table that doesn't exist yet) and defers it to request time, same as
// every other route in the app.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const productEntries: MetadataRoute.Sitemap = getPublicProducts("en").map((product) => ({
    url: `${SITE_URL}/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const brandEntries: MetadataRoute.Sitemap = getPublicSitemapBrands().map((brand) => ({
    url: `${SITE_URL}/${brand.product}/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...productEntries,
    ...brandEntries,
  ];
}
