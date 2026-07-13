import { NextResponse } from "next/server";
import { z } from "zod";
import { ROLES } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { hashPassword, passwordPolicyError } from "@/lib/auth/password";
import { recordAudit } from "@/lib/auth/audit";
import { createUser, listUsers, UserRuleError } from "@/lib/auth/users";

export const GET = adminRoute("users.manage", () => {
  return NextResponse.json({ users: listUsers() });
});

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(1).max(120),
  role: z.enum(ROLES),
  password: z.string().max(200),
});

export const POST = adminRoute("users.manage", async (request, auth) => {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const { email, name, role, password } = parsed.data;
  if (passwordPolicyError(password)) {
    return NextResponse.json({ error: "password_policy" }, { status: 400 });
  }

  try {
    const id = createUser({ email, name, role, passwordHash: await hashPassword(password) });
    recordAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "user.create",
      entityType: "user",
      entityId: id,
      detail: { email, role },
    });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof UserRuleError && error.code === "email_taken") {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }
    throw error;
  }
});
