import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { restoreShowcaseVersion } from "@/lib/content/showcases";
import { contentErrorResponse } from "@/lib/content/httpErrors";

const schema = z.object({ versionId: z.number().int().positive() });

export const POST = adminRoute("content.edit", async (request, auth, params) => {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  try {
    const row = restoreShowcaseVersion(auth, params.id!, parsed.data.versionId);
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "content.restore",
      entityType: "showcase",
      entityId: row.id,
      detail: { versionId: parsed.data.versionId },
    });
    return NextResponse.json({ ok: true, showcase: row });
  } catch (error) {
    return contentErrorResponse(error) ?? Promise.reject(error);
  }
});
