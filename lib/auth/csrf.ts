import { AuthError } from "./permissions";

/**
 * CSRF guard for every state-changing admin request: the session cookie is
 * SameSite=Lax (already blocks cross-site POSTs in modern browsers), and
 * this adds an explicit Origin/Host match so older or misconfigured
 * clients fail closed too. Same-origin requests always carry a matching
 * Origin on POST/PUT/PATCH/DELETE.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) {
    throw new AuthError(403, "Cross-origin request rejected");
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AuthError(403, "Cross-origin request rejected");
  }
  if (originHost !== host) {
    throw new AuthError(403, "Cross-origin request rejected");
  }
}
