import { AppShell } from "@/components/layout/AppShell";
import { ImportWorkspace } from "@/components/admin/ImportWorkspace";
import { listUsers } from "@/lib/db/queries/users";

export default async function AdminImportPage() {
  const users = await listUsers();

  return (
    <AppShell>
      <h1 className="mb-2 text-2xl font-bold text-brand-gray">Import Legacy Timesheets</h1>
      <p className="mb-4 text-brand-gray">
        Upload existing per-employee Excel timesheets. Each file is parsed and shown for review —
        nothing is saved until you confirm each one.
      </p>
      <ImportWorkspace users={users.map((u) => ({ id: u.id, fullName: u.fullName }))} />
    </AppShell>
  );
}
