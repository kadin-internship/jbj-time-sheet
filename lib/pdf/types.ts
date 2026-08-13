export type PdfActivityEntry = {
  entryDate: string;
  startTime: string | null;
  endTime: string | null;
  projectName: string;
  activityType: string | null;
  notes: string | null;
  hours: number;
};

export type PdfTimesheetData = {
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  checkDate: string | null;
  weeklyActivityNotes: string | null;
  weekDates: { date: string; label: string }[];
  projects: { id: string; name: string }[];
  hours: Record<string, Record<string, number>>;
  activityEntries: PdfActivityEntry[];
};
