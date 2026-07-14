// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xverse-migrate-test-"));
process.env.DATABASE_PATH = path.join(tmpDir, "test.db");
process.env.SESSION_SECRET = "unit-test-session-secret-0123456789abcdef";

import { runMigrations } from "@/db/migrate";
import { getDb } from "@/db";
import { cmsProducts, contentVersions, industries, showcases, tags } from "@/db/schema";
import { SHOWCASES } from "@/data/showcases";
import { BRANDS } from "@/data/brands";
import { PRODUCTS } from "@/data/products";
import { seedProductsIfEmpty } from "./seedProducts";
import { migrateV1ContentIfNeeded } from "./migrateV1Content";

runMigrations();

const EXPECTED_TEMPLATE_SLUGS = SHOWCASES.map((s) => s.slug).sort();
const EXPECTED_BRAND_SLUGS = BRANDS.map((b) => b.slug).sort();

beforeEach(() => {
  const db = getDb();
  db.delete(contentVersions).run();
  db.delete(showcases).run();
  db.delete(tags).run();
  db.delete(industries).run();
  db.delete(cmsProducts).run();
  seedProductsIfEmpty();
});

function allShowcases() {
  return getDb().select().from(showcases).all();
}

describe("migration inventory and slug preservation", () => {
  it("creates exactly one row per product showcase page and per demo brand, with the exact V1 slugs", () => {
    const summary = migrateV1ContentIfNeeded();
    expect(summary.showcaseTemplates.created.sort()).toEqual(EXPECTED_TEMPLATE_SLUGS);
    expect(summary.demoBrands.created.sort()).toEqual(EXPECTED_BRAND_SLUGS);
    expect(summary.conflicts).toEqual([]);

    const rows = allShowcases();
    expect(rows).toHaveLength(SHOWCASES.length + BRANDS.length);
    expect(rows.map((r) => r.slug).sort()).toEqual([...EXPECTED_TEMPLATE_SLUGS, ...EXPECTED_BRAND_SLUGS].sort());
  });

  it("marks every migrated row published with a publishedAt timestamp", () => {
    migrateV1ContentIfNeeded();
    for (const row of allShowcases()) {
      expect(row.status).toBe("published");
      expect(row.publishedAt).not.toBeNull();
    }
  });

  it("stores one showcase per product as type=template, and every demo brand as demo-brand/verified-client", () => {
    migrateV1ContentIfNeeded();
    const rows = allShowcases();
    for (const showcase of SHOWCASES) {
      const row = rows.find((r) => r.slug === showcase.slug);
      expect(row?.type).toBe("template");
      expect(row?.productId).toBe(showcase.productId);
    }
    for (const brand of BRANDS) {
      const row = rows.find((r) => r.slug === brand.slug);
      expect(row?.type).toBe(brand.type === "verified" ? "verified-client" : "demo-brand");
      expect(row?.productId).toBe(brand.product);
    }
  });

  it("preserves ordering and featured flags exactly as authored in data/brands.ts", () => {
    migrateV1ContentIfNeeded();
    const rows = allShowcases();
    BRANDS.forEach((brand, index) => {
      const row = rows.find((r) => r.slug === brand.slug);
      expect(row?.order).toBe(index + 1);
      expect(row?.featured).toBe(brand.featured);
    });
  });
});

describe("idempotency", () => {
  it("running twice creates no duplicate rows and reports everything as skipped the second time", () => {
    const first = migrateV1ContentIfNeeded();
    expect(first.showcaseTemplates.created.length + first.demoBrands.created.length).toBe(
      SHOWCASES.length + BRANDS.length,
    );

    const countBefore = allShowcases().length;
    const second = migrateV1ContentIfNeeded();
    const countAfter = allShowcases().length;

    expect(countAfter).toBe(countBefore);
    expect(second.showcaseTemplates.created).toEqual([]);
    expect(second.demoBrands.created).toEqual([]);
    expect(second.showcaseTemplates.skipped.sort()).toEqual(EXPECTED_TEMPLATE_SLUGS);
    expect(second.demoBrands.skipped.sort()).toEqual(EXPECTED_BRAND_SLUGS);
    expect(second.conflicts).toEqual([]);
  });

  it("never overwrites admin edits made after the first migration run", () => {
    migrateV1ContentIfNeeded();
    const db = getDb();
    const row = db.select().from(showcases).where(eq(showcases.slug, "amber-oak-coffee")).get()!;
    db.update(showcases).set({ titleEn: "Renamed By Admin" }).where(eq(showcases.id, row.id)).run();

    migrateV1ContentIfNeeded();

    const after = db.select().from(showcases).where(eq(showcases.slug, "amber-oak-coffee")).get()!;
    expect(after.titleEn).toBe("Renamed By Admin");
  });
});

describe("conflict detection", () => {
  it("flags a slug that already exists under a different product or type as a conflict, without touching it", () => {
    const db = getDb();
    const now = new Date();
    // Pre-seed a row that collides with a known migration slug but with the wrong shape.
    db.insert(showcases)
      .values({
        id: crypto.randomUUID(),
        slug: "amber-oak-coffee",
        productId: "xsite", // wrong product on purpose
        type: "concept", // wrong type on purpose
        status: "draft",
        titleEn: "Pre-existing unrelated row",
        titleAr: "صف موجود مسبقًا",
        summaryEn: "x",
        summaryAr: "y",
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const summary = migrateV1ContentIfNeeded();
    expect(summary.conflicts).toContainEqual(
      expect.objectContaining({ slug: "amber-oak-coffee" }),
    );
    expect(summary.demoBrands.skipped).toContain("amber-oak-coffee");

    // The pre-existing row must be untouched — migration never overwrites.
    const row = db.select().from(showcases).where(eq(showcases.slug, "amber-oak-coffee")).get()!;
    expect(row.titleEn).toBe("Pre-existing unrelated row");
    expect(row.productId).toBe("xsite");
  });
});

describe("translation preservation", () => {
  it("populates real Arabic hero copy for every product showcase page", () => {
    migrateV1ContentIfNeeded();
    const rows = allShowcases();
    for (const showcase of SHOWCASES) {
      const row = rows.find((r) => r.slug === showcase.slug)!;
      expect(row.titleAr.length).toBeGreaterThan(0);
      expect(row.titleAr).not.toBe(row.titleEn); // every showcase has a real, distinct AR translation
      expect(row.summaryAr.length).toBeGreaterThan(0);
      const blocksAr = JSON.parse(row.blocksAr);
      expect(blocksAr.stats?.length ?? 0).toBeGreaterThan(0);
      expect(blocksAr.sections).toBeTruthy();
      expect(blocksAr.businesses).toBeTruthy();
    }
  });

  it("mirrors EN into AR for demo brands (V1 never translated brand narrative content)", () => {
    migrateV1ContentIfNeeded();
    const rows = allShowcases();
    for (const brand of BRANDS) {
      const row = rows.find((r) => r.slug === brand.slug)!;
      expect(row.titleAr).toBe(row.titleEn);
      expect(row.summaryAr).toBe(row.summaryEn);
      expect(row.storyAr).toBe(row.storyEn);
    }
  });

  it("satisfies the publish-gate required translations for every migrated row", () => {
    migrateV1ContentIfNeeded();
    for (const row of allShowcases()) {
      expect(row.titleEn.trim().length).toBeGreaterThan(0);
      expect(row.titleAr.trim().length).toBeGreaterThan(0);
      expect(row.summaryEn.trim().length).toBeGreaterThan(0);
      expect(row.summaryAr.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("catalog seeding", () => {
  it("seeds one industries row per unique brand industry and one tags row per unique brand tag", () => {
    migrateV1ContentIfNeeded();
    const expectedIndustries = new Set(BRANDS.map((b) => b.industry));
    const expectedTags = new Set(BRANDS.flatMap((b) => b.tags));

    const industryRows = getDb().select().from(industries).all();
    const tagRows = getDb().select().from(tags).all();

    expect(industryRows).toHaveLength(expectedIndustries.size);
    expect(tagRows).toHaveLength(expectedTags.size);
  });

  it("links each migrated brand to its industry and tag catalog rows", () => {
    migrateV1ContentIfNeeded();
    const rows = allShowcases();
    for (const brand of BRANDS) {
      const row = rows.find((r) => r.slug === brand.slug)!;
      expect(row.industryId).toBeTruthy();
      const linkedTagIds = row.tagIds.split(",").filter(Boolean);
      expect(linkedTagIds).toHaveLength(brand.tags.length);
    }
  });

  it("does not duplicate catalog rows on a second run", () => {
    migrateV1ContentIfNeeded();
    const before = { industries: getDb().select().from(industries).all().length, tags: getDb().select().from(tags).all().length };
    migrateV1ContentIfNeeded();
    const after = { industries: getDb().select().from(industries).all().length, tags: getDb().select().from(tags).all().length };
    expect(after).toEqual(before);
  });
});

describe("version history", () => {
  it("writes a migration snapshot for every created row", () => {
    migrateV1ContentIfNeeded();
    const versions = getDb().select().from(contentVersions).all();
    expect(versions).toHaveLength(SHOWCASES.length + BRANDS.length);
    expect(versions.every((v) => v.reason === "migration:v1")).toBe(true);
  });
});

describe("product catalog is untouched by this migration", () => {
  it("still has exactly the seeded product rows (Phase 3's job, not Phase 5's)", () => {
    migrateV1ContentIfNeeded();
    expect(getDb().select().from(cmsProducts).all()).toHaveLength(PRODUCTS.length);
  });
});
