import ExcelJS from "exceljs";
import { activityTypeLabel } from "@/lib/constants/activityTypes";
import { formatTimeRange } from "@/lib/utils/time";
import type { PdfTimesheetData } from "@/lib/pdf/types";

const ARGB = {
  maroon: "FF6D0712",
  white: "FFFFFFFF",
};

export function buildActivityDetailSheet(workbook: ExcelJS.Workbook, data: PdfTimesheetData) {
  const sheet = workbook.addWorksheet("Activity Detail");

  sheet.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Time", key: "time", width: 22 },
    { header: "Project", key: "project", width: 28 },
    { header: "Type", key: "type", width: 16 },
    { header: "Notes", key: "notes", width: 50 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: ARGB.white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ARGB.maroon } };
  });

  for (const entry of data.activityEntries) {
    sheet.addRow({
      date: entry.entryDate,
      time:
        entry.startTime && entry.endTime
          ? formatTimeRange(entry.startTime, entry.endTime)
          : "Imported",
      project: entry.projectName,
      type: activityTypeLabel(entry.activityType),
      notes: entry.notes ?? "",
    });
  }
}
