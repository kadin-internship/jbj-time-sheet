import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/logout-action";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;

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
            </nav>
          )}
          {user?.role === "admin" && (
            <nav className="flex gap-4 text-lg">
              <Link href="/admin/timesheets" className="hover:underline">
                Timesheets
              </Link>
              <Link href="/admin/employees" className="hover:underline">
                Employees
              </Link>
              <Link href="/admin/projects" className="hover:underline">
                Projects
              </Link>
              <Link href="/admin/import" className="hover:underline">
                Import
              </Link>
              <Link href="/admin/export" className="hover:underline">
                Export
              </Link>
              <Link href="/admin/meetings" className="hover:underline">
                Meetings
              </Link>
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
