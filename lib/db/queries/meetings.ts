import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { meetingAttendees, meetingMinutes, users } from "@/lib/db/schema";

export async function listMeetingsWithAttendees() {
  const meetings = await db.query.meetingMinutes.findMany({
    orderBy: [desc(meetingMinutes.meetingDate)],
  });

  const results = await Promise.all(
    meetings.map(async (m) => {
      const attendeeRows = await db
        .select({ userFullName: users.fullName, freeTextName: meetingAttendees.freeTextName })
        .from(meetingAttendees)
        .leftJoin(users, eq(users.id, meetingAttendees.userId))
        .where(eq(meetingAttendees.meetingId, m.id));

      const attendeeNames = attendeeRows.map((a) => a.userFullName ?? a.freeTextName ?? "Unknown");
      return { ...m, attendeeNames };
    }),
  );

  return results;
}

export async function getMeetingWithAttendees(id: string) {
  const meeting = await db.query.meetingMinutes.findFirst({
    where: eq(meetingMinutes.id, id),
  });
  if (!meeting) return null;

  const attendeeRows = await db
    .select({ userFullName: users.fullName, freeTextName: meetingAttendees.freeTextName })
    .from(meetingAttendees)
    .leftJoin(users, eq(users.id, meetingAttendees.userId))
    .where(eq(meetingAttendees.meetingId, id));

  const attendeeNames = attendeeRows.map((a) => a.userFullName ?? a.freeTextName ?? "Unknown");
  return { ...meeting, attendeeNames };
}
