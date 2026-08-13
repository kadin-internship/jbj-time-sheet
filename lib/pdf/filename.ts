function sanitize(part: string): string {
  return part.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/** Builds a dash-free download filename, e.g. buildExportFilename("Sample Employee", "Timesheet", "2026-08-10", "pdf") -> "JBJ_Timesheet_Sample_Employee_2026_08_10.pdf" */
export function buildExportFilename(
  employeeName: string,
  kind: string,
  weekStartDate: string,
  ext: string,
): string {
  const datePart = weekStartDate.replaceAll("-", "_");
  return `JBJ_${sanitize(kind)}_${sanitize(employeeName)}_${datePart}.${ext}`;
}
