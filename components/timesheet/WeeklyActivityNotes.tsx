"use client";

import { useState, useTransition } from "react";
import { updateWeeklyActivityNotesAction } from "@/app/timesheet-actions";

export function WeeklyActivityNotes({
  timesheetId,
  initialNotes,
}: {
  timesheetId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-lg font-medium text-brand-gray" htmlFor="weekly-activity">
        Weekly Activity Summary (optional)
      </label>
      <textarea
        id="weekly-activity"
        rows={3}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        className="rounded-md border border-brand-rose/50 p-3 text-lg focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateWeeklyActivityNotesAction(timesheetId, notes);
              setSaved(true);
            })
          }
          className="h-11 self-start rounded-md bg-brand-red px-5 text-base font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save Summary"}
        </button>
        {saved && !pending && <span className="text-base text-brand-gray">Saved.</span>}
      </div>
    </div>
  );
}
