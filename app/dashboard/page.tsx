import { AppShell } from "@/components/layout/AppShell";
import { TimeEntryWorkspace } from "@/components/timesheet/TimeEntryWorkspace";
import { WeeklyActivityNotes } from "@/components/timesheet/WeeklyActivityNotes";
import { auth } from "@/lib/auth";
import { listActiveProjects } from "@/lib/db/queries/projects";
import { getOrCreateWeeklyTimesheet, getTimeEntriesForTimesheet } from "@/lib/db/queries/timesheets";
import { formatWeekRange, getWeekDates, getWeekStart, formatDateISO } from "@/lib/utils/week";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const weekStartISO = formatDateISO(getWeekStart());
  const timesheet = await getOrCreateWeeklyTimesheet(userId, weekStartISO);
  const [projects, entries] = await Promise.all([
    listActiveProjects(),
    getTimeEntriesForTimesheet(timesheet.id),
  ]);

  const weekDates = getWeekDates(getWeekStart());
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

  return (
    <AppShell>
      <div className="mb-4 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-brand-gray">This Week</h1>
        <p className="text-brand-gray">
          {formatWeekRange(timesheet.weekStartDate, timesheet.weekEndDate)}
        </p>
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
