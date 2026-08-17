"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type User = { id: string; fullName: string };

export function TimesheetFilterBar({
  users,
  initialEmployee,
  initialFrom,
  initialTo,
}: {
  users: User[];
  initialEmployee: string;
  initialFrom: string;
  initialTo: string;
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState(initialEmployee);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  function apply(next: { employee?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    const e = next.employee ?? employee;
    const f = next.from ?? from;
    const t = next.to ?? to;
    if (e) params.set("employee", e);
    if (f) params.set("from", f);
    if (t) params.set("to", t);
    router.push(`/admin/timesheets?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4 rounded-md border border-brand-rose/40 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="employee">
          Employee
        </label>
        <select
          id="employee"
          value={employee}
          onChange={(e) => {
            setEmployee(e.target.value);
            apply({ employee: e.target.value });
          }}
          className="h-12 w-56 rounded-md border border-brand-rose/50 px-3 text-lg"
        >
          <option value="">All Employees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="from">
          From
        </label>
        <input
          id="from"
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            apply({ from: e.target.value });
          }}
          className="h-12 rounded-md border border-brand-rose/50 px-3 text-lg"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-base font-medium text-brand-gray" htmlFor="to">
          To
        </label>
        <input
          id="to"
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            apply({ to: e.target.value });
          }}
          className="h-12 rounded-md border border-brand-rose/50 px-3 text-lg"
        />
      </div>
      {(employee || from || to) && (
        <button
          type="button"
          onClick={() => {
            setEmployee("");
            setFrom("");
            setTo("");
            router.push("/admin/timesheets");
          }}
          className="h-12 rounded-md border-2 border-brand-gray px-4 text-base font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
