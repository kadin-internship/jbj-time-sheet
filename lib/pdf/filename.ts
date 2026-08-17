function sanitize(part: string): string {
  return part.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

/** Builds a dash-free download filename, e.g. buildExportFilename("Sample Employee", "Timesheet", "2026-08-10", "pdf") -> "2026_08_10_Sample_Employee_JBJ_Timesheet.pdf" */
export function buildExportFilename(
  employeeName: string,
  kind: string,
  weekStartDate: string,
  ext: string,
): string {
  const datePart = weekStartDate.replaceAll("-", "_");
  return `${datePart}_${sanitize(employeeName)}_JBJ_${sanitize(kind)}.${ext}`;
}
