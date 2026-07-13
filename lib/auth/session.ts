import { createHmac, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb } from "@/db";
import { sessions, users, type Role, type User } from "@/db/schema";

export const SESSION_COOKIE = "xverse-admin-session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
/** Sliding renewal: extend when less than this much lifetime remains. */
const RENEW_BELOW_MS = 3 * 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // Fail closed: an admin surface must never run with a missing/weak
    // secret. (Set a 32+ char random value; see .env.production.example.)
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters");
  }
  return secret;
}

/** The cookie holds the raw token; the DB stores only its keyed hash. */
export function hashSessionToken(token: string): string {
  return createHmac("sha256", sessionSecret()).update(token).digest("base64url");
}

export interface AuthContext {
  user: Pick<User, "id" | "email" | "name" | "role">;
  sessionId: string;
}

export function createSession(userId: string, userAgent?: string | null) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const id = crypto.randomUUID();
  db.insert(sessions)
    .values({
      id,
      tokenHash: hashSessionToken(token),
      userId,
      createdAt: new Date(now),
      expiresAt: new Date(now + SESSION_TTL_MS),
      userAgent: userAgent?.slice(0, 200) ?? null,
    })
    .run();
  // Opportunistic cleanup of expired rows.
  db.delete(sessions).where(lt(sessions.expiresAt, new Date(now))).run();
  return { token, expiresAt: new Date(now + SESSION_TTL_MS) };
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

/** Resolve the current request's session from the cookie. Null when
 * absent/expired/revoked or the user was deactivated. */
export function getAuth(): AuthContext | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashSessionToken(token)), gt(sessions.expiresAt, new Date())))
    .get();

  if (!row || !row.active) return null;

  // Sliding expiry, renewed at most once per visit window.
  if (row.expiresAt.getTime() - Date.now() < RENEW_BELOW_MS) {
    db.update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_TTL_MS) })
      .where(eq(sessions.id, row.sessionId))
      .run();
  }

  return {
    sessionId: row.sessionId,
    user: { id: row.id, email: row.email, name: row.name, role: row.role as Role },
  };
}

export function revokeSession(sessionId: string): void {
  getDb().delete(sessions).where(eq(sessions.id, sessionId)).run();
}

export function revokeAllSessionsForUser(userId: string): void {
  getDb().delete(sessions).where(eq(sessions.userId, userId)).run();
}
