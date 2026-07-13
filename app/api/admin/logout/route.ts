import { NextResponse } from "next/server";
import { getAuth, revokeSession, SESSION_COOKIE } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/auth/csrf";
import { recordAudit } from "@/lib/auth/audit";
import { AuthError } from "@/lib/auth/permissions";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "forbidden" }, { status: error.status });
    }
    throw error;
  }

  const auth = getAuth();
  if (auth) {
    revokeSession(auth.sessionId);
    recordAudit({ actorId: auth.user.id, actorEmail: auth.user.email, action: "auth.logout" });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
