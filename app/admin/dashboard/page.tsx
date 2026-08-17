import { AppShell } from "@/components/layout/AppShell";
import { HoursByEmployeeChart } from "@/components/admin/dashboard/HoursByEmployeeChart";
import { HoursByProjectChart } from "@/components/admin/dashboard/HoursByProjectChart";
import { WeeklyTrendChart } from "@/components/admin/dashboard/WeeklyTrendChart";
import {
  listHoursByEmployeeForWeek,
  listWeeklyHoursTrend,
} from "@/lib/db/queries/timesheets";
import { listProjectsWithHours } from "@/lib/db/queries/projects";
import { countPendingPtoRequests } from "@/lib/db/queries/pto";
import { formatDateISO, getWeekStart } from "@/lib/utils/week";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-md border border-brand-rose/40 p-4">
      <span className="text-3xl font-bold text-brand-maroon">{value}</span>
      <span className="text-base text-brand-gray">{label}</span>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const weekStartISO = formatDateISO(getWeekStart());

  const [employeeHours, projects, weeklyTrend, pendingPto] = await Promise.all([
    listHoursByEmployeeForWeek(weekStartISO),
    listProjectsWithHours(),
    listWeeklyHoursTrend(8),
    countPendingPtoRequests(),
  ]);

  const totalHoursThisWeek = employeeHours.reduce((sum, e) => sum + e.hours, 0);
  const overtimeCount = employeeHours.filter((e) => e.hours > 40).length;

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold text-brand-gray">Dashboard</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <StatTile label="Total Hours This Week" value={totalHoursThisWeek.toFixed(1)} />
        <StatTile label="Employees Over 40 hrs" value={overtimeCount} />
        <StatTile label="Pending PTO Requests" value={pendingPto} />
      </div>

      <div className="mb-6 rounded-md border border-brand-rose/40 p-4">
        <h2 className="mb-3 text-xl font-bold text-brand-gray">Hours by Employee (This Week)</h2>
        <HoursByEmployeeChart data={employeeHours} />
      </div>

      <div className="mb-6 rounded-md border border-brand-rose/40 p-4">
        <h2 className="mb-3 text-xl font-bold text-brand-gray">Hours by Project (All Time)</h2>
        <HoursByProjectChart data={projects} />
      </div>

      <div className="rounded-md border border-brand-rose/40 p-4">
        <h2 className="mb-3 text-xl font-bold text-brand-gray">Weekly Trend (Last 8 Weeks)</h2>
        <WeeklyTrendChart data={weeklyTrend} />
      </div>
    </AppShell>
  );
}
