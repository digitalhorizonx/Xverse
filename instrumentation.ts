import { logger } from "@/lib/logger";

// Runs once when the server process starts — the natural place to emit a
// structured "server is up" log line (Docker/nginx/deploy scripts still
// gate readiness on /api/health, this is purely for log aggregation).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
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
