import { AppShell } from "@/components/layout/AppShell";
import { AddHolidayForm } from "@/components/admin/AddHolidayForm";
import { HolidayRow } from "@/components/admin/HolidayRow";
import { listHolidays } from "@/lib/db/queries/holidays";

export default async function AdminHolidaysPage() {
  const holidays = await listHolidays();

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold text-brand-gray">Company Holidays</h1>
      <p className="mb-4 text-brand-gray">
        Employees will see a one-click prompt to log 8 hours of Holiday time when their week
        includes one of these dates.
      </p>
      <div className="mb-6">
        <AddHolidayForm />
      </div>
      <div className="flex flex-col gap-2">
        {holidays.length === 0 ? (
          <p className="text-brand-gray">No holidays added yet.</p>
        ) : (
          holidays.map((h) => <HolidayRow key={h.id} id={h.id} date={h.date} name={h.name} />)
        )}
      </div>
    </AppShell>
  );
}
