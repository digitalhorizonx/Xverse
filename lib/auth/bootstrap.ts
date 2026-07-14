import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, passwordPolicyError } from "./password";
import { recordAudit } from "./audit";

/**
 * First-run admin creation, executed at server startup (instrumentation).
 * Runs ONLY when the users table is empty AND both bootstrap env vars are
 * set — so it can never overwrite or add accounts on an initialized
 * system, and redeploying with the vars still set is a no-op. Remove the
 * vars from the environment after first login.
 */
export async function bootstrapAdmin(): Promise<void> {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password) return;

  const db = getDb();
  const existing = db.select({ count: sql<number>`count(*)` }).from(users).get();
  if ((existing?.count ?? 0) > 0) return;

  const policyError = passwordPolicyError(password);
  if (policyError) {
    throw new Error(`ADMIN_BOOTSTRAP_PASSWORD rejected: ${policyError}`);
  }

  const id = crypto.randomUUID();
  const now = new Date();
  db.insert(users)
    .values({
      id,
      email,
      name: "HorizonX Admin",
      role: "admin",
      passwordHash: await hashPassword(password),
      active: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  recordAudit({ actorId: id, actorEmail: email, action: "user.bootstrap", entityType: "user", entityId: id });
  // eslint-disable-next-line no-console -- deliberate one-time operational signal
  console.log(`[xverse] bootstrap admin created: ${email}`);
}
