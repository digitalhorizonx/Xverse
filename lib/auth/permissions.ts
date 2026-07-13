import type { Role } from "@/db/schema";
import type { AuthContext } from "./session";

// The single authorization vocabulary. Every admin route handler and
// server action checks one of these — never a client-side role check.
export const PERMISSIONS = [
  // Content (Phase 3 consumers; defined now so the model is stable)
  "content.view",
  "content.edit",
  "content.publish",
  "content.delete",
  // Media (Phase 4)
  "media.upload",
  "media.delete",
  // Leads (Phase 6)
  "leads.view",
  "leads.manage",
  // System
  "users.manage",
  "settings.manage",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  admin: new Set<Permission>(PERMISSIONS),
  editor: new Set<Permission>([
    "content.view",
    "content.edit",
    "media.upload",
    "leads.view",
    "audit.view",
  ]),
  viewer: new Set<Permission>(["content.view", "leads.view", "audit.view"]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** Throws 401 when unauthenticated, 403 when the role lacks the permission. */
export function requirePermission(auth: AuthContext | null, permission: Permission): AuthContext {
  if (!auth) throw new AuthError(401, "Authentication required");
  if (!hasPermission(auth.user.role, permission)) {
    throw new AuthError(403, `Missing permission: ${permission}`);
  }
  return auth;
}
