import type { PdfTimesheetData } from "@/lib/pdf/types";

export function weekSpansTwoMonths(weekDates: { date: string }[]): boolean {
  if (weekDates.length === 0) return false;
  const firstMonth = weekDates[0].date.slice(0, 7); // "YYYY-MM"
  const lastMonth = weekDates[weekDates.length - 1].date.slice(0, 7);
  return firstMonth !== lastMonth;
}

/** Splits a week's data into one entry per calendar month it touches, each scoped to just that month's dates. */
export function splitTimesheetDataByMonth(data: PdfTimesheetData): PdfTimesheetData[] {
  const groups = new Map<string, PdfTimesheetData["weekDates"]>();
  for (const wd of data.weekDates) {
    const key = wd.date.slice(0, 7);
    const group = groups.get(key);
    if (group) {
      group.push(wd);
    } else {
      groups.set(key, [wd]);
    }
  }

  return Array.from(groups.values()).map((weekDates) => {
    const dateSet = new Set(weekDates.map((wd) => wd.date));
    return {
      ...data,
      weekStartDate: weekDates[0].date,
      weekEndDate: weekDates[weekDates.length - 1].date,
      weekDates,
      activityEntries: data.activityEntries.filter((e) => dateSet.has(e.entryDate)),
    };
  });
}
