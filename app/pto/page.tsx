import { AppShell } from "@/components/layout/AppShell";
import { PtoRequestForm } from "@/components/pto/PtoRequestForm";
import { PtoRequestList } from "@/components/pto/PtoRequestList";
import { auth } from "@/lib/auth";
import { listPtoRequestsForUser } from "@/lib/db/queries/pto";

export default async function PtoPage() {
  const session = await auth();
  const requests = await listPtoRequestsForUser(session!.user.id);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-bold text-brand-gray">Time Off</h1>
      <div className="mb-6">
        <PtoRequestForm />
      </div>
      <h2 className="mb-2 text-xl font-bold text-brand-gray">Your Requests</h2>
      <PtoRequestList requests={requests} />
    </AppShell>
  );
}
