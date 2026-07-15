import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { cmsProducts, showcases, type Showcase } from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";
import type { Brand, ProductPlanet, ProductShowcase } from "@/data/types";

/**
 * Server-only, published-content-only reads that reshape DB rows back
 * into the exact V1 types (data/types.ts) — every existing component
 * downstream (ShowcaseShell, BrandHero, WorldShowcaseSection…) keeps
 * working unmodified; only the data source changes.
 *
 * Caching: none. Every route already renders dynamically (the locale
 * cookie forces it), so there is no Next.js data/route cache in play to
 * invalidate, and these are direct synchronous better-sqlite3 reads
 * (sub-millisecond, WAL mode) — a published admin change is visible on
 * the very next request, predictably, with nothing to go stale and
 * nothing to invalidate. See docs/v2-phase5-migration.md.
 */

function toProductPlanet(row: typeof cmsProducts.$inferSelect, locale: Locale): ProductPlanet {
  return {
    id: row.id as ProductPlanet["id"],
    showcaseSlug: row.showcaseSlug,
    name: row.name,
    tagline: locale === "ar" ? row.taglineAr : row.taglineEn,
    description: locale === "ar" ? row.descriptionAr : row.descriptionEn,
    color: row.color,
    accentColor: row.accentColor,
    status: row.live ? "live" : "coming-soon",
    ctaLabel: locale === "ar" ? row.ctaLabelAr : row.ctaLabelEn,
    ctaUrl: row.ctaUrl,
    orbitRadius: row.orbitRadius,
    orbitSpeed: row.orbitSpeedPct / 100,
  };
}

/** All active products, ordered by the admin-managed sort order. */
export function getPublicProducts(locale: Locale): ProductPlanet[] {
  return getDb()
    .select()
    .from(cmsProducts)
    .where(eq(cmsProducts.active, true))
    .orderBy(cmsProducts.order)
    .all()
    .map((row) => toProductPlanet(row, locale));
}

export function getPublicProductByShowcaseSlug(slug: string, locale: Locale): ProductPlanet | null {
  const row = getDb().select().from(cmsProducts).where(and(eq(cmsProducts.showcaseSlug, slug), eq(cmsProducts.active, true))).get();
  return row ? toProductPlanet(row, locale) : null;
}

export function getPublicProductById(id: string, locale: Locale): ProductPlanet | null {
  const row = getDb().select().from(cmsProducts).where(and(eq(cmsProducts.id, id), eq(cmsProducts.active, true))).get();
  return row ? toProductPlanet(row, locale) : null;
}

// ------------------------------------------------------------- showcase pages

type SparseBlocks = Record<string, unknown>;

function mergeArrayByIndex<T extends Record<string, unknown>>(en: T[] | undefined, arList: unknown, keys: (keyof T)[]): T[] {
  if (!en) return [];
  const overrides = Array.isArray(arList) ? (arList as Partial<T>[]) : [];
  return en.map((item, index) => {
    const override = overrides[index];
    if (!override) return item;
    const merged: T = { ...item };
    for (const key of keys) {
      if (override[key] !== undefined) merged[key] = override[key] as T[typeof key];
    }
    return merged;
  });
}

function localizeShowcaseBlocks(blocksEn: SparseBlocks, blocksAr: SparseBlocks, locale: Locale): Omit<ProductShowcase, "productId" | "slug" | "heroTagline" | "heroDescription"> {
  const en = blocksEn as {
    stats?: { label: string; value: string }[];
    capabilities?: { icon: string; title: string; description: string }[];
    sections?: { id: string; label: string }[];
    sampleBusinesses?: ProductShowcase["sampleBusinesses"];
    siteTemplates?: ProductShowcase["siteTemplates"];
    appDemos?: ProductShowcase["appDemos"];
    vehicles?: ProductShowcase["vehicles"];
    autoServices?: { icon: string; name: string; description: string }[];
    aiAgents?: { name: string; role: string; description: string }[];
    chatScript?: { from: "customer" | "agent"; text: string }[];
    aiWorkflows?: { id: string; name: string; trigger: string; steps: string[]; outcome: string }[];
  };

  if (locale === "en" || Object.keys(blocksAr).length === 0) {
    return {
      stats: en.stats ?? [],
      capabilities: en.capabilities ?? [],
      sections: en.sections ?? [],
      sampleBusinesses: en.sampleBusinesses ?? [],
      siteTemplates: en.siteTemplates,
      appDemos: en.appDemos,
      vehicles: en.vehicles,
      autoServices: en.autoServices,
      aiAgents: en.aiAgents,
      chatScript: en.chatScript,
      aiWorkflows: en.aiWorkflows,
    };
  }

  const arSections = (blocksAr.sections ?? {}) as Record<string, string>;
  const arBusinesses = (blocksAr.businesses ?? {}) as Record<string, { industry: string; summary: string; highlights: string[] }>;

  return {
    stats: mergeArrayByIndex(en.stats, blocksAr.stats, ["label", "value"]),
    capabilities: mergeArrayByIndex(en.capabilities, blocksAr.capabilities, ["title", "description"]),
    sections: (en.sections ?? []).map((section) => ({ ...section, label: arSections[section.id] ?? section.label })),
    sampleBusinesses: (en.sampleBusinesses ?? []).map((business) => {
      const override = arBusinesses[business.id];
      if (!override) return business;
      return { ...business, industry: override.industry, summary: override.summary, highlights: override.highlights };
    }),
    // Demo product content itself (site previews, app screens, vehicle
    // listings) is never localized — see lib/i18n/localize.ts precedent.
    siteTemplates: en.siteTemplates,
    appDemos: en.appDemos,
    vehicles: en.vehicles,
    autoServices: mergeArrayByIndex(en.autoServices, blocksAr.autoServices, ["name", "description"]),
    aiAgents: mergeArrayByIndex(en.aiAgents, blocksAr.aiAgents, ["name", "role", "description"]),
    chatScript: mergeArrayByIndex(en.chatScript, blocksAr.chatScript, ["text"]),
    aiWorkflows: mergeArrayByIndex(en.aiWorkflows, blocksAr.aiWorkflows, ["name", "trigger", "steps", "outcome"]),
  };
}

function toProductShowcase(row: Showcase, locale: Locale): ProductShowcase {
  const blocksEn = JSON.parse(row.blocksEn) as SparseBlocks;
  const blocksAr = JSON.parse(row.blocksAr) as SparseBlocks;
  return {
    productId: row.productId as ProductShowcase["productId"],
    slug: row.slug,
    heroTagline: locale === "ar" ? row.titleAr || row.titleEn : row.titleEn,
    heroDescription: locale === "ar" ? row.summaryAr || row.summaryEn : row.summaryEn,
    ...localizeShowcaseBlocks(blocksEn, blocksAr, locale),
  };
}

export function getPublicShowcaseBySlug(slug: string, locale: Locale): ProductShowcase | null {
  const row = getDb()
    .select()
    .from(showcases)
    .where(and(eq(showcases.slug, slug), eq(showcases.type, "template"), eq(showcases.status, "published")))
    .get();
  return row ? toProductShowcase(row, locale) : null;
}

export function getPublicShowcaseByProductId(productId: string, locale: Locale): ProductShowcase | null {
  const row = getDb()
    .select()
    .from(showcases)
    .where(and(eq(showcases.productId, productId), eq(showcases.type, "template"), eq(showcases.status, "published")))
    .get();
  return row ? toProductShowcase(row, locale) : null;
}

// ------------------------------------------------------------------- brands

function toBrand(row: Showcase): Brand {
  const blocks = JSON.parse(row.blocksEn) as {
    industry: string;
    logoMark: string;
    colors: Brand["colors"];
    coverVisual: string;
    tags: string[];
    transformationStage: Brand["transformationStage"];
    digitalTransformationScore: number;
    servicesUsed: string[];
    socialPosts: Brand["socialPosts"];
    reels: Brand["reels"];
    contentCalendar: Brand["contentCalendar"];
    reports: Brand["reports"];
    analytics: Brand["analytics"];
    adPerformance: Brand["adPerformance"];
    aiInsights: Brand["aiInsights"];
    gallery: Brand["gallery"];
    websitePreview?: Brand["websitePreview"];
    appPreview?: Brand["appPreview"];
    automationPreview?: Brand["automationPreview"];
    aiWorkflowPreview?: Brand["aiWorkflowPreview"];
  };

  return {
    id: row.slug,
    name: row.titleEn,
    slug: row.slug,
    type: row.type === "verified-client" ? "verified" : "demo",
    product: row.productId as Brand["product"],
    industry: blocks.industry,
    logoMark: blocks.logoMark,
    colors: blocks.colors,
    coverVisual: blocks.coverVisual,
    description: row.summaryEn,
    brandStory: row.storyEn,
    transformationStage: blocks.transformationStage,
    digitalTransformationScore: blocks.digitalTransformationScore,
    servicesUsed: blocks.servicesUsed,
    socialPosts: blocks.socialPosts,
    reels: blocks.reels,
    contentCalendar: blocks.contentCalendar,
    reports: blocks.reports,
    analytics: blocks.analytics,
    adPerformance: blocks.adPerformance,
    aiInsights: blocks.aiInsights,
    gallery: blocks.gallery,
    websitePreview: blocks.websitePreview,
    appPreview: blocks.appPreview,
    automationPreview: blocks.automationPreview,
    aiWorkflowPreview: blocks.aiWorkflowPreview,
    tags: blocks.tags,
    featured: row.featured,
    active: row.status === "published",
  };
}

const BRAND_TYPES = ["demo-brand", "verified-client"] as const;

export function getPublicBrandsByProduct(productId: string): Brand[] {
  return getDb()
    .select()
    .from(showcases)
    .where(and(eq(showcases.productId, productId), eq(showcases.status, "published")))
    .orderBy(showcases.order)
    .all()
    .filter((row) => (BRAND_TYPES as readonly string[]).includes(row.type))
    .map(toBrand);
}

export function getPublicBrandBySlug(productId: string, slug: string): Brand | null {
  const row = getDb()
    .select()
    .from(showcases)
    .where(and(eq(showcases.productId, productId), eq(showcases.slug, slug), eq(showcases.status, "published")))
    .get();
  if (!row || !(BRAND_TYPES as readonly string[]).includes(row.type)) return null;
  return toBrand(row);
}

/** Every published brand across every product, for the sitemap. */
export function getPublicSitemapBrands(): { product: string; slug: string }[] {
  return getDb()
    .select()
    .from(showcases)
    .where(eq(showcases.status, "published"))
    .all()
    .filter((row) => (BRAND_TYPES as readonly string[]).includes(row.type))
    .map((row) => ({ product: row.productId, slug: row.slug }));
}
