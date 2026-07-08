import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Liveness + uptime monitoring endpoint. Returns 200 as long as the Node
 * process is alive and able to handle a request — used by Docker's
 * HEALTHCHECK, nginx, deploy/smoke-test scripts, and external uptime
 * monitors alike.
 */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      check: "live",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
