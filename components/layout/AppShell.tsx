import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/logout-action";
import { countPendingPtoRequests } from "@/lib/db/queries/pto";
import { MoreMenu } from "@/components/layout/MoreMenu";

const ADMIN_MORE_ITEMS = [
  { href: "/admin/employees", label: "Employees" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/holidays", label: "Holidays" },
  { href: "/admin/import", label: "Import" },
  { href: "/admin/export", label: "Export" },
  { href: "/admin/meetings", label: "Meetings" },
  { href: "/admin/audit", label: "Audit Log" },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const pendingPtoCount = user?.role === "admin" ? await countPendingPtoRequests() : 0;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between bg-brand-maroon px-6 py-4 text-brand-white">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            JBJ Time Sheet
          </Link>
          {user?.role === "employee" && (
            <nav className="flex gap-4 text-lg">
              <Link href="/dashboard" className="hover:underline">
                This Week
              </Link>
              <Link href="/timesheets" className="hover:underline">
                Past Timesheets
              </Link>
              <Link href="/pto" className="hover:underline">
                Time Off
              </Link>
            </nav>
          )}
          {user?.role === "admin" && (
            <nav className="flex items-center gap-4 text-lg">
              <Link href="/admin/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/admin/timesheets" className="hover:underline">
                Timesheets
              </Link>
              <Link href="/admin/pto" className="flex items-center gap-1.5 hover:underline">
                PTO Requests
                {pendingPtoCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-rose px-1 text-xs font-bold text-brand-maroon">
                    {pendingPtoCount}
                  </span>
                )}
              </Link>
              <MoreMenu items={ADMIN_MORE_ITEMS} />
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-base">{user.name}</span>}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md bg-brand-red px-4 py-2 text-base font-semibold hover:bg-brand-black"
            >
              Log Out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col bg-brand-white p-6">{children}</main>
    </div>
  );
}
