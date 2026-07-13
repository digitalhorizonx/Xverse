import { logger } from "@/lib/logger";

// Runs once when the server process starts. Ordering matters: migrations
// first (the code must never run against an older schema), then the
// one-time admin bootstrap. A failure aborts startup — deliberately: a
// half-migrated database is worse than a crashed deploy, which the
// compose healthcheck + rollback path already handle.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("./db/migrate");
    const { bootstrapAdmin } = await import("./lib/auth/bootstrap");
    const { databasePath } = await import("./db");
    runMigrations();
    logger.info("db_migrated", { path: databasePath() });
    await bootstrapAdmin();

    logger.info("server_starting", {
      pid: process.pid,
      nodeVersion: process.version,
    });
  }
}

// Best-effort structured logging for server-side request errors, so they
// land on stderr (separated from normal stdout logs) instead of Next's
// default unstructured console output.
export async function onRequestError(
  error: unknown,
  request?: { path?: string; method?: string },
) {
  logger.error("request_error", {
    message: error instanceof Error ? error.message : String(error),
    path: request?.path,
    method: request?.method,
  });
}
