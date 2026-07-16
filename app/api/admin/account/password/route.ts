import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { sessions, users } from "@/db/schema";
import { getAuth } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { AuthError } from "@/lib/auth/permissions";
import { hashPassword, passwordPolicyError, verifyPassword } from "@/lib/auth/password";
import { recordAudit } from "@/lib/auth/audit";

const bodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

/**
 * Self-service password change — deliberately not behind adminRoute()'s
 * permission gate, since this needs only "you are signed in," not any
 * content/admin permission (every role gets to change their own
 * password). Verifies the current password, then revokes every OTHER
 * session but keeps this request's session alive: the whole point is
 * that changing your own password can never lock you out, unlike the
 * admin-initiated reset at /api/admin/users/:id/reset-password.
 */
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "forbidden" }, { status: error.status });
    }
    throw error;
  }

  const auth = getAuth();
  if (!auth) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const policyError = passwordPolicyError(parsed.data.newPassword);
  if (policyError) return NextResponse.json({ error: "weak_password", detail: policyError }, { status: 400 });

  const db = getDb();
  const row = db.select().from(users).where(eq(users.id, auth.user.id)).get();
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const currentOk = await verifyPassword(parsed.data.currentPassword, row.passwordHash);
  if (!currentOk) return NextResponse.json({ error: "wrong_current_password" }, { status: 401 });

  db.update(users)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() })
    .where(eq(users.id, auth.user.id))
    .run();

  db.delete(sessions)
    .where(and(eq(sessions.userId, auth.user.id), ne(sessions.id, auth.sessionId)))
    .run();

  recordAudit({
    actorId: auth.user.id,
    actorEmail: auth.user.email,
    action: "user.change_own_password",
    entityType: "user",
    entityId: auth.user.id,
  });

  return NextResponse.json({ ok: true });
}
