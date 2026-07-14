import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublicProducts, getPublicSitemapBrands } from "@/lib/content/publicContent";

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
