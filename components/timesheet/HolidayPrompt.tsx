"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addHolidayEntryAction } from "@/app/timesheet-actions";
import { parseDateISO } from "@/lib/utils/week";

type UnloggedHoliday = { date: string; name: string };

export function HolidayPrompt({
  timesheetId,
  holidays,
}: {
  timesheetId: string;
  holidays: UnloggedHoliday[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (holidays.length === 0) return null;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {holidays.map((h) => (
        <div
          key={h.date}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-brand-rose/20 p-3"
        >
          <span className="text-lg text-brand-gray">
            <span className="font-semibold">{h.name}</span> falls on{" "}
            {parseDateISO(h.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            .
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await addHolidayEntryAction(timesheetId, h.date);
                router.refresh();
              })
            }
            className="h-11 rounded-md bg-brand-red px-5 text-base font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
          >
            Add Holiday (8 hrs)
          </button>
        </div>
      ))}
    </div>
  );
}
