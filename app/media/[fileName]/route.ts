import { eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { getStorage } from "@/lib/media/storage";

/**
 * Public media serving: /media/<hash>.<ext> (and /media/<hash>-thumb.webp).
 * File names are content hashes, so responses are immutable — replacing a
 * file changes its URL, which is exactly what makes long-lived caching safe.
 * Auth-free by design: everything in the library is publishable content.
 */
export async function GET(_request: Request, context: { params: { fileName: string } }) {
  const fileName = context.params.fileName;
  if (!/^[a-z0-9]+(?:-thumb)?\.[a-z0-9]+$/.test(fileName)) {
    return new Response("Not found", { status: 404 });
  }

  const row = getDb()
    .select()
    .from(media)
    .where(or(eq(media.fileName, fileName), eq(media.thumbFileName, fileName)))
    .get();
  if (!row) return new Response("Not found", { status: 404 });

  let data: Buffer;
  try {
    data = await getStorage().read(fileName);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const isThumb = fileName === row.thumbFileName;
  const mime = isThumb ? "image/webp" : row.mime;
  const headers = new Headers({
    "Content-Type": mime,
    "Content-Length": String(data.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (mime === "image/svg+xml") {
    // SVG can carry script: neutralize it when rendered directly.
    headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'");
  }
  return new Response(new Uint8Array(data), { headers });
}
