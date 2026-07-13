import { NextResponse } from "next/server";
import { z } from "zod";
import { SHOWCASE_TYPES, CONTENT_STATUSES } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { createShowcase, listShowcases } from "@/lib/content/showcases";
import { contentErrorResponse } from "@/lib/content/httpErrors";

export const GET = adminRoute("content.view", (request) => {
  const url = new URL(request.url);
  const productId = url.searchParams.get("product") ?? undefined;
  const statusRaw = url.searchParams.get("status") ?? undefined;
  const status = CONTENT_STATUSES.find((value) => value === statusRaw);
  return NextResponse.json({ showcases: listShowcases({ productId, status }) });
});

const createSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .min(2)
    .max(80),
  productId: z.string().min(1),
  type: z.enum(SHOWCASE_TYPES).optional(),
});

export const POST = adminRoute("content.edit", async (request, auth) => {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const row = createShowcase(auth, parsed.data);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.create",
      entityType: "showcase",
      entityId: row.id,
      detail: { slug: row.slug, productId: row.productId },
    });
    return NextResponse.json({ ok: true, showcase: row }, { status: 201 });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
