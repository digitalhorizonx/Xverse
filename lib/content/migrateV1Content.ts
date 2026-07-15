import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { showcases, industries, tags, contentVersions, type ShowcaseType } from "@/db/schema";
import { SHOWCASES } from "@/data/showcases";
import { BRANDS } from "@/data/brands";
import { ar } from "@/lib/i18n/dictionaries/ar";

/**
 * One-time (idempotent) migration of the V1 static content — the five
 * product showcase pages and the five Xability demo brands — into the
 * Phase 3 content model. Runs automatically at every boot (same pattern as
 * seedProducts.ts): existing rows are looked up by slug and never touched,
 * so admin edits made after the first run are permanent and a re-run (or a
 * fresh deploy) is always safe.
 *
 * A product's own showcase page becomes a `showcases` row with
 * type "template" — the type SHOWCASE_TYPES already reserved for this in
 * Phase 3. Its rich payload (stats, capabilities, demo data…) lives in
 * blocksEn/blocksAr, validated by the same schema the admin editor uses.
 */

interface MigrationResult {
  created: string[];
  skipped: string[];
}

export interface MigrationConflict {
  slug: string;
  detail: string;
}

export interface MigrationSummary {
  showcaseTemplates: MigrationResult;
  demoBrands: MigrationResult;
  industries: MigrationResult;
  tags: MigrationResult;
  conflicts: MigrationConflict[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function snapshotCreated(id: string): void {
  const row = getDb().select().from(showcases).where(eq(showcases.id, id)).get();
  if (!row) return;
  getDb()
    .insert(contentVersions)
    .values({
      entityType: "showcase",
      entityId: id,
      reason: "migration:v1",
      snapshot: JSON.stringify(row),
      createdBy: null,
      createdByEmail: "system:migration",
      createdAt: new Date(),
    })
    .run();
}

/** Insert an industries row by slug if it doesn't exist yet. Returns its id either way. */
function ensureIndustry(name: string, order: number, result: MigrationResult): string {
  const db = getDb();
  const slug = slugify(name);
  const existing = db.select().from(industries).where(eq(industries.slug, slug)).get();
  if (existing) {
    result.skipped.push(slug);
    return existing.id;
  }
  db.insert(industries).values({ id: slug, slug, nameEn: name, nameAr: name, order, active: true }).run();
  result.created.push(slug);
  return slug;
}

/** Insert a tags row by slug if it doesn't exist yet. Returns its id either way. */
function ensureTag(name: string, result: MigrationResult): string {
  const db = getDb();
  const slug = slugify(name);
  const existing = db.select().from(tags).where(eq(tags.slug, slug)).get();
  if (existing) {
    result.skipped.push(slug);
    return existing.id;
  }
  db.insert(tags).values({ id: slug, slug, kind: "tag", nameEn: name, nameAr: name }).run();
  result.created.push(slug);
  return slug;
}

export function migrateV1ContentIfNeeded(): MigrationSummary {
  const db = getDb();
  const summary: MigrationSummary = {
    showcaseTemplates: { created: [], skipped: [] },
    demoBrands: { created: [], skipped: [] },
    industries: { created: [], skipped: [] },
    tags: { created: [], skipped: [] },
    conflicts: [],
  };

  const now = new Date();

  // ------------------------------------------------------- product showcases
  SHOWCASES.forEach((showcase, index) => {
    const existing = db.select().from(showcases).where(eq(showcases.slug, showcase.slug)).get();
    if (existing) {
      if (existing.productId !== showcase.productId || existing.type !== "template") {
        summary.conflicts.push({
          slug: showcase.slug,
          detail: `existing row has productId="${existing.productId}" type="${existing.type}", expected productId="${showcase.productId}" type="template"`,
        });
      }
      summary.showcaseTemplates.skipped.push(showcase.slug);
      return;
    }

    const arOverride = ar.showcases?.[showcase.slug];
    const blocksEn: Record<string, unknown> = {
      stats: showcase.stats,
      capabilities: showcase.capabilities,
      sections: showcase.sections,
      sampleBusinesses: showcase.sampleBusinesses,
    };
    if (showcase.siteTemplates) blocksEn.siteTemplates = showcase.siteTemplates;
    if (showcase.appDemos) blocksEn.appDemos = showcase.appDemos;
    if (showcase.vehicles) blocksEn.vehicles = showcase.vehicles;
    if (showcase.autoServices) blocksEn.autoServices = showcase.autoServices;
    if (showcase.aiAgents) blocksEn.aiAgents = showcase.aiAgents;
    if (showcase.chatScript) blocksEn.chatScript = showcase.chatScript;
    if (showcase.aiWorkflows) blocksEn.aiWorkflows = showcase.aiWorkflows;

    const blocksAr: Record<string, unknown> = {};
    if (arOverride) {
      blocksAr.stats = arOverride.stats;
      blocksAr.capabilities = arOverride.capabilities;
      blocksAr.sections = arOverride.sections;
      blocksAr.businesses = arOverride.businesses;
      if (arOverride.autoServices) blocksAr.autoServices = arOverride.autoServices;
      if (arOverride.aiAgents) blocksAr.aiAgents = arOverride.aiAgents;
      if (arOverride.chatScript) blocksAr.chatScript = arOverride.chatScript;
      if (arOverride.aiWorkflows) blocksAr.aiWorkflows = arOverride.aiWorkflows;
    }

    const id = crypto.randomUUID();
    db.insert(showcases)
      .values({
        id,
        slug: showcase.slug,
        productId: showcase.productId,
        type: "template" as ShowcaseType,
        status: "published",
        verified: false,
        featured: false,
        order: index + 1,
        tagIds: "",
        titleEn: showcase.heroTagline,
        titleAr: arOverride?.heroTagline ?? showcase.heroTagline,
        summaryEn: showcase.heroDescription,
        summaryAr: arOverride?.heroDescription ?? showcase.heroDescription,
        blocksEn: JSON.stringify(blocksEn),
        blocksAr: JSON.stringify(blocksAr),
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      })
      .run();
    snapshotCreated(id);
    summary.showcaseTemplates.created.push(showcase.slug);
  });

  // ---------------------------------------------------------------- catalogs
  const industryNames = [...new Set(BRANDS.map((brand) => brand.industry))];
  const industryIdByName = new Map<string, string>();
  industryNames.forEach((name, index) => {
    industryIdByName.set(name, ensureIndustry(name, index + 1, summary.industries));
  });

  const tagNames = [...new Set(BRANDS.flatMap((brand) => brand.tags))];
  const tagIdByName = new Map<string, string>();
  tagNames.forEach((name) => {
    tagIdByName.set(name, ensureTag(name, summary.tags));
  });

  // ------------------------------------------------------------- demo brands
  BRANDS.forEach((brand, index) => {
    const existing = db.select().from(showcases).where(eq(showcases.slug, brand.slug)).get();
    const expectedType: ShowcaseType = brand.type === "verified" ? "verified-client" : "demo-brand";
    if (existing) {
      if (existing.productId !== brand.product || existing.type !== expectedType) {
        summary.conflicts.push({
          slug: brand.slug,
          detail: `existing row has productId="${existing.productId}" type="${existing.type}", expected productId="${brand.product}" type="${expectedType}"`,
        });
      }
      summary.demoBrands.skipped.push(brand.slug);
      return;
    }

    const blocksEn: Record<string, unknown> = {
      industry: brand.industry,
      logoMark: brand.logoMark,
      colors: brand.colors,
      coverVisual: brand.coverVisual,
      tags: brand.tags,
      transformationStage: brand.transformationStage,
      digitalTransformationScore: brand.digitalTransformationScore,
      servicesUsed: brand.servicesUsed,
      socialPosts: brand.socialPosts,
      reels: brand.reels,
      contentCalendar: brand.contentCalendar,
      reports: brand.reports,
      analytics: brand.analytics,
      adPerformance: brand.adPerformance,
      aiInsights: brand.aiInsights,
      gallery: brand.gallery,
    };
    if (brand.websitePreview) blocksEn.websitePreview = brand.websitePreview;
    if (brand.appPreview) blocksEn.appPreview = brand.appPreview;
    if (brand.automationPreview) blocksEn.automationPreview = brand.automationPreview;
    if (brand.aiWorkflowPreview) blocksEn.aiWorkflowPreview = brand.aiWorkflowPreview;

    const id = crypto.randomUUID();
    db.insert(showcases)
      .values({
        id,
        slug: brand.slug,
        productId: brand.product,
        type: expectedType,
        status: "published",
        verified: brand.type === "verified",
        featured: brand.featured,
        order: index + 1,
        industryId: industryIdByName.get(brand.industry) ?? null,
        tagIds: brand.tags.map((tag) => tagIdByName.get(tag)).filter(Boolean).join(","),
        // Demo brand narrative content is intentionally English-only in V1
        // (never localized — see lib/i18n/localize.ts). AR columns mirror
        // EN so the publish gate is satisfied; the public brand pages have
        // never rendered a localized version of this content.
        titleEn: brand.name,
        titleAr: brand.name,
        summaryEn: brand.description,
        summaryAr: brand.description,
        storyEn: brand.brandStory,
        storyAr: brand.brandStory,
        blocksEn: JSON.stringify(blocksEn),
        blocksAr: "{}",
        createdAt: now,
        updatedAt: now,
        publishedAt: now,
      })
      .run();
    snapshotCreated(id);
    summary.demoBrands.created.push(brand.slug);
  });

  const totalCreated =
    summary.showcaseTemplates.created.length +
    summary.demoBrands.created.length +
    summary.industries.created.length +
    summary.tags.created.length;
  if (totalCreated > 0 || summary.conflicts.length > 0) {
    // eslint-disable-next-line no-console -- one-time operational signal, matches seedProducts.ts
    console.log(
      `[xverse] v1 content migration: ${summary.showcaseTemplates.created.length} showcase page(s), ${summary.demoBrands.created.length} demo brand(s), ${summary.industries.created.length} industr${summary.industries.created.length === 1 ? "y" : "ies"}, ${summary.tags.created.length} tag(s) created` +
        (summary.conflicts.length ? `; ${summary.conflicts.length} conflict(s) — see logs` : ""),
    );
    for (const conflict of summary.conflicts) {
      // eslint-disable-next-line no-console -- surfaced deliberately, not swallowed
      console.warn(`[xverse] migration conflict: ${conflict.slug} — ${conflict.detail}`);
    }
  }

  return summary;
}
