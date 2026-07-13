import { getDb } from "@/db";
import { auditLog } from "@/db/schema";

interface AuditEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  /** Dotted verb, e.g. "auth.login", "content.publish". */
  action: string;
  entityType?: string;
  entityId?: string;
  /** Non-sensitive context only — never passwords, tokens, or secrets. */
  detail?: Record<string, unknown>;
}

export function recordAudit(entry: AuditEntry): void {
  getDb()
    .insert(auditLog)
    .values({
      actorId: entry.actorId ?? null,
      actorEmail: entry.actorEmail ?? null,
      action: entry.action,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      detail: entry.detail ? JSON.stringify(entry.detail) : null,
      createdAt: new Date(),
    })
    .run();
}
