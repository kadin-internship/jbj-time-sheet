import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TimeEntryWorkspace } from "@/components/timesheet/TimeEntryWorkspace";
import { WeeklyActivityNotes } from "@/components/timesheet/WeeklyActivityNotes";
import { auth } from "@/lib/auth";
import { listActiveProjects } from "@/lib/db/queries/projects";
import { getOrCreateWeeklyTimesheet, getTimeEntriesForTimesheet } from "@/lib/db/queries/timesheets";
import { addDays, formatDateISO, formatWeekRange, getWeekDates, parseDateISO } from "@/lib/utils/week";

const WEEK_START_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function TimesheetWeekPage({
  params,
}: {
  params: Promise<{ weekStart: string }>;
}) {
  const { weekStart } = await params;
  if (!WEEK_START_RE.test(weekStart)) notFound();

  const session = await auth();
  const userId = session!.user.id;

  const timesheet = await getOrCreateWeeklyTimesheet(userId, weekStart);
  const [projects, entries] = await Promise.all([
    listActiveProjects(),
    getTimeEntriesForTimesheet(timesheet.id),
  ]);

  const weekDates = getWeekDates(parseDateISO(weekStart));
  const entryRecords = entries.map((e) => ({
    id: e.id,
    projectId: e.projectId,
    entryDate: e.entryDate,
    startTime: e.startTime,
    endTime: e.endTime,
    activityType: e.activityType,
    notes: e.notes,
    hours: Number(e.hours),
  }));

  const prevWeek = formatDateISO(addDays(parseDateISO(weekStart), -7));
  const nextWeek = formatDateISO(addDays(parseDateISO(weekStart), 7));

  return (
    <AppShell>
      <div className="mb-4 flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <Link href={`/timesheets/${prevWeek}`} className="text-lg text-brand-red hover:underline">
            &larr; Prev Week
          </Link>
          <h1 className="text-2xl font-bold text-brand-gray">
            {formatWeekRange(timesheet.weekStartDate, timesheet.weekEndDate)}
          </h1>
          <Link href={`/timesheets/${nextWeek}`} className="text-lg text-brand-red hover:underline">
            Next Week &rarr;
          </Link>
        </div>
      </div>

      <TimeEntryWorkspace
        timesheetId={timesheet.id}
        projects={projects}
        weekDates={weekDates}
        initialEntries={entryRecords}
      />

      <div className="mt-6">
        <WeeklyActivityNotes
          timesheetId={timesheet.id}
          initialNotes={timesheet.weeklyActivityNotes ?? ""}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <a
          href={`/api/timesheets/${timesheet.id}/pdf/detailed`}
          className="h-12 rounded-md border-2 border-brand-red px-6 py-3 text-lg font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white"
        >
          Download Timesheet PDF
        </a>
        <a
          href={`/api/timesheets/${timesheet.id}/pdf/summary`}
          className="h-12 rounded-md border-2 border-brand-red px-6 py-3 text-lg font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white"
        >
          Download Summary PDF
        </a>
        <a
          href={`/api/timesheets/${timesheet.id}/excel`}
          className="h-12 rounded-md border-2 border-brand-red px-6 py-3 text-lg font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white"
        >
          Download Excel
        </a>
      </div>
    </AppShell>
  );
}
