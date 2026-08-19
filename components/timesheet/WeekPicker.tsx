"use client";

import { useRouter } from "next/navigation";
import { formatDateISO, getWeekStart, parseDateISO } from "@/lib/utils/week";

export function WeekPicker({ currentWeekStart }: { currentWeekStart: string }) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.value;
    if (!picked) return;
    const weekStart = formatDateISO(getWeekStart(parseDateISO(picked)));
    router.push(`/timesheets/${weekStart}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="weekPicker" className="text-lg font-medium text-brand-gray">
        Week of:
      </label>
      <input
        id="weekPicker"
        type="date"
        value={currentWeekStart}
        onChange={handleChange}
        className="h-10 rounded-md border border-brand-rose/50 px-3 text-lg text-brand-gray"
      />
    </div>
  );
}
