import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { listAllTimesheetsWithUser } from "@/lib/db/queries/timesheets";
import { formatWeekRange } from "@/lib/utils/week";

export default async function AdminTimesheetsPage() {
  const timesheets = await listAllTimesheetsWithUser();

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold text-brand-gray">All Timesheets</h1>
      {timesheets.length === 0 ? (
        <p className="text-brand-gray">No timesheets yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {timesheets.map((ts) => (
            <Link
              key={ts.id}
              href={`/admin/timesheets/${ts.id}`}
              className="flex items-center justify-between rounded-md border border-brand-rose/40 px-4 py-3 text-lg text-brand-gray hover:bg-brand-rose/10"
            >
              <span className="flex gap-4">
                <span className="font-medium">{ts.employeeName}</span>
                <span>{formatWeekRange(ts.weekStartDate, ts.weekEndDate)}</span>
              </span>
              <span>{ts.weekTotal.toFixed(2)} hrs</span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
