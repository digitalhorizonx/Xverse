import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { listTags, upsertTag } from "@/lib/content/catalog";
import { contentErrorResponse } from "@/lib/content/httpErrors";

export const GET = adminRoute("content.view", () => {
  return NextResponse.json({ tags: listTags() });
});

const schema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(2).max(60),
  kind: z.enum(["category", "tag"]),
  nameEn: z.string().trim().min(1).max(120),
  nameAr: z.string().trim().min(1).max(120),
});

export const POST = adminRoute("content.edit", async (request, auth) => {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const id = upsertTag(parsed.data);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.tag_upsert",
      entityType: "tag",
      entityId: id,
      detail: { slug: parsed.data.slug, kind: parsed.data.kind },
    });
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
