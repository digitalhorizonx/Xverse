/**
 * Minimal structured (JSON-line) logger for server-side code. info/warn go
 * to stdout, error goes to stderr — Docker's json-file driver captures
 * them as separate streams, and `docker compose logs` can filter by it.
 */
type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  const line = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...meta,
  });
  if (level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => write("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => write("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => write("error", event, meta),
};
