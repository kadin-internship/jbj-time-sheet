import { activityTypeLabel } from "@/lib/constants/activityTypes";
import type { PdfTimesheetData } from "@/lib/pdf/types";

function csvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildActivityDetailCsv(data: PdfTimesheetData): string {
  const dayLabelByDate = new Map(data.weekDates.map((wd) => [wd.date, wd.label]));
  const header = ["Date", "Day", "Project", "Type", "Hours", "Notes"];
  const rows = data.activityEntries.map((entry) => [
    entry.entryDate,
    dayLabelByDate.get(entry.entryDate) ?? "",
    entry.projectName,
    activityTypeLabel(entry.activityType),
    entry.hours.toFixed(2),
    entry.notes ?? "",
  ]);

  return [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n") + "\r\n";
}
