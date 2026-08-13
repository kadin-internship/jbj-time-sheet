import { AppShell } from "@/components/layout/AppShell";
import { BulkExportForm } from "@/components/admin/BulkExportForm";
import { formatDateISO, getWeekStart } from "@/lib/utils/week";

export default function AdminExportPage() {
  const defaultWeekStart = formatDateISO(getWeekStart());

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-bold text-brand-gray">Bulk Export</h1>
      <p className="mb-4 text-brand-gray">
        Download every employee&apos;s timesheet for a given week in a single ZIP file.
      </p>
      <BulkExportForm defaultWeekStart={defaultWeekStart} />
    </AppShell>
  );
}
