import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db/client";
import {
  users,
  projects,
  weeklyTimesheets,
  timeEntries,
  meetingMinutes,
  meetingAttendees,
  companyHolidays,
  ptoRequests,
  auditLog,
} from "@/lib/db/schema";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [
    usersRows,
    projectsRows,
    weeklyTimesheetsRows,
    timeEntriesRows,
    meetingMinutesRows,
    meetingAttendeesRows,
    companyHolidaysRows,
    ptoRequestsRows,
    auditLogRows,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(projects),
    db.select().from(weeklyTimesheets),
    db.select().from(timeEntries),
    db.select().from(meetingMinutes),
    db.select().from(meetingAttendees),
    db.select().from(companyHolidays),
    db.select().from(ptoRequests),
    db.select().from(auditLog),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    tables: {
      users: usersRows,
      projects: projectsRows,
      weeklyTimesheets: weeklyTimesheetsRows,
      timeEntries: timeEntriesRows,
      meetingMinutes: meetingMinutesRows,
      meetingAttendees: meetingAttendeesRows,
      companyHolidays: companyHolidaysRows,
      ptoRequests: ptoRequestsRows,
      auditLog: auditLogRows,
    },
  };

  const dateStamp = new Date().toISOString().slice(0, 10);
  const blob = await put(`backups/${dateStamp}.json`, JSON.stringify(snapshot), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  return NextResponse.json({ ok: true, backup: blob.pathname });
}
