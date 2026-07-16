import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { adminRoute } from "@/lib/auth/adminRoute";
import { hashPassword } from "@/lib/auth/password";
import { recordAudit } from "@/lib/auth/audit";
import { revokeAllSessionsForUser } from "@/lib/auth/session";

/**
 * Admin-initiated reset: the server generates a strong temporary password,
 * returns it exactly once in the response, and signs the user out
 * everywhere. Admins never choose other people's passwords.
 *
 * Never usable on yourself — it revokes every session for the target
 * immediately, including the one making the request, which would lock
 * the acting admin out with no way back in. Self-service password change
 * (which keeps the current session alive) lives at
 * /api/admin/account/password instead.
 */
export const POST = adminRoute("users.manage", async (_request, auth, params) => {
  if (params.id === auth.user.id) {
    return NextResponse.json({ error: "self_reset_forbidden" }, { status: 400 });
  }

  const db = getDb();
  const target = db.select().from(users).where(eq(users.id, params.id!)).get();
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const temporaryPassword = randomBytes(12).toString("base64url"); // 16 chars
  db.update(users)
    .set({ passwordHash: await hashPassword(temporaryPassword), updatedAt: new Date() })
    .where(eq(users.id, target.id))
    .run();
  revokeAllSessionsForUser(target.id);

  recordAudit({
    actorId: auth.user.id,
    actorEmail: auth.user.email,
    action: "user.reset_password",
    entityType: "user",
    entityId: target.id,
    detail: { email: target.email },
  });
  return NextResponse.json({ ok: true, temporaryPassword });
});
