import { NextResponse } from "next/server";
import { getAuth, type AuthContext } from "./session";
import { AuthError, requirePermission, type Permission } from "./permissions";
import { assertSameOrigin } from "./csrf";

type Handler = (request: Request, auth: AuthContext, params: Record<string, string>) => Promise<Response> | Response;

/**
 * The one wrapper every /api/admin handler goes through: resolves the
 * session, enforces the permission, and applies the CSRF origin check to
 * every non-GET method. Authorization lives here — in the API layer —
 * never in client code.
 */
export function adminRoute(permission: Permission, handler: Handler) {
  return async (request: Request, context?: { params?: Record<string, string> }) => {
    try {
      if (request.method !== "GET" && request.method !== "HEAD") {
        assertSameOrigin(request);
      }
      const auth = requirePermission(getAuth(), permission);
      return await handler(request, auth, context?.params ?? {});
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json({ error: error.status === 401 ? "unauthenticated" : "forbidden" }, { status: error.status });
      }
      throw error;
    }
  };
}
