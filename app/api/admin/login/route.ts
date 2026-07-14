import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { clientIp, isLoginRateLimited, recordLoginAttempt } from "@/lib/auth/rateLimit";
import { recordAudit } from "@/lib/auth/audit";
import { AuthError } from "@/lib/auth/permissions";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

// One generic failure message: never reveal whether the account exists.
const INVALID = { error: "invalid_credentials" } as const;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "forbidden" }, { status: error.status });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(INVALID, { status: 400 });
  }
  const { email, password } = parsed.data;
  const ip = clientIp(request);

  if (isLoginRateLimited(email, ip)) {
    recordAudit({ actorEmail: email, action: "auth.login_rate_limited" });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const user = getDb().select().from(users).where(eq(users.email, email)).get();
  const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !user.active || !passwordOk) {
    recordLoginAttempt(email, ip, false);
    recordAudit({ actorEmail: email, action: "auth.login_failed" });
    return NextResponse.json(INVALID, { status: 401 });
  }

  recordLoginAttempt(email, ip, true);
  const { token, expiresAt } = createSession(user.id, request.headers.get("user-agent"));
  recordAudit({ actorId: user.id, actorEmail: user.email, action: "auth.login" });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  return response;
}
