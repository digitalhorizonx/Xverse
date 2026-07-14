import { createHash } from "node:crypto";
import { and, asc, eq, like, or } from "drizzle-orm";
import sharp, { type Metadata } from "sharp";
import { getDb } from "@/db";
import { media, showcases, type MediaKind, type MediaRow, MEDIA_KINDS } from "@/db/schema";
import type { AuthContext } from "@/lib/auth/session";
import { getStorage } from "./storage";

export class MediaError extends Error {
  constructor(
    public code: "too_large" | "unsupported_type" | "decode_failed" | "not_found" | "in_use" | "duplicate",
    public detail?: string,
  ) {
    super(code);
  }
}

// Size ceilings by family — enforced server-side before any processing.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

// Magic-byte sniffing for the non-image families (sharp itself is the
// validator for images — a spoofed extension fails to decode).
const VIDEO_SIGNATURES: { mime: string; check: (b: Buffer) => boolean }[] = [
  { mime: "video/mp4", check: (b) => b.length > 11 && b.subarray(4, 8).toString("ascii") === "ftyp" },
  { mime: "video/webm", check: (b) => b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
];

const DOCUMENT_SIGNATURES: { mime: string; check: (b: Buffer) => boolean }[] = [
  { mime: "application/pdf", check: (b) => b.subarray(0, 5).toString("ascii") === "%PDF-" },
];

const IMAGE_OUTPUT: Record<string, { ext: string; mime: string }> = {
  jpeg: { ext: "jpg", mime: "image/jpeg" },
  png: { ext: "png", mime: "image/png" },
  webp: { ext: "webp", mime: "image/webp" },
  svg: { ext: "svg", mime: "image/svg+xml" },
  gif: { ext: "gif", mime: "image/gif" },
};

const THUMB_WIDTH = 480;

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  kind: MediaKind;
}

export function isMediaKind(value: string): value is MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(value);
}

interface ProcessedFile {
  data: Buffer;
  ext: string;
  mime: string;
  width: number | null;
  height: number | null;
  thumb: Buffer | null;
}

async function processUpload(input: UploadInput): Promise<ProcessedFile> {
  const { buffer, kind } = input;

  if (kind === "video") {
    if (buffer.length > MAX_VIDEO_BYTES) throw new MediaError("too_large");
    const match = VIDEO_SIGNATURES.find((sig) => sig.check(buffer));
    if (!match) throw new MediaError("unsupported_type", "expected mp4/webm");
    const ext = match.mime === "video/mp4" ? "mp4" : "webm";
    return { data: buffer, ext, mime: match.mime, width: null, height: null, thumb: null };
  }

  if (kind === "document") {
    if (buffer.length > MAX_DOCUMENT_BYTES) throw new MediaError("too_large");
    const match = DOCUMENT_SIGNATURES.find((sig) => sig.check(buffer));
    if (!match) throw new MediaError("unsupported_type", "expected pdf");
    return { data: buffer, ext: "pdf", mime: match.mime, width: null, height: null, thumb: null };
  }

  // Image families (image / logo / screenshot / mockup): decoding IS the
  // validation — sharp rejects anything that isn't a real raster/vector.
  if (buffer.length > MAX_IMAGE_BYTES) throw new MediaError("too_large");

  let metadata: Metadata;
  try {
    metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new MediaError("decode_failed");
  }
  const format = metadata.format && IMAGE_OUTPUT[metadata.format] ? metadata.format : null;
  if (!format) throw new MediaError("unsupported_type", `format=${metadata.format ?? "unknown"}`);

  if (format === "svg") {
    // SVGs pass through unrasterized (logos); they are served with a
    // restrictive CSP and never inlined into admin/public HTML.
    return {
      data: buffer,
      ext: "svg",
      mime: "image/svg+xml",
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      thumb: null,
    };
  }

  // Re-encode: strips EXIF/metadata, applies orientation, caps dimensions.
  const pipeline = sharp(buffer, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 3000, height: 3000, fit: "inside", withoutEnlargement: true });
  const encoded =
    format === "png" || format === "gif"
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
      : format === "webp"
        ? await pipeline.webp({ quality: 84 }).toBuffer({ resolveWithObject: true })
        : await pipeline.jpeg({ quality: 84, mozjpeg: true }).toBuffer({ resolveWithObject: true });

  const thumb = await sharp(encoded.data)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer();

  const out = IMAGE_OUTPUT[format === "gif" ? "png" : format]!;
  return {
    data: encoded.data,
    ext: out.ext,
    mime: out.mime,
    width: encoded.info.width ?? null,
    height: encoded.info.height ?? null,
    thumb,
  };
}

export async function uploadMedia(auth: AuthContext, input: UploadInput): Promise<MediaRow> {
  const processed = await processUpload(input);
  const hash = createHash("sha256").update(processed.data).digest("hex").slice(0, 32);
  const fileName = `${hash}.${processed.ext}`;
  const thumbFileName = processed.thumb ? `${hash}-thumb.webp` : null;

  const storage = getStorage();
  await storage.write(fileName, processed.data);
  if (processed.thumb && thumbFileName) await storage.write(thumbFileName, processed.thumb);

  const db = getDb();
  // Same bytes uploaded twice → reuse the existing row (hash filename is unique).
  const existing = db.select().from(media).where(eq(media.fileName, fileName)).get();
  if (existing) return existing;

  const now = new Date();
  const id = crypto.randomUUID();
  db.insert(media)
    .values({
      id,
      fileName,
      thumbFileName,
      originalName: input.originalName.slice(0, 200),
      mime: processed.mime,
      kind: input.kind,
      sizeBytes: processed.data.length,
      width: processed.width,
      height: processed.height,
      createdBy: auth.user.id,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return db.select().from(media).where(eq(media.id, id)).get()!;
}

export async function replaceMediaFile(_auth: AuthContext, id: string, input: UploadInput): Promise<MediaRow> {
  const db = getDb();
  const row = db.select().from(media).where(eq(media.id, id)).get();
  if (!row) throw new MediaError("not_found");

  const processed = await processUpload({ ...input, kind: row.kind });
  const hash = createHash("sha256").update(processed.data).digest("hex").slice(0, 32);
  const fileName = `${hash}.${processed.ext}`;
  if (fileName === row.fileName) return row; // identical bytes
  // Another library item already owns these exact bytes — repointing would
  // collide with the unique hash-filename index; the caller should use that
  // item instead.
  if (db.select().from(media).where(eq(media.fileName, fileName)).get()) {
    throw new MediaError("duplicate");
  }

  const thumbFileName = processed.thumb ? `${hash}-thumb.webp` : null;
  const storage = getStorage();
  await storage.write(fileName, processed.data);
  if (processed.thumb && thumbFileName) await storage.write(thumbFileName, processed.thumb);

  // Point the existing row (and thus every reference) at the new file,
  // then remove the old binaries.
  db.update(media)
    .set({
      fileName,
      thumbFileName,
      originalName: input.originalName.slice(0, 200),
      mime: processed.mime,
      sizeBytes: processed.data.length,
      width: processed.width,
      height: processed.height,
      updatedAt: new Date(),
    })
    .where(eq(media.id, id))
    .run();

  await storage.delete(row.fileName);
  if (row.thumbFileName) await storage.delete(row.thumbFileName);
  return db.select().from(media).where(eq(media.id, id)).get()!;
}

export function listMedia(filter?: { kind?: MediaKind; query?: string }) {
  const db = getDb();
  let query = db.select().from(media).$dynamic();
  const conditions = [];
  if (filter?.kind) conditions.push(eq(media.kind, filter.kind));
  if (filter?.query) {
    const term = `%${filter.query}%`;
    conditions.push(or(like(media.originalName, term), like(media.altEn, term), like(media.altAr, term))!);
  }
  if (conditions.length > 0) query = query.where(and(...conditions));
  return query.orderBy(asc(media.createdAt)).all();
}

export function getMedia(id: string): MediaRow {
  const row = getDb().select().from(media).where(eq(media.id, id)).get();
  if (!row) throw new MediaError("not_found");
  return row;
}

export function updateMediaMeta(id: string, patch: { altEn?: string; altAr?: string; kind?: MediaKind }): MediaRow {
  const db = getDb();
  const row = db.select().from(media).where(eq(media.id, id)).get();
  if (!row) throw new MediaError("not_found");
  db.update(media)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(media.id, id))
    .run();
  return db.select().from(media).where(eq(media.id, id)).get()!;
}

/** Everywhere a media item is referenced. Showcase content references media
 * by id inside text/blocks columns (media:<id> URLs from Phase 5 renderers). */
export function mediaUsage(id: string): { entityType: string; entityId: string; label: string }[] {
  const term = `%${id}%`;
  const rows = getDb()
    .select({ id: showcases.id, slug: showcases.slug })
    .from(showcases)
    .where(or(like(showcases.blocksEn, term), like(showcases.blocksAr, term), like(showcases.storyEn, term), like(showcases.storyAr, term)))
    .all();
  return rows.map((row) => ({ entityType: "showcase", entityId: row.id, label: row.slug }));
}

export async function deleteMedia(id: string): Promise<void> {
  const row = getMedia(id);
  const usage = mediaUsage(id);
  if (usage.length > 0) throw new MediaError("in_use", usage.map((u) => u.label).join(","));
  getDb().delete(media).where(eq(media.id, id)).run();
  const storage = getStorage();
  await storage.delete(row.fileName);
  if (row.thumbFileName) await storage.delete(row.thumbFileName);
}
