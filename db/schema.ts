import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// Phase 1 schema: identity, sessions, abuse control, and the audit trail.
// Content tables land in Phase 3 — keeping this PR reviewable on the
// security surface alone.

export const ROLES = ["admin", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(), // crypto.randomUUID()
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ROLES }).notNull().default("viewer"),
    // scrypt output, self-describing format: scrypt$N$r$p$salt$hash (b64url)
    passwordHash: text("password_hash").notNull(),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(), // crypto.randomUUID()
    // HMAC-SHA256(token, SESSION_SECRET) — the raw token only ever lives
    // in the visitor's cookie, so a leaked database cannot mint sessions.
    tokenHash: text("token_hash").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    // Coarse client hints for the security page / audit review; no IPs.
    userAgent: text("user_agent"),
  },
  (table) => ({
    tokenUnique: uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    byUser: index("sessions_user_idx").on(table.userId),
    byExpiry: index("sessions_expires_idx").on(table.expiresAt),
  }),
);

/** Failed/successful login attempts, for DB-backed rate limiting that
 * survives container restarts. Pruned opportunistically on write. */
export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Lowercased email attempted. */
    identifier: text("identifier").notNull(),
    /** SHA-256 of the client IP — enough to rate-limit, no raw PII at rest. */
    ipHash: text("ip_hash").notNull(),
    success: integer("success", { mode: "boolean" }).notNull(),
    attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    byIdentifier: index("login_attempts_identifier_idx").on(table.identifier, table.attemptedAt),
    byIp: index("login_attempts_ip_idx").on(table.ipHash, table.attemptedAt),
  }),
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Null for unauthenticated events (e.g. failed logins). */
    actorId: text("actor_id"),
    actorEmail: text("actor_email"),
    /** Dotted verb, e.g. "auth.login", "auth.login_failed", "user.bootstrap". */
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    /** JSON blob of non-sensitive context. Never passwords/tokens. */
    detail: text("detail"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    byTime: index("audit_log_time_idx").on(table.createdAt),
    byActor: index("audit_log_actor_idx").on(table.actorId),
  }),
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
