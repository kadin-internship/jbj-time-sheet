export type HourEntry = {
  projectId: string;
  entryDate: string;
  hours: number;
};

export type TimesheetTotals = {
  /** hours[projectId][date] */
  hours: Record<string, Record<string, number>>;
  projectTotals: Record<string, number>;
  dailyTotals: Record<string, number>;
  weekTotal: number;
};

export function computeTotals(entries: HourEntry[]): TimesheetTotals {
  const hours: Record<string, Record<string, number>> = {};
  const projectTotals: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};
  let weekTotal = 0;

  for (const entry of entries) {
    const value = Number(entry.hours) || 0;
    if (value === 0) continue;

    hours[entry.projectId] ??= {};
    hours[entry.projectId][entry.entryDate] = (hours[entry.projectId][entry.entryDate] ?? 0) + value;

    projectTotals[entry.projectId] = (projectTotals[entry.projectId] ?? 0) + value;
    dailyTotals[entry.entryDate] = (dailyTotals[entry.entryDate] ?? 0) + value;
    weekTotal += value;
  }

  return { hours, projectTotals, dailyTotals, weekTotal };
}
