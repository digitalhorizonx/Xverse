import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Readiness endpoint. This app has no database or external dependency to
 * wait on, so "ready" is mostly equivalent to "live" — but it also echoes
 * back the build's resolved SITE_URL, which lets deploy/smoke-test.sh (and
 * a human) confirm the instance was actually built for the environment
 * it's running in, rather than e.g. a staging box serving production's URL.
 */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      check: "ready",
      siteUrl: SITE_URL,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
