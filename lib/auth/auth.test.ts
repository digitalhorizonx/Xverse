// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Every test runs against a throwaway on-disk SQLite database with the
// real committed migrations applied — the same code path production boots
// through, not a mocked storage layer.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xverse-auth-test-"));
process.env.DATABASE_PATH = path.join(tmpDir, "test.db");
process.env.SESSION_SECRET = "unit-test-session-secret-0123456789abcdef";

import { hashPassword, verifyPassword, passwordPolicyError } from "./password";
import { hasPermission, requirePermission, AuthError } from "./permissions";
import { assertSameOrigin } from "./csrf";
import { isLoginRateLimited, recordLoginAttempt } from "./rateLimit";
import { createSession, hashSessionToken } from "./session";
import { bootstrapAdmin } from "./bootstrap";
import { runMigrations } from "@/db/migrate";
import { getDb } from "@/db";
import { users, sessions, loginAttempts, auditLog } from "@/db/schema";

runMigrations();

beforeEach(() => {
  const db = getDb();
  db.delete(sessions).run();
  db.delete(loginAttempts).run();
  db.delete(auditLog).run();
  db.delete(users).run();
});

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password entirely", hash)).toBe(false);
  });

  it("produces unique salts", async () => {
    const a = await hashPassword("same password");
    const b = await hashPassword("same password");
    expect(a).not.toEqual(b);
  });

  it("rejects malformed stored hashes without throwing", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$whatever")).toBe(false);
  });

  it("enforces the password policy", () => {
    expect(passwordPolicyError("short")).toBeTruthy();
    expect(passwordPolicyError("long enough password")).toBeNull();
  });
});

describe("permissions", () => {
  it("maps roles to their permission sets", () => {
    expect(hasPermission("admin", "users.manage")).toBe(true);
    expect(hasPermission("editor", "content.edit")).toBe(true);
    expect(hasPermission("editor", "content.publish")).toBe(false);
    expect(hasPermission("editor", "content.delete")).toBe(false);
    expect(hasPermission("viewer", "content.view")).toBe(true);
    expect(hasPermission("viewer", "content.edit")).toBe(false);
  });

  it("requirePermission throws 401 unauthenticated, 403 unauthorized", () => {
    expect(() => requirePermission(null, "content.view")).toThrowError(AuthError);
    try {
      requirePermission(null, "content.view");
    } catch (error) {
      expect((error as AuthError).status).toBe(401);
    }
    const viewer = { sessionId: "s", user: { id: "u", email: "v@x", name: "V", role: "viewer" as const } };
    try {
      requirePermission(viewer, "content.publish");
    } catch (error) {
      expect((error as AuthError).status).toBe(403);
    }
    expect(requirePermission(viewer, "content.view")).toBe(viewer);
  });
});

describe("csrf origin assertion", () => {
  const make = (headers: Record<string, string>) =>
    new Request("https://xverse.horizonx.site/api/admin/login", { method: "POST", headers });

  it("accepts same-origin requests", () => {
    expect(() =>
      assertSameOrigin(make({ origin: "https://xverse.horizonx.site", host: "xverse.horizonx.site" })),
    ).not.toThrow();
  });

  it("rejects cross-origin and missing-origin requests", () => {
    expect(() =>
      assertSameOrigin(make({ origin: "https://evil.example", host: "xverse.horizonx.site" })),
    ).toThrowError(AuthError);
    expect(() => assertSameOrigin(make({ host: "xverse.horizonx.site" }))).toThrowError(AuthError);
  });

  it("honors x-forwarded-host from the reverse proxy", () => {
    expect(() =>
      assertSameOrigin(
        make({
          origin: "https://xverse.horizonx.site",
          host: "127.0.0.1:3000",
          "x-forwarded-host": "xverse.horizonx.site",
        }),
      ),
    ).not.toThrow();
  });
});

describe("login rate limiting", () => {
  it("locks an identifier after 5 failures and ignores successes", () => {
    for (let i = 0; i < 4; i++) recordLoginAttempt("a@x.com", "1.2.3.4", false);
    recordLoginAttempt("a@x.com", "1.2.3.4", true);
    expect(isLoginRateLimited("a@x.com", "1.2.3.4")).toBe(false);
    recordLoginAttempt("a@x.com", "1.2.3.4", false);
    expect(isLoginRateLimited("a@x.com", "1.2.3.4")).toBe(true);
    // A different account from a different IP is unaffected.
    expect(isLoginRateLimited("b@x.com", "5.6.7.8")).toBe(false);
  });

  it("locks an IP spraying many accounts", () => {
    for (let i = 0; i < 20; i++) recordLoginAttempt(`victim${i}@x.com`, "9.9.9.9", false);
    expect(isLoginRateLimited("fresh@x.com", "9.9.9.9")).toBe(true);
    expect(isLoginRateLimited("fresh@x.com", "1.1.1.1")).toBe(false);
  });
});

describe("sessions", () => {
  it("stores only the keyed hash of the token", async () => {
    const db = getDb();
    const now = new Date();
    db.insert(users)
      .values({
        id: "u1",
        email: "s@x.com",
        name: "S",
        role: "admin",
        passwordHash: await hashPassword("irrelevant-password"),
        active: true,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const { token, expiresAt } = createSession("u1", "vitest");
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

    const stored = db.select().from(sessions).all();
    expect(stored).toHaveLength(1);
    expect(stored[0]!.tokenHash).not.toEqual(token);
    expect(stored[0]!.tokenHash).toEqual(hashSessionToken(token));
  });
});

describe("bootstrap", () => {
  it("creates the first admin once and never again", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_EMAIL", "Boss@HorizonX.site");
    vi.stubEnv("ADMIN_BOOTSTRAP_PASSWORD", "a-strong-bootstrap-pass");
    await bootstrapAdmin();

    const db = getDb();
    const all = db.select().from(users).all();
    expect(all).toHaveLength(1);
    expect(all[0]!.email).toBe("boss@horizonx.site"); // normalized
    expect(all[0]!.role).toBe("admin");

    // Second run (e.g. redeploy with vars still set) is a no-op.
    await bootstrapAdmin();
    expect(getDb().select().from(users).all()).toHaveLength(1);
    vi.unstubAllEnvs();
  });

  it("rejects a bootstrap password that fails policy", async () => {
    vi.stubEnv("ADMIN_BOOTSTRAP_EMAIL", "boss@horizonx.site");
    vi.stubEnv("ADMIN_BOOTSTRAP_PASSWORD", "short");
    await expect(bootstrapAdmin()).rejects.toThrow(/rejected/);
    vi.unstubAllEnvs();
  });
});
