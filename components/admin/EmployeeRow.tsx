"use client";

import { useState, useTransition } from "react";
import { resetPasswordAction, setEmployeeActiveAction } from "@/app/admin/employees/actions";

export function EmployeeRow({
  id,
  fullName,
  username,
  role,
  active,
}: {
  id: string;
  fullName: string;
  username: string;
  role: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  return (
    <div
      data-testid="employee-row"
      data-username={username}
      className="flex flex-col gap-2 rounded-md border border-brand-rose/40 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-lg font-medium text-brand-gray">{fullName}</span>{" "}
          <span className="text-base text-brand-gray">
            ({username}, {role}
            {!active ? ", inactive" : ""})
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setTempPassword(null);
              startTransition(async () => {
                const result = await resetPasswordAction(id);
                if (result.tempPassword) setTempPassword(result.tempPassword);
              });
            }}
            className="h-10 rounded-md border-2 border-brand-red px-4 text-base font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white disabled:opacity-60"
          >
            Reset Password
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => setEmployeeActiveAction(id, !active))}
            className="h-10 rounded-md border-2 border-brand-gray px-4 text-base font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white disabled:opacity-60"
          >
            {active ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>
      {tempPassword && (
        <p className="rounded-md bg-brand-rose/20 p-2 text-base text-brand-gray">
          New temporary password: <span className="font-mono font-bold">{tempPassword}</span>
        </p>
      )}
    </div>
  );
}
