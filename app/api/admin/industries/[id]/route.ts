import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { deleteIndustry } from "@/lib/content/catalog";

export const DELETE = adminRoute("content.delete", (_request, auth, params) => {
  deleteIndustry(params.id!);
  recordAudit({
    actorId: auth.user.id,
    actorEmail: auth.user.email,
    action: "content.industry_delete",
    entityType: "industry",
    entityId: params.id,
  });
  return NextResponse.json({ ok: true });
});
