import { AppShell } from "@/components/layout/AppShell";
import { listAuditLog } from "@/lib/db/queries/audit";
import { listUsers } from "@/lib/db/queries/users";
import { AuditFilterBar } from "@/components/admin/AuditFilterBar";

const ACTION_LABEL: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  approve: "Approved",
  deny: "Denied",
};

const ENTITY_LABEL: Record<string, string> = {
  time_entry: "Time Entry",
  weekly_notes: "Weekly Notes",
  pto_request: "PTO Request",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; from?: string; to?: string }>;
}) {
  const { employee, from, to } = await searchParams;
  const [entries, users] = await Promise.all([
    listAuditLog({ userId: employee, from, to }),
    listUsers(),
  ]);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold text-brand-gray">Audit Log</h1>
      <div className="mb-6">
        <AuditFilterBar
          users={users.map((u) => ({ id: u.id, fullName: u.fullName }))}
          initialEmployee={employee ?? ""}
          initialFrom={from ?? ""}
          initialTo={to ?? ""}
        />
      </div>

      {entries.length === 0 ? (
        <p className="text-brand-gray">No audit records match.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => {
            const isOnBehalf = e.actorUserId !== e.targetUserId;
            return (
              <div
                key={e.id}
                className={`rounded-md border p-3 ${
                  isOnBehalf ? "border-l-4 border-l-brand-maroon border-brand-rose/40" : "border-brand-rose/40"
                }`}
              >
                <p className="text-lg text-brand-gray">
                  <span className="font-semibold">{e.actorName}</span>{" "}
                  {ACTION_LABEL[e.action] ?? e.action} a {ENTITY_LABEL[e.entityType] ?? e.entityType}
                  {isOnBehalf && (
                    <>
                      {" "}
                      for <span className="font-semibold">{e.targetName}</span>
                    </>
                  )}
                </p>
                <p className="text-sm text-brand-gray">
                  {new Date(e.createdAt).toLocaleString("en-US")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
