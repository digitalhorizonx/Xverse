import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// One connection per process. better-sqlite3 is synchronous and
// single-writer, which is exactly the deployment shape (one container).
// WAL keeps readers unblocked during admin writes.

export type Db = BetterSQLite3Database<typeof schema>;

declare global {
  // eslint-disable-next-line no-var -- deliberate global cache: Next.js dev
  // hot-reload re-evaluates modules, and each better-sqlite3 handle holds
  // an OS-level file lock.
  var __xverseDb: Db | undefined;
}

export function databasePath(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), ".data", "xverse.db");
}

function open(): Db {
  const file = databasePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return drizzle(sqlite, { schema });
}

export function getDb(): Db {
  if (!globalThis.__xverseDb) {
    globalThis.__xverseDb = open();
  }
  return globalThis.__xverseDb;
}
