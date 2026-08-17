import { AppShell } from "@/components/layout/AppShell";
import { PtoReviewRow } from "@/components/admin/PtoReviewRow";
import { listAllPtoRequestsWithUser } from "@/lib/db/queries/pto";

export default async function AdminPtoPage() {
  const requests = await listAllPtoRequestsWithUser();
  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold text-brand-gray">PTO Requests</h1>

      <h2 className="mb-2 text-xl font-bold text-brand-gray">Pending</h2>
      <div className="mb-6 flex flex-col gap-2">
        {pending.length === 0 ? (
          <p className="text-brand-gray">No pending requests.</p>
        ) : (
          pending.map((r) => <PtoReviewRow key={r.id} request={r} />)
        )}
      </div>

      <h2 className="mb-2 text-xl font-bold text-brand-gray">Past Requests</h2>
      <div className="flex flex-col gap-2">
        {reviewed.length === 0 ? (
          <p className="text-brand-gray">No past requests.</p>
        ) : (
          reviewed.map((r) => <PtoReviewRow key={r.id} request={r} />)
        )}
      </div>
    </AppShell>
  );
}
