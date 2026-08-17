import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";

export async function listAuditLog(filters: { userId?: string; from?: string; to?: string }) {
  const conditions = [];
  if (filters.userId) conditions.push(eq(auditLog.targetUserId, filters.userId));
  if (filters.from) conditions.push(gte(auditLog.createdAt, new Date(filters.from)));
  if (filters.to) conditions.push(lte(auditLog.createdAt, new Date(filters.to + "T23:59:59")));

  const rows = await db
    .select({
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      before: auditLog.before,
      after: auditLog.after,
      createdAt: auditLog.createdAt,
      actorUserId: auditLog.actorUserId,
      targetUserId: auditLog.targetUserId,
    })
    .from(auditLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  if (rows.length === 0) return [];

  const userRows = await db.query.users.findMany({
    columns: { id: true, fullName: true },
  });
  const nameById = new Map(userRows.map((u) => [u.id, u.fullName]));

  return rows.map((r) => ({
    ...r,
    actorName: nameById.get(r.actorUserId) ?? "Unknown",
    targetName: nameById.get(r.targetUserId) ?? "Unknown",
  }));
}
