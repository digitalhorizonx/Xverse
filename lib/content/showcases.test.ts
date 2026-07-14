// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xverse-content-test-"));
process.env.DATABASE_PATH = path.join(tmpDir, "test.db");
process.env.SESSION_SECRET = "unit-test-session-secret-0123456789abcdef";

import { runMigrations } from "@/db/migrate";
import { getDb } from "@/db";
import { cmsProducts, contentVersions, showcases } from "@/db/schema";
import type { AuthContext } from "@/lib/auth/session";
import {
  ContentError,
  createShowcase,
  deleteShowcase,
  duplicateShowcase,
  getShowcase,
  listVersions,
  reorderShowcases,
  restoreShowcaseVersion,
  transitionShowcase,
  updateShowcase,
} from "./showcases";
import { parseBlocks } from "./blocks";

runMigrations();

const admin: AuthContext = { sessionId: "s1", user: { id: "admin1", email: "a@x", name: "A", role: "admin" } };
const editor: AuthContext = { sessionId: "s2", user: { id: "editor1", email: "e@x", name: "E", role: "editor" } };

function seedProduct(id = "xability") {
  const now = new Date();
  getDb()
    .insert(cmsProducts)
    .values({
      id,
      name: id,
      showcaseSlug: id,
      taglineEn: "t",
      taglineAr: "ت",
      descriptionEn: "d",
      descriptionAr: "و",
      color: "#20b8a4",
      accentColor: "#7fe4d6",
      live: true,
      ctaLabelEn: "Start",
      ctaLabelAr: "ابدأ",
      ctaUrl: "https://x.example",
      orbitRadius: 6,
      orbitSpeedPct: 100,
      order: 1,
      active: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

function fill(id: string) {
  updateShowcase(admin, id, {
    titleEn: "Title",
    titleAr: "عنوان",
    summaryEn: "Summary",
    summaryAr: "ملخص",
  });
}

beforeEach(() => {
  const db = getDb();
  db.delete(contentVersions).run();
  db.delete(showcases).run();
  db.delete(cmsProducts).run();
  seedProduct();
});

describe("workflow transitions", () => {
  it("editor can draft → in_review but not approve or publish", () => {
    const row = createShowcase(editor, { slug: "demo-a", productId: "xability" });
    expect(transitionShowcase(editor, row.id, "in_review").status).toBe("in_review");
    expect(() => transitionShowcase(editor, row.id, "approved")).toThrow(/forbidden_transition/);
  });

  it("admin path draft → in_review → approved → published stamps publishedAt", () => {
    const row = createShowcase(admin, { slug: "demo-b", productId: "xability" });
    fill(row.id);
    transitionShowcase(admin, row.id, "in_review");
    transitionShowcase(admin, row.id, "approved");
    const published = transitionShowcase(admin, row.id, "published");
    expect(published.status).toBe("published");
    expect(published.publishedAt).not.toBeNull();
  });

  it("illegal jumps are rejected", () => {
    const row = createShowcase(admin, { slug: "demo-c", productId: "xability" });
    expect(() => transitionShowcase(admin, row.id, "published")).toThrow(/invalid_transition/);
  });

  it("publishing with missing mandatory translations is blocked", () => {
    const row = createShowcase(admin, { slug: "demo-d", productId: "xability" });
    updateShowcase(admin, row.id, { titleEn: "Only English", summaryEn: "Only English" });
    transitionShowcase(admin, row.id, "in_review");
    transitionShowcase(admin, row.id, "approved");
    try {
      transitionShowcase(admin, row.id, "published");
      expect.unreachable();
    } catch (error) {
      expect((error as ContentError).code).toBe("missing_translations");
      expect((error as ContentError).detail).toContain("titleAr");
    }
  });

  it("unpublishing requires publish permission", () => {
    const row = createShowcase(admin, { slug: "demo-e", productId: "xability" });
    fill(row.id);
    transitionShowcase(admin, row.id, "in_review");
    transitionShowcase(admin, row.id, "approved");
    transitionShowcase(admin, row.id, "published");
    expect(() => transitionShowcase(editor, row.id, "archived")).toThrow(/forbidden_transition/);
    expect(transitionShowcase(admin, row.id, "archived").status).toBe("archived");
  });
});

describe("versioning", () => {
  it("snapshots on update and restores content without touching status", () => {
    const row = createShowcase(admin, { slug: "demo-v", productId: "xability" });
    updateShowcase(admin, row.id, { titleEn: "Version one" });
    updateShowcase(admin, row.id, { titleEn: "Version two" });

    const versions = listVersions(row.id);
    expect(versions.length).toBeGreaterThanOrEqual(2);
    // The snapshot taken before the last update holds "Version one".
    const target = versions[0]!; // newest first: pre-"Version two" state... snapshot of "Version one"
    restoreShowcaseVersion(admin, row.id, target.id);
    const restored = getShowcase(row.id);
    expect(restored.titleEn).toBe("Version one");
    expect(restored.status).toBe("draft");
  });
});

describe("guards & operations", () => {
  it("slugs are unique", () => {
    createShowcase(admin, { slug: "demo-u", productId: "xability" });
    expect(() => createShowcase(admin, { slug: "demo-u", productId: "xability" })).toThrow(/slug_taken/);
  });

  it("published showcases cannot be hard-deleted", () => {
    const row = createShowcase(admin, { slug: "demo-del", productId: "xability" });
    fill(row.id);
    transitionShowcase(admin, row.id, "in_review");
    transitionShowcase(admin, row.id, "approved");
    transitionShowcase(admin, row.id, "published");
    expect(() => deleteShowcase(admin, row.id)).toThrow(/published_delete/);
    transitionShowcase(admin, row.id, "archived");
    expect(() => deleteShowcase(admin, row.id)).not.toThrow();
  });

  it("duplicate creates a fresh draft with a distinct slug", () => {
    const row = createShowcase(admin, { slug: "demo-dup", productId: "xability" });
    fill(row.id);
    const copy = duplicateShowcase(admin, row.id);
    expect(copy.slug).toBe("demo-dup-copy");
    expect(copy.status).toBe("draft");
    expect(copy.titleEn).toBe("Title");
    const copy2 = duplicateShowcase(admin, row.id);
    expect(copy2.slug).toBe("demo-dup-copy-2");
  });

  it("reorder persists the given order", () => {
    const a = createShowcase(admin, { slug: "ord-a", productId: "xability" });
    const b = createShowcase(admin, { slug: "ord-b", productId: "xability" });
    const c = createShowcase(admin, { slug: "ord-c", productId: "xability" });
    reorderShowcases(admin, [c.id, a.id, b.id]);
    expect(getShowcase(c.id).order).toBe(1);
    expect(getShowcase(a.id).order).toBe(2);
    expect(getShowcase(b.id).order).toBe(3);
  });

  it("rejects invalid blocks JSON and invalid block shapes", () => {
    const row = createShowcase(admin, { slug: "demo-blocks", productId: "xability" });
    expect(() => updateShowcase(admin, row.id, { blocksEn: "not json" })).toThrow(/invalid_blocks/);
    expect(() =>
      updateShowcase(admin, row.id, { blocksEn: JSON.stringify({ stats: [{ label: 1 }] }) }),
    ).toThrow(/invalid_blocks/);
    expect(() =>
      updateShowcase(admin, row.id, {
        blocksEn: JSON.stringify({ stats: [{ label: "Posts", value: "60+" }], futureBlock: { any: "shape" } }),
      }),
    ).not.toThrow();
  });
});

describe("blocks schema", () => {
  it("accepts every V1 block family", () => {
    const parsed = parseBlocks(
      JSON.stringify({
        stats: [{ label: "a", value: "b" }],
        capabilities: [{ icon: "chart", title: "t", description: "d" }],
        sections: [{ id: "s", label: "L" }],
        chatScript: [{ from: "agent", text: "hi" }],
        aiWorkflows: [{ id: "w", name: "n", trigger: "t", steps: ["s"], outcome: "o" }],
      }),
    );
    expect(parsed.ok).toBe(true);
  });
});
