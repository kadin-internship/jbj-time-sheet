import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ptoRequests, users } from "@/lib/db/schema";

export function listPtoRequestsForUser(userId: string) {
  return db.query.ptoRequests.findMany({
    where: eq(ptoRequests.userId, userId),
    orderBy: [desc(ptoRequests.createdAt)],
  });
}

export function getPtoRequestById(id: string) {
  return db.query.ptoRequests.findFirst({ where: eq(ptoRequests.id, id) });
}

export async function listAllPtoRequestsWithUser() {
  const rows = await db
    .select({
      id: ptoRequests.id,
      userId: ptoRequests.userId,
      employeeName: users.fullName,
      type: ptoRequests.type,
      startDate: ptoRequests.startDate,
      endDate: ptoRequests.endDate,
      reason: ptoRequests.reason,
      status: ptoRequests.status,
      reviewedAt: ptoRequests.reviewedAt,
      createdAt: ptoRequests.createdAt,
    })
    .from(ptoRequests)
    .innerJoin(users, eq(users.id, ptoRequests.userId))
    .orderBy(desc(ptoRequests.createdAt));

  return rows;
}

export async function countPendingPtoRequests() {
  const rows = await db
    .select({ id: ptoRequests.id })
    .from(ptoRequests)
    .where(eq(ptoRequests.status, "pending"));
  return rows.length;
}
