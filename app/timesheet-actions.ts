"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { activityTypeEnum, timeEntries, weeklyTimesheets } from "@/lib/db/schema";
import { getTimesheetById, getTimeEntryWithOwner } from "@/lib/db/queries/timesheets";
import { hoursBetween } from "@/lib/utils/time";

const timeEntrySchema = z.object({
  timesheetId: z.string().uuid(),
  projectId: z.string().uuid(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  activityType: z.enum(activityTypeEnum.enumValues),
  notes: z.string().max(2000).optional(),
});

// Loosely typed at the call boundary (activityType as plain string) so client components don't
// need to import the server-only zod schema's literal union; timeEntrySchema.safeParse enforces
// the real constraint at runtime.
export type TimeEntryInput = {
  timesheetId: string;
  projectId: string;
  entryDate: string;
  startTime: string;
  endTime: string;
  activityType: string;
  notes?: string;
};

async function authorizeForTimesheet(timesheetId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." as const, timesheet: null };

  const timesheet = await getTimesheetById(timesheetId);
  if (!timesheet) return { error: "Timesheet not found." as const, timesheet: null };

  const isOwner = timesheet.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) return { error: "Not authorized." as const, timesheet: null };

  return { error: null, timesheet };
}

function revalidateTimesheetPaths(timesheetId: string, weekStartDate: string) {
  revalidatePath("/dashboard");
  revalidatePath("/timesheets");
  revalidatePath(`/timesheets/${weekStartDate}`);
  revalidatePath("/admin/timesheets");
  revalidatePath(`/admin/timesheets/${timesheetId}`);
}

export async function createTimeEntryAction(
  input: TimeEntryInput,
): Promise<{ error: string | null }> {
  const parsed = timeEntrySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;

  const { error, timesheet } = await authorizeForTimesheet(data.timesheetId);
  if (error || !timesheet) return { error };

  if (data.entryDate < timesheet.weekStartDate || data.entryDate > timesheet.weekEndDate) {
    return { error: "That date isn't in this week." };
  }

  const hours = hoursBetween(data.startTime, data.endTime);
  if (hours <= 0) return { error: "End time must be after start time." };

  await db.insert(timeEntries).values({
    weeklyTimesheetId: data.timesheetId,
    projectId: data.projectId,
    entryDate: data.entryDate,
    startTime: data.startTime,
    endTime: data.endTime,
    activityType: data.activityType,
    notes: data.notes || null,
    hours: hours.toFixed(2),
  });

  revalidateTimesheetPaths(data.timesheetId, timesheet.weekStartDate);
  return { error: null };
}

export async function updateTimeEntryAction(
  entryId: string,
  input: TimeEntryInput,
): Promise<{ error: string | null }> {
  const parsed = timeEntrySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;

  const { error, timesheet } = await authorizeForTimesheet(data.timesheetId);
  if (error || !timesheet) return { error };

  const owned = await getTimeEntryWithOwner(entryId);
  if (!owned || owned.timesheetId !== data.timesheetId) {
    return { error: "Entry not found." };
  }

  if (data.entryDate < timesheet.weekStartDate || data.entryDate > timesheet.weekEndDate) {
    return { error: "That date isn't in this week." };
  }

  const hours = hoursBetween(data.startTime, data.endTime);
  if (hours <= 0) return { error: "End time must be after start time." };

  await db
    .update(timeEntries)
    .set({
      projectId: data.projectId,
      entryDate: data.entryDate,
      startTime: data.startTime,
      endTime: data.endTime,
      activityType: data.activityType,
      notes: data.notes || null,
      hours: hours.toFixed(2),
    })
    .where(eq(timeEntries.id, entryId));

  revalidateTimesheetPaths(data.timesheetId, timesheet.weekStartDate);
  return { error: null };
}

export async function deleteTimeEntryAction(entryId: string): Promise<{ error: string | null }> {
  const owned = await getTimeEntryWithOwner(entryId);
  if (!owned) return { error: "Entry not found." };

  const { error, timesheet } = await authorizeForTimesheet(owned.timesheetId);
  if (error || !timesheet) return { error };

  await db.delete(timeEntries).where(eq(timeEntries.id, entryId));

  revalidateTimesheetPaths(owned.timesheetId, timesheet.weekStartDate);
  return { error: null };
}

export async function updateWeeklyActivityNotesAction(
  timesheetId: string,
  notes: string,
): Promise<{ error: string | null }> {
  const { error, timesheet } = await authorizeForTimesheet(timesheetId);
  if (error || !timesheet) return { error };

  await db
    .update(weeklyTimesheets)
    .set({ weeklyActivityNotes: notes.slice(0, 4000), updatedAt: new Date() })
    .where(eq(weeklyTimesheets.id, timesheetId));

  revalidateTimesheetPaths(timesheetId, timesheet.weekStartDate);
  return { error: null };
}
