type HolidayRecord = { date: string; name: string };
type EntryRecord = { projectId: string; entryDate: string };

export function filterUnloggedHolidays(
  holidays: HolidayRecord[],
  entries: EntryRecord[],
  holidayProjectId: string | null,
): HolidayRecord[] {
  if (!holidayProjectId) return [];
  const loggedDates = new Set(
    entries.filter((e) => e.projectId === holidayProjectId).map((e) => e.entryDate),
  );
  return holidays.filter((h) => !loggedDates.has(h.date));
}
