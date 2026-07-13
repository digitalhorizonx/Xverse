import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { reorderShowcases } from "@/lib/content/showcases";

const schema = z.object({ ids: z.array(z.string().min(1)).min(1).max(500) });

export const POST = adminRoute("content.edit", async (request, auth) => {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  reorderShowcases(auth, parsed.data.ids);
  recordAudit({
    actorId: auth.user.id,
    actorEmail: auth.user.email,
    action: "content.reorder",
    entityType: "showcase",
    detail: { count: parsed.data.ids.length },
  });
  return NextResponse.json({ ok: true });
});
