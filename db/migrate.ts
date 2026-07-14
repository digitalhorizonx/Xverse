import path from "node:path";
import fs from "node:fs";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDb } from "./index";

/**
 * Applies committed Drizzle migrations (./drizzle) at process startup —
 * called from instrumentation.ts, so a deployed container always runs
 * against the schema its code expects. Transactional per migration;
 * a failure aborts startup rather than running on a half-migrated DB.
 */
export function runMigrations(): void {
  // In the standalone Docker image the migrations folder is copied next to
  // server.js (see Dockerfile); in dev it's the repo root.
  const candidates = [
    path.join(process.cwd(), "drizzle"),
    path.join(__dirname, "..", "drizzle"),
  ];
  const migrationsFolder = candidates.find((dir) => fs.existsSync(dir));
  if (!migrationsFolder) {
    throw new Error(
      `No drizzle migrations folder found (looked in: ${candidates.join(", ")})`,
    );
  }
  migrate(getDb(), { migrationsFolder });
}
