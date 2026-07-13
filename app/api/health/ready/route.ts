import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { SITE_URL } from "@/lib/site";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Readiness endpoint. Since V2 the app owns a SQLite database, so "ready"
 * now proves the schema is reachable, and still echoes the build's
 * resolved SITE_URL so deploy verification (and a human) can confirm the
 * instance was built for the environment it's serving.
 */
export function GET() {
  let database: "ok" | "error" = "ok";
  try {
    getDb().get(sql`select 1`);
  } catch {
    database = "error";
  }

  return NextResponse.json(
    {
      status: database === "ok" ? "ok" : "degraded",
      check: "ready",
      database,
      siteUrl: SITE_URL,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { status: database === "ok" ? 200 : 503 },
  );
}
