import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cmsProducts } from "@/db/schema";
import { PRODUCTS } from "@/data/products";
import { ar } from "@/lib/i18n/dictionaries/ar";

/**
 * Seeds the product catalog from the V1 source of truth (data/products.ts
 * + the Arabic dictionary overrides) when the table is empty. Idempotent:
 * an initialized catalog is never touched, so admin edits are permanent.
 * The full showcase/brand migration is Phase 5 — products come first
 * because showcases reference them.
 */
export function seedProductsIfEmpty(): void {
  const db = getDb();
  const count = db.select({ count: sql<number>`count(*)` }).from(cmsProducts).get()?.count ?? 0;
  if (count > 0) return;

  const now = new Date();
  for (const [index, product] of PRODUCTS.entries()) {
    const arOverride = ar.products?.[product.id];
    db.insert(cmsProducts)
      .values({
        id: product.id,
        name: product.name,
        showcaseSlug: product.showcaseSlug,
        taglineEn: product.tagline,
        taglineAr: arOverride?.tagline ?? product.tagline,
        descriptionEn: product.description,
        descriptionAr: arOverride?.description ?? product.description,
        color: product.color,
        accentColor: product.accentColor,
        live: product.status === "live",
        ctaLabelEn: product.ctaLabel,
        ctaLabelAr: `ابدأ مع ${product.name}`,
        ctaUrl: product.ctaUrl,
        orbitRadius: product.orbitRadius,
        orbitSpeedPct: Math.round(product.orbitSpeed * 100),
        order: index + 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
  // eslint-disable-next-line no-console -- one-time operational signal
  console.log(`[xverse] product catalog seeded (${PRODUCTS.length} products)`);
}
