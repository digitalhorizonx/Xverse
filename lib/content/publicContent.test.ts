// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xverse-publiccontent-test-"));
process.env.DATABASE_PATH = path.join(tmpDir, "test.db");
process.env.SESSION_SECRET = "unit-test-session-secret-0123456789abcdef";

import { runMigrations } from "@/db/migrate";
import { getDb } from "@/db";
import { cmsProducts, contentVersions, industries, showcases, tags } from "@/db/schema";
import { SHOWCASES } from "@/data/showcases";
import { BRANDS } from "@/data/brands";
import { seedProductsIfEmpty } from "./seedProducts";
import { migrateV1ContentIfNeeded } from "./migrateV1Content";
import {
  getPublicBrandBySlug,
  getPublicBrandsByProduct,
  getPublicProductByShowcaseSlug,
  getPublicProducts,
  getPublicShowcaseBySlug,
  getPublicSitemapBrands,
} from "./publicContent";

runMigrations();

beforeEach(() => {
  const db = getDb();
  db.delete(contentVersions).run();
  db.delete(showcases).run();
  db.delete(tags).run();
  db.delete(industries).run();
  db.delete(cmsProducts).run();
  seedProductsIfEmpty();
  migrateV1ContentIfNeeded();
});

describe("published-only gating", () => {
  it("hides a demo brand from public reads the moment it leaves published, and restores it when republished", () => {
    const db = getDb();
    expect(getPublicBrandBySlug("xability", "amber-oak-coffee")).not.toBeNull();

    db.update(showcases).set({ status: "draft" }).where(eq(showcases.slug, "amber-oak-coffee")).run();
    expect(getPublicBrandBySlug("xability", "amber-oak-coffee")).toBeNull();
    expect(getPublicBrandsByProduct("xability").map((b) => b.slug)).not.toContain("amber-oak-coffee");

    db.update(showcases).set({ status: "published" }).where(eq(showcases.slug, "amber-oak-coffee")).run();
    expect(getPublicBrandBySlug("xability", "amber-oak-coffee")).not.toBeNull();
  });

  it("hides an archived product showcase page from public reads", () => {
    const db = getDb();
    expect(getPublicShowcaseBySlug("xability", "en")).not.toBeNull();
    db.update(showcases).set({ status: "archived" }).where(eq(showcases.slug, "xability")).run();
    expect(getPublicShowcaseBySlug("xability", "en")).toBeNull();
  });

  it("hides an inactive product from every public read, including the sitemap", () => {
    const db = getDb();
    db.update(cmsProducts).set({ active: false }).where(eq(cmsProducts.id, "xauto")).run();
    expect(getPublicProducts("en").map((p) => p.id)).not.toContain("xauto");
    expect(getPublicProductByShowcaseSlug("xauto", "en")).toBeNull();
  });
});

describe("brand shaping", () => {
  it("reconstructs the exact V1 Brand shape (industry/tags/featured) used by the public search+filter UI", () => {
    const brand = getPublicBrandsByProduct("xability").find((b) => b.slug === "amber-oak-coffee")!;
    const source = BRANDS.find((b) => b.slug === "amber-oak-coffee")!;
    expect(brand.industry).toBe(source.industry);
    expect(brand.tags).toEqual(source.tags);
    expect(brand.featured).toBe(source.featured);
    expect(brand.socialPosts.length).toBe(source.socialPosts.length);
    expect(brand.gallery.length).toBe(source.gallery.length);
  });

  it("orders brands by the admin-managed sort order", () => {
    const slugs = getPublicBrandsByProduct("xability").map((b) => b.slug);
    expect(slugs).toEqual(BRANDS.map((b) => b.slug));
  });

  it("sitemap brand list covers every published brand across every product", () => {
    const entries = getPublicSitemapBrands();
    expect(entries).toHaveLength(BRANDS.length);
  });
});

describe("showcase localization", () => {
  it("returns raw English blocks unmodified when locale=en", () => {
    const showcase = getPublicShowcaseBySlug("xability", "en")!;
    const source = SHOWCASES.find((s) => s.slug === "xability")!;
    expect(showcase.heroTagline).toBe(source.heroTagline);
    expect(showcase.stats).toEqual(source.stats);
    expect(showcase.capabilities).toEqual(source.capabilities);
  });

  it("merges Arabic overrides onto the English arrays by id/index when locale=ar", () => {
    const showcase = getPublicShowcaseBySlug("xability", "ar")!;
    expect(showcase.heroTagline).not.toBe(SHOWCASES.find((s) => s.slug === "xability")!.heroTagline);
    expect(showcase.stats[0]!.label).not.toBe(SHOWCASES.find((s) => s.slug === "xability")!.stats[0]!.label);
    // Section labels merged by id, not by array position.
    const worldsSection = showcase.sections.find((s) => s.id === "worlds");
    expect(worldsSection?.label).toBeTruthy();
    const businessOverride = showcase.sampleBusinesses.find((b) => b.id === "coffee");
    expect(businessOverride?.industry).toBeTruthy();
  });

  it("never localizes the demo product content itself (site templates, app demos, vehicles)", () => {
    const xsite = getPublicShowcaseBySlug("xsite", "ar")!;
    const xsiteSource = SHOWCASES.find((s) => s.slug === "xsite")!;
    expect(xsite.siteTemplates).toEqual(xsiteSource.siteTemplates);

    const xapps = getPublicShowcaseBySlug("xapps", "ar")!;
    const xappsSource = SHOWCASES.find((s) => s.slug === "xapps")!;
    expect(xapps.appDemos).toEqual(xappsSource.appDemos);
  });
});

describe("product ordering and localization", () => {
  it("orders active products by the admin-managed sort order (V1's original array order)", () => {
    const ids = getPublicProducts("en").map((p) => p.id);
    expect(ids).toEqual(["xability", "xsite", "xapp", "xai", "xauto"]);
  });

  it("returns the Arabic tagline/description for locale=ar", () => {
    const en = getPublicProductByShowcaseSlug("xability", "en")!;
    const ar = getPublicProductByShowcaseSlug("xability", "ar")!;
    expect(ar.tagline).not.toBe(en.tagline);
    expect(ar.name).toBe(en.name); // brand name is never localized
  });
});
