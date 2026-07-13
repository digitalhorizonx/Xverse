import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { users, ROLES, type Role } from "@/db/schema";

export class UserRuleError extends Error {
  constructor(public code: "email_taken" | "self_change" | "last_admin" | "not_found") {
    super(code);
  }
}

export function listUsers() {
  return getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt)
    .all();
}

export function createUser(input: { email: string; name: string; role: Role; passwordHash: string }) {
  const db = getDb();
  const existing = db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).get();
  if (existing) throw new UserRuleError("email_taken");
  const now = new Date();
  const id = crypto.randomUUID();
  db.insert(users)
    .values({ id, ...input, active: true, createdAt: now, updatedAt: now })
    .run();
  return id;
}

function activeAdminCountExcluding(userId: string): number {
  const row = getDb()
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.active, true), ne(users.id, userId)))
    .get();
  return row?.count ?? 0;
}

/**
 * Guarded update. Rules that keep the console recoverable:
 * - you cannot change your own role or deactivate yourself;
 * - the last active admin can never be demoted or deactivated.
 */
export function updateUser(
  actorId: string,
  targetId: string,
  patch: { name?: string; role?: Role; active?: boolean },
) {
  const db = getDb();
  const target = db.select().from(users).where(eq(users.id, targetId)).get();
  if (!target) throw new UserRuleError("not_found");

  const changesRole = patch.role !== undefined && patch.role !== target.role;
  const changesActive = patch.active !== undefined && patch.active !== target.active;

  if (targetId === actorId && (changesRole || (changesActive && patch.active === false))) {
    throw new UserRuleError("self_change");
  }
  const losesAdmin =
    target.role === "admin" &&
    target.active &&
    ((changesRole && patch.role !== "admin") || (changesActive && patch.active === false));
  if (losesAdmin && activeAdminCountExcluding(targetId) === 0) {
    throw new UserRuleError("last_admin");
  }

  db.update(users)
    .set({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.role !== undefined ? { role: patch.role } : {}),
      ...(patch.active !== undefined ? { active: patch.active } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, targetId))
    .run();
  return target;
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
