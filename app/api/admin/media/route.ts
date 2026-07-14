import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { isMediaKind, listMedia, uploadMedia } from "@/lib/media/service";
import { mediaErrorResponse } from "@/lib/media/httpErrors";

export const GET = adminRoute("content.view", (request) => {
  const url = new URL(request.url);
  const kindRaw = url.searchParams.get("kind") ?? "";
  const query = url.searchParams.get("q") ?? undefined;
  return NextResponse.json({
    media: listMedia({ kind: isMediaKind(kindRaw) ? kindRaw : undefined, query }),
  });
});

export const POST = adminRoute("media.upload", async (request, auth) => {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kindRaw = String(form?.get("kind") ?? "image");
  if (!form || !(file instanceof File) || file.size === 0 || !isMediaKind(kindRaw)) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  try {
    const row = await uploadMedia(auth, {
      buffer: Buffer.from(await file.arrayBuffer()),
      originalName: file.name || "upload",
      kind: kindRaw,
    });
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "media.upload",
      entityType: "media",
      entityId: row.id,
      detail: { fileName: row.fileName, kind: row.kind, sizeBytes: row.sizeBytes },
    });
    return NextResponse.json({ ok: true, media: row }, { status: 201 });
  } catch (error) {
    return mediaErrorResponse(error) ?? Promise.reject(error);
  }
});
