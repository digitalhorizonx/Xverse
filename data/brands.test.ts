import { describe, expect, it } from "vitest";
import { BRANDS, getActiveBrands, getBrandBySlug, getBrandsByProduct, getFeaturedBrands } from "./brands";
import { PRODUCTS, getProduct } from "./products";

describe("products data", () => {
  it("has exactly one live product (Xability) and the rest coming soon", () => {
    const live = PRODUCTS.filter((p) => p.status === "live");
    expect(live).toHaveLength(1);
    expect(live[0].id).toBe("xability");
  });

  it("resolves a product by id", () => {
    expect(getProduct("xability")?.name).toBe("Xability");
    expect(getProduct("does-not-exist")).toBeUndefined();
  });
});

describe("brands data", () => {
  it("ships exactly 5 demo brands, all under Xability, all active", () => {
    expect(BRANDS).toHaveLength(5);
    expect(BRANDS.every((b) => b.product === "xability")).toBe(true);
    expect(getActiveBrands()).toHaveLength(5);
  });

  it("labels every brand as a demo, never as real client data", () => {
    expect(BRANDS.every((b) => b.type === "demo")).toBe(true);
  });

  it("has unique slugs", () => {
    const slugs = BRANDS.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves a brand by product + slug", () => {
    const brand = getBrandBySlug("xability", "amber-oak-coffee");
    expect(brand?.name).toBe("Amber & Oak Coffee Co.");
    expect(getBrandBySlug("xability", "not-a-brand")).toBeUndefined();
  });

  it("filters brands by product", () => {
    expect(getBrandsByProduct("xability")).toHaveLength(5);
    expect(getBrandsByProduct("xsite")).toHaveLength(0);
  });

  it("has at least one featured brand", () => {
    expect(getFeaturedBrands().length).toBeGreaterThan(0);
  });

  it("every brand has non-empty core content sections", () => {
    for (const brand of BRANDS) {
      expect(brand.socialPosts.length).toBeGreaterThan(0);
      expect(brand.reels.length).toBeGreaterThan(0);
      expect(brand.contentCalendar.length).toBeGreaterThan(0);
      expect(brand.reports.length).toBeGreaterThan(0);
      expect(brand.adPerformance.length).toBeGreaterThan(0);
      expect(brand.aiInsights.length).toBeGreaterThan(0);
      expect(brand.gallery.length).toBeGreaterThan(0);
    }
  });
});
