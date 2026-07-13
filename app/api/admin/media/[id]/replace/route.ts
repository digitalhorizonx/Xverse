import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { replaceMediaFile } from "@/lib/media/service";
import { mediaErrorResponse } from "@/lib/media/httpErrors";

/** Swap the binary behind an existing media item. Every reference keeps
 * working because references point at the media id, not the file name. */
export const POST = adminRoute("media.upload", async (request, auth, params) => {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  try {
    const row = await replaceMediaFile(auth, params.id!, {
      buffer: Buffer.from(await file.arrayBuffer()),
      originalName: file.name || "upload",
      kind: "image", // ignored: replacement keeps the row's kind
    });
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "media.replace",
      entityType: "media",
      entityId: row.id,
      detail: { fileName: row.fileName, sizeBytes: row.sizeBytes },
    });
    return NextResponse.json({ ok: true, media: row });
  } catch (error) {
    return mediaErrorResponse(error) ?? Promise.reject(error);
  }
});
