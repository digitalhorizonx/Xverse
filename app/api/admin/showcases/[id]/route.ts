import { NextResponse } from "next/server";
import { z } from "zod";
import { SHOWCASE_TYPES } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { deleteShowcase, getShowcase, updateShowcase } from "@/lib/content/showcases";
import { contentErrorResponse } from "@/lib/content/httpErrors";

export const GET = adminRoute("content.view", (_request, _auth, params) => {
  try {
    return NextResponse.json({ showcase: getShowcase(params.id!) });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});

const patchSchema = z
  .object({
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(80),
    productId: z.string().min(1),
    type: z.enum(SHOWCASE_TYPES),
    verified: z.boolean(),
    featured: z.boolean(),
    industryId: z.string().nullable(),
    tagIds: z.string().max(2000),
    titleEn: z.string().max(300),
    titleAr: z.string().max(300),
    summaryEn: z.string().max(2000),
    summaryAr: z.string().max(2000),
    storyEn: z.string().max(20000),
    storyAr: z.string().max(20000),
    seoTitleEn: z.string().max(200),
    seoTitleAr: z.string().max(200),
    seoDescriptionEn: z.string().max(500),
    seoDescriptionAr: z.string().max(500),
    blocksEn: z.string().max(200000),
    blocksAr: z.string().max(200000),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export const PATCH = adminRoute("content.edit", async (request, auth, params) => {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const row = updateShowcase(auth, params.id!, parsed.data);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.update",
      entityType: "showcase",
      entityId: row.id,
      detail: { fields: Object.keys(parsed.data) },
    });
    return NextResponse.json({ ok: true, showcase: row });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});

export const DELETE = adminRoute("content.delete", async (_request, auth, params) => {
  try {
    const removed = deleteShowcase(auth, params.id!);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.delete",
      entityType: "showcase",
      entityId: params.id,
      detail: { slug: removed.slug },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
