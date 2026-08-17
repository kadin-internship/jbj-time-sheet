import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbOrTx = typeof db | Tx;

export type AuditEntityType = "time_entry" | "weekly_notes" | "pto_request";
export type AuditAction = "create" | "update" | "delete" | "approve" | "deny";

export async function recordAudit(
  fields: {
    actorUserId: string;
    entityType: AuditEntityType;
    entityId: string;
    action: AuditAction;
    targetUserId: string;
    before?: unknown;
    after?: unknown;
  },
  tx?: DbOrTx,
) {
  const client = tx ?? db;
  await client.insert(auditLog).values({
    actorUserId: fields.actorUserId,
    entityType: fields.entityType,
    entityId: fields.entityId,
    action: fields.action,
    targetUserId: fields.targetUserId,
    before: fields.before ?? null,
    after: fields.after ?? null,
  });
}
