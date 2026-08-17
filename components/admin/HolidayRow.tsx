"use client";

import { useTransition } from "react";
import { deleteHolidayAction } from "@/app/admin/holidays/actions";
import { parseDateISO } from "@/lib/utils/week";

export function HolidayRow({ id, date, name }: { id: string; date: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-md border border-brand-rose/40 px-4 py-3">
      <span className="text-lg text-brand-gray">
        <span className="font-medium">
          {parseDateISO(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>{" "}
        — {name}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => deleteHolidayAction(id))}
        className="h-10 rounded-md border-2 border-brand-red px-4 text-base font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
