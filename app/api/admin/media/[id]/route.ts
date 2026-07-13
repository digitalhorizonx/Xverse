import { NextResponse } from "next/server";
import { z } from "zod";
import { MEDIA_KINDS } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { deleteMedia, getMedia, mediaUsage, updateMediaMeta } from "@/lib/media/service";
import { mediaErrorResponse } from "@/lib/media/httpErrors";

export const GET = adminRoute("content.view", (_request, _auth, params) => {
  try {
    const row = getMedia(params.id!);
    return NextResponse.json({ media: row, usage: mediaUsage(row.id) });
  } catch (error) {
    return mediaErrorResponse(error) ?? Promise.reject(error);
  }
});

const patchSchema = z
  .object({
    altEn: z.string().max(300),
    altAr: z.string().max(300),
    kind: z.enum(MEDIA_KINDS),
  })
  .partial();

export const PATCH = adminRoute("media.upload", async (request, auth, params) => {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const row = updateMediaMeta(params.id!, parsed.data);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "media.update",
      entityType: "media",
      entityId: row.id,
      detail: { fields: Object.keys(parsed.data) },
    });
    return NextResponse.json({ ok: true, media: row });
  } catch (error) {
    return mediaErrorResponse(error) ?? Promise.reject(error);
  }
});

export const DELETE = adminRoute("media.delete", async (_request, auth, params) => {
  try {
    const row = getMedia(params.id!);
    await deleteMedia(row.id);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "media.delete",
      entityType: "media",
      entityId: row.id,
      detail: { fileName: row.fileName, originalName: row.originalName },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mediaErrorResponse(error) ?? Promise.reject(error);
  }
});
