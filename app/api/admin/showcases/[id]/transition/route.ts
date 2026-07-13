import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTENT_STATUSES } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { transitionShowcase } from "@/lib/content/showcases";
import { contentErrorResponse } from "@/lib/content/httpErrors";

const schema = z.object({ to: z.enum(CONTENT_STATUSES) });

// content.edit here, not content.publish: the service layer decides which
// transitions additionally demand publish rights — editors may move
// draft ⇄ in_review, and only gatekeepers approve/publish/unpublish.
export const POST = adminRoute("content.edit", async (request, auth, params) => {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const row = transitionShowcase(auth, params.id!, parsed.data.to);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: `content.transition`,
      entityType: "showcase",
      entityId: row.id,
      detail: { to: parsed.data.to, slug: row.slug },
    });
    return NextResponse.json({ ok: true, showcase: row });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
