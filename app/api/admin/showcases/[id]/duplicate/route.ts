import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { duplicateShowcase } from "@/lib/content/showcases";
import { contentErrorResponse } from "@/lib/content/httpErrors";

export const POST = adminRoute("content.edit", async (_request, auth, params) => {
  try {
    const copy = duplicateShowcase(auth, params.id!);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.duplicate",
      entityType: "showcase",
      entityId: copy.id,
      detail: { from: params.id, slug: copy.slug },
    });
    return NextResponse.json({ ok: true, showcase: copy }, { status: 201 });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
