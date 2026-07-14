// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xverse-media-test-"));
process.env.DATABASE_PATH = path.join(tmpDir, "test.db");
process.env.MEDIA_PATH = path.join(tmpDir, "media");
process.env.SESSION_SECRET = "unit-test-session-secret-0123456789abcdef";

import { runMigrations } from "@/db/migrate";
import { getDb } from "@/db";
import { cmsProducts, media, showcases } from "@/db/schema";
import type { AuthContext } from "@/lib/auth/session";
import {
  MediaError,
  deleteMedia,
  getMedia,
  listMedia,
  mediaUsage,
  replaceMediaFile,
  updateMediaMeta,
  uploadMedia,
} from "./service";

runMigrations();

const admin: AuthContext = { sessionId: "s1", user: { id: "admin1", email: "a@x", name: "A", role: "admin" } };

function makePng(color: { r: number; g: number; b: number }, size = 64): Promise<Buffer> {
  return sharp({ create: { width: size, height: size, channels: 3, background: color } })
    .png()
    .toBuffer();
}

function mediaFile(fileName: string): string {
  return path.join(process.env.MEDIA_PATH!, fileName);
}

beforeEach(() => {
  const db = getDb();
  db.delete(showcases).run();
  db.delete(cmsProducts).run();
  db.delete(media).run();
  fs.rmSync(process.env.MEDIA_PATH!, { recursive: true, force: true });
});

describe("upload validation", () => {
  it("accepts a real png, re-encodes it, and writes a webp thumbnail", async () => {
    const row = await uploadMedia(admin, { buffer: await makePng({ r: 200, g: 40, b: 40 }), originalName: "red.png", kind: "image" });
    expect(row.mime).toBe("image/png");
    expect(row.width).toBe(64);
    expect(row.height).toBe(64);
    expect(row.fileName).toMatch(/^[a-f0-9]{32}\.png$/);
    expect(row.thumbFileName).toMatch(/^[a-f0-9]{32}-thumb\.webp$/);
    expect(fs.existsSync(mediaFile(row.fileName))).toBe(true);
    expect(fs.existsSync(mediaFile(row.thumbFileName!))).toBe(true);
  });

  it("rejects a spoofed image (text bytes with a png name)", async () => {
    const fake = Buffer.from("this is definitely not a png", "utf8");
    await expect(uploadMedia(admin, { buffer: fake, originalName: "fake.png", kind: "image" })).rejects.toMatchObject({
      code: "decode_failed",
    });
  });

  it("rejects oversized images", async () => {
    const huge = Buffer.alloc(10 * 1024 * 1024 + 1);
    await expect(uploadMedia(admin, { buffer: huge, originalName: "huge.png", kind: "image" })).rejects.toMatchObject({
      code: "too_large",
    });
  });

  it("accepts mp4 by magic bytes and rejects arbitrary video bytes", async () => {
    const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypisom-and-some-payload", "ascii")]);
    const row = await uploadMedia(admin, { buffer: mp4, originalName: "clip.mp4", kind: "video" });
    expect(row.mime).toBe("video/mp4");
    expect(row.thumbFileName).toBeNull();

    const junk = Buffer.from("not a video at all, just text padding 123", "utf8");
    await expect(uploadMedia(admin, { buffer: junk, originalName: "clip.mp4", kind: "video" })).rejects.toMatchObject({
      code: "unsupported_type",
    });
  });

  it("accepts pdf documents by signature only", async () => {
    const pdf = Buffer.from("%PDF-1.7 minimal", "ascii");
    const row = await uploadMedia(admin, { buffer: pdf, originalName: "brief.pdf", kind: "document" });
    expect(row.mime).toBe("application/pdf");
    await expect(
      uploadMedia(admin, { buffer: Buffer.from("plain text"), originalName: "brief.pdf", kind: "document" }),
    ).rejects.toMatchObject({ code: "unsupported_type" });
  });

  it("dedupes identical bytes into one row", async () => {
    const png = await makePng({ r: 10, g: 120, b: 220 });
    const first = await uploadMedia(admin, { buffer: png, originalName: "one.png", kind: "image" });
    const second = await uploadMedia(admin, { buffer: png, originalName: "two.png", kind: "image" });
    expect(second.id).toBe(first.id);
    expect(listMedia()).toHaveLength(1);
  });
});

describe("metadata and listing", () => {
  it("updates alt text and kind", async () => {
    const row = await uploadMedia(admin, { buffer: await makePng({ r: 1, g: 2, b: 3 }), originalName: "logo.png", kind: "image" });
    const updated = updateMediaMeta(row.id, { altEn: "HorizonX logo", altAr: "شعار", kind: "logo" });
    expect(updated.altEn).toBe("HorizonX logo");
    expect(updated.kind).toBe("logo");
    expect(() => updateMediaMeta("missing", { altEn: "x" })).toThrow(MediaError);
  });

  it("filters by kind and query together", async () => {
    const a = await uploadMedia(admin, { buffer: await makePng({ r: 9, g: 9, b: 9 }), originalName: "alpha.png", kind: "image" });
    updateMediaMeta(a.id, { kind: "logo" });
    await uploadMedia(admin, { buffer: await makePng({ r: 90, g: 9, b: 9 }), originalName: "alpha-shot.png", kind: "screenshot" });
    await uploadMedia(admin, { buffer: await makePng({ r: 9, g: 90, b: 9 }), originalName: "beta.png", kind: "logo" });

    expect(listMedia({ kind: "logo" })).toHaveLength(2);
    expect(listMedia({ query: "alpha" })).toHaveLength(2);
    expect(listMedia({ kind: "logo", query: "alpha" })).toHaveLength(1);
  });
});

describe("replace", () => {
  it("keeps the id, swaps the binary, and removes the old files", async () => {
    const original = await uploadMedia(admin, { buffer: await makePng({ r: 255, g: 0, b: 0 }), originalName: "v1.png", kind: "image" });
    const oldFile = original.fileName;

    const replaced = await replaceMediaFile(admin, original.id, {
      buffer: await makePng({ r: 0, g: 255, b: 0 }),
      originalName: "v2.png",
      kind: "image",
    });
    expect(replaced.id).toBe(original.id);
    expect(replaced.fileName).not.toBe(oldFile);
    expect(replaced.originalName).toBe("v2.png");
    expect(fs.existsSync(mediaFile(oldFile))).toBe(false);
    expect(fs.existsSync(mediaFile(replaced.fileName))).toBe(true);
    expect(listMedia()).toHaveLength(1); // no orphan row for the replacement upload
  });

  it("refuses to replace with bytes identical to another library item", async () => {
    const bytes = await makePng({ r: 40, g: 40, b: 40 });
    await uploadMedia(admin, { buffer: bytes, originalName: "owner.png", kind: "image" });
    const other = await uploadMedia(admin, { buffer: await makePng({ r: 41, g: 41, b: 41 }), originalName: "other.png", kind: "image" });
    await expect(replaceMediaFile(admin, other.id, { buffer: bytes, originalName: "dup.png", kind: "image" })).rejects.toMatchObject({
      code: "duplicate",
    });
  });
});

describe("delete and usage", () => {
  function seedShowcaseReferencing(mediaId: string) {
    const now = new Date();
    const db = getDb();
    db.insert(cmsProducts)
      .values({
        id: "xability",
        name: "Xability",
        showcaseSlug: "xability",
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
    db.insert(showcases)
      .values({
        id: "sc1",
        slug: "uses-media",
        productId: "xability",
        blocksEn: JSON.stringify({ hero: { image: `media:${mediaId}` } }),
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  it("blocks deletion while referenced, allows it after unreferencing", async () => {
    const row = await uploadMedia(admin, { buffer: await makePng({ r: 5, g: 5, b: 200 }), originalName: "used.png", kind: "image" });
    seedShowcaseReferencing(row.id);

    expect(mediaUsage(row.id)).toEqual([{ entityType: "showcase", entityId: "sc1", label: "uses-media" }]);
    await expect(deleteMedia(row.id)).rejects.toMatchObject({ code: "in_use" });

    getDb().update(showcases).set({ blocksEn: "{}" }).run();
    await deleteMedia(row.id);
    expect(() => getMedia(row.id)).toThrow(MediaError);
    expect(fs.existsSync(mediaFile(row.fileName))).toBe(false);
    expect(fs.existsSync(mediaFile(row.thumbFileName!))).toBe(false);
  });
});
