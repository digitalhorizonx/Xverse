import { createHash } from "node:crypto";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { loginAttempts } from "@/db/schema";

// DB-backed limits so restarts don't reset counters. Two axes:
// - per account: stops targeted guessing regardless of botnet size
// - per IP: stops one host spraying many accounts
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_IDENTIFIER = 5;
const MAX_FAILURES_PER_IP = 20;

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("base64url");
}

export function clientIp(request: Request): string {
  // nginx terminates TLS on the VPS and sets X-Forwarded-For; the app port
  // is bound to localhost, so the first hop value is trustworthy there.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return "unknown";
}

export function isLoginRateLimited(identifier: string, ip: string): boolean {
  const db = getDb();
  const since = new Date(Date.now() - WINDOW_MS);

  const byIdentifier = db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, since),
      ),
    )
    .get();
  if ((byIdentifier?.count ?? 0) >= MAX_FAILURES_PER_IDENTIFIER) return true;

  const byIp = db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.ipHash, hashIp(ip)),
        eq(loginAttempts.success, false),
        gte(loginAttempts.attemptedAt, since),
      ),
    )
    .get();
  return (byIp?.count ?? 0) >= MAX_FAILURES_PER_IP;
}

export function recordLoginAttempt(identifier: string, ip: string, success: boolean): void {
  const db = getDb();
  db.insert(loginAttempts)
    .values({
      identifier,
      ipHash: hashIp(ip),
      success,
      attemptedAt: new Date(),
    })
    .run();
  // Opportunistic pruning keeps the table tiny.
  db.delete(loginAttempts)
    .where(lt(loginAttempts.attemptedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
    .run();
}
