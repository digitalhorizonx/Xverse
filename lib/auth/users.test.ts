// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "xverse-users-test-"));
process.env.DATABASE_PATH = path.join(tmpDir, "test.db");
process.env.SESSION_SECRET = "unit-test-session-secret-0123456789abcdef";

import { createUser, listUsers, updateUser, UserRuleError } from "./users";
import { runMigrations } from "@/db/migrate";
import { getDb } from "@/db";
import { users, sessions } from "@/db/schema";

runMigrations();

function seed(id: string, role: "admin" | "editor" | "viewer", active = true) {
  const now = new Date();
  getDb()
    .insert(users)
    .values({
      id,
      email: `${id}@x.com`,
      name: id,
      role,
      passwordHash: "scrypt$1$1$1$aa$aa",
      active,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

beforeEach(() => {
  getDb().delete(sessions).run();
  getDb().delete(users).run();
});

describe("user management rules", () => {
  it("rejects duplicate emails", () => {
    seed("a1", "admin");
    expect(() =>
      createUser({ email: "a1@x.com", name: "dupe", role: "viewer", passwordHash: "scrypt$1$1$1$aa$aa" }),
    ).toThrowError(UserRuleError);
  });

  it("prevents changing your own role or deactivating yourself", () => {
    seed("a1", "admin");
    seed("a2", "admin");
    expect(() => updateUser("a1", "a1", { role: "editor" })).toThrow(/self_change/);
    expect(() => updateUser("a1", "a1", { active: false })).toThrow(/self_change/);
    // Renaming yourself is fine.
    expect(() => updateUser("a1", "a1", { name: "New Name" })).not.toThrow();
  });

  it("protects the last active admin from demotion and deactivation", () => {
    seed("a1", "admin");
    seed("e1", "editor");
    expect(() => updateUser("e1", "a1", { role: "editor" })).toThrow(/last_admin/);
    expect(() => updateUser("e1", "a1", { active: false })).toThrow(/last_admin/);
    // With a second active admin, it's allowed.
    seed("a2", "admin");
    expect(() => updateUser("a2", "a1", { role: "editor" })).not.toThrow();
  });

  it("an inactive admin does not count toward the last-admin rule", () => {
    seed("a1", "admin");
    seed("a2", "admin", false);
    seed("e1", "editor");
    expect(() => updateUser("e1", "a1", { active: false })).toThrow(/last_admin/);
  });

  it("lists users without password hashes", () => {
    seed("a1", "admin");
    const rows = listUsers();
    expect(rows).toHaveLength(1);
    expect(rows[0]).not.toHaveProperty("passwordHash");
  });
});
