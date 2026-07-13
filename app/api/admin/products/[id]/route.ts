import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { updateProduct } from "@/lib/content/catalog";
import { contentErrorResponse } from "@/lib/content/httpErrors";

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    taglineEn: z.string().max(200),
    taglineAr: z.string().max(200),
    descriptionEn: z.string().max(1000),
    descriptionAr: z.string().max(1000),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    live: z.boolean(),
    ctaLabelEn: z.string().max(100),
    ctaLabelAr: z.string().max(100),
    ctaUrl: z.string().url().max(300),
    active: z.boolean(),
    order: z.number().int().min(0).max(1000),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export const PATCH = adminRoute("content.edit", async (request, auth, params) => {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const product = updateProduct(auth, params.id!, parsed.data);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.product_update",
      entityType: "product",
      entityId: product.id,
      detail: { fields: Object.keys(parsed.data) },
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
