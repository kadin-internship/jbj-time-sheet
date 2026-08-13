import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { timeEntries, users, weeklyTimesheets } from "@/lib/db/schema";
import { addDays, formatDateISO, parseDateISO } from "@/lib/utils/week";

export async function getOrCreateWeeklyTimesheet(userId: string, weekStartISO: string) {
  const existing = await db.query.weeklyTimesheets.findFirst({
    where: and(
      eq(weeklyTimesheets.userId, userId),
      eq(weeklyTimesheets.weekStartDate, weekStartISO),
    ),
  });
  if (existing) return existing;

  const weekEndISO = formatDateISO(addDays(parseDateISO(weekStartISO), 4));

  const [created] = await db
    .insert(weeklyTimesheets)
    .values({ userId, weekStartDate: weekStartISO, weekEndDate: weekEndISO })
    .onConflictDoNothing({ target: [weeklyTimesheets.userId, weeklyTimesheets.weekStartDate] })
    .returning();

  if (created) return created;

  // Lost a race with a concurrent request creating the same week — read it back.
  const raceWinner = await db.query.weeklyTimesheets.findFirst({
    where: and(
      eq(weeklyTimesheets.userId, userId),
      eq(weeklyTimesheets.weekStartDate, weekStartISO),
    ),
  });
  if (!raceWinner) throw new Error("Failed to create or find weekly timesheet");
  return raceWinner;
}

export function getTimesheetById(id: string) {
  return db.query.weeklyTimesheets.findFirst({ where: eq(weeklyTimesheets.id, id) });
}

export function getTimeEntriesForTimesheet(weeklyTimesheetId: string) {
  return db.query.timeEntries.findMany({
    where: eq(timeEntries.weeklyTimesheetId, weeklyTimesheetId),
  });
}

export async function getTimeEntryWithOwner(entryId: string) {
  const [row] = await db
    .select({
      entry: timeEntries,
      timesheetUserId: weeklyTimesheets.userId,
      timesheetId: weeklyTimesheets.id,
    })
    .from(timeEntries)
    .innerJoin(weeklyTimesheets, eq(weeklyTimesheets.id, timeEntries.weeklyTimesheetId))
    .where(eq(timeEntries.id, entryId));
  return row ?? null;
}

export function listUserTimesheets(userId: string) {
  return db.query.weeklyTimesheets.findMany({
    where: eq(weeklyTimesheets.userId, userId),
    orderBy: [desc(weeklyTimesheets.weekStartDate)],
  });
}

export async function listUserTimesheetsWithTotals(userId: string) {
  const rows = await db
    .select({
      id: weeklyTimesheets.id,
      weekStartDate: weeklyTimesheets.weekStartDate,
      weekEndDate: weeklyTimesheets.weekEndDate,
      weekTotal: sql<string>`coalesce(sum(${timeEntries.hours}), 0)`,
    })
    .from(weeklyTimesheets)
    .leftJoin(timeEntries, eq(timeEntries.weeklyTimesheetId, weeklyTimesheets.id))
    .where(eq(weeklyTimesheets.userId, userId))
    .groupBy(weeklyTimesheets.id)
    .orderBy(desc(weeklyTimesheets.weekStartDate));

  return rows.map((r) => ({ ...r, weekTotal: Number(r.weekTotal) }));
}

export async function listTimesheetsForWeek(weekStartISO: string) {
  const rows = await db
    .select({
      id: weeklyTimesheets.id,
      userId: weeklyTimesheets.userId,
      weekStartDate: weeklyTimesheets.weekStartDate,
      weekEndDate: weeklyTimesheets.weekEndDate,
      employeeName: users.fullName,
    })
    .from(weeklyTimesheets)
    .innerJoin(users, eq(users.id, weeklyTimesheets.userId))
    .where(eq(weeklyTimesheets.weekStartDate, weekStartISO))
    .orderBy(users.fullName);

  return rows;
}

export async function listAllTimesheetsWithUser() {
  const rows = await db
    .select({
      id: weeklyTimesheets.id,
      weekStartDate: weeklyTimesheets.weekStartDate,
      weekEndDate: weeklyTimesheets.weekEndDate,
      employeeName: users.fullName,
      weekTotal: sql<string>`coalesce(sum(${timeEntries.hours}), 0)`,
    })
    .from(weeklyTimesheets)
    .innerJoin(users, eq(users.id, weeklyTimesheets.userId))
    .leftJoin(timeEntries, eq(timeEntries.weeklyTimesheetId, weeklyTimesheets.id))
    .groupBy(weeklyTimesheets.id, users.fullName)
    .orderBy(desc(weeklyTimesheets.weekStartDate));

  return rows.map((r) => ({ ...r, weekTotal: Number(r.weekTotal) }));
}
