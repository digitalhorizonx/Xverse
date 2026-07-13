import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { recordAudit } from "@/lib/auth/audit";
import { revokeAllSessionsForUser } from "@/lib/auth/session";
import { updateUser, UserRuleError } from "@/lib/auth/users";

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(ROLES).optional(),
    active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "empty patch" });

const RULE_STATUS: Record<string, number> = {
  email_taken: 409,
  self_change: 400,
  last_admin: 400,
  not_found: 404,
};

export const PATCH = adminRoute("users.manage", async (request, auth, params) => {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    updateUser(auth.user.id, params.id!, parsed.data);
  } catch (error) {
    if (error instanceof UserRuleError) {
      return NextResponse.json({ error: error.code }, { status: RULE_STATUS[error.code] ?? 400 });
    }
    throw error;
  }

  // Deactivation must cut access instantly, not at next expiry.
  if (parsed.data.active === false) {
    revokeAllSessionsForUser(params.id!);
  }

  recordAudit({
    actorId: auth.user.id,
    actorEmail: auth.user.email,
    action: "user.update",
    entityType: "user",
    entityId: params.id,
    detail: parsed.data,
  });
  return NextResponse.json({ ok: true });
});
