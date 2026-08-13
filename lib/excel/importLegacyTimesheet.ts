import ExcelJS from "exceljs";

export type ParsedRow = {
  label: string;
  matchedProjectId: string | null;
  hoursByDate: Record<string, number>;
  rowTotal: number;
};

export type ParsedTimesheet = {
  sourceFileName: string;
  detectedEmployeeName: string | null;
  matchedUserId: string | null;
  weekStartDate: string | null;
  weekEndDate: string | null;
  checkDate: string | null;
  weekDates: string[];
  rows: ParsedRow[];
  warnings: string[];
};

type KnownUser = { id: string; fullName: string };
type KnownProject = { id: string; name: string };

function cellText(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value == null) return "";
  if (typeof cell.value === "object" && "richText" in (cell.value as object)) {
    return (cell.value as { richText: { text: string }[] }).richText.map((r) => r.text).join("");
  }
  if (cell.value instanceof Date) return cell.value.toISOString().slice(0, 10);
  return String(cell.value).trim();
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[:\s]+/g, " ").trim();
}

function parseDateLike(text: string): string | null {
  const trimmed = text.trim();
  const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    let [, m, d, y] = mdy;
    if (y.length === 2) y = (Number(y) < 50 ? "20" : "19") + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return null;
}

const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday"];

function findLabelCell(
  sheet: ExcelJS.Worksheet,
  labelSubstrings: string[],
  maxRow = 40,
): { row: number; col: number; text: string } | null {
  for (let r = 1; r <= Math.min(maxRow, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    const width = row.cellCount + 2;
    for (let c = 1; c <= width; c++) {
      const text = normalize(cellText(row.getCell(c)));
      if (!text) continue;
      if (labelSubstrings.some((sub) => text.includes(sub))) {
        return { row: r, col: c, text };
      }
    }
  }
  return null;
}

function valueNearLabel(sheet: ExcelJS.Worksheet, labelRow: number, labelCol: number): string {
  const sameCell = cellText(sheet.getRow(labelRow).getCell(labelCol));
  const afterColon = sameCell.split(":").slice(1).join(":").trim();
  if (afterColon) return afterColon;

  const right = cellText(sheet.getRow(labelRow).getCell(labelCol + 1));
  if (right) return right;

  const below = cellText(sheet.getRow(labelRow + 1).getCell(labelCol));
  return below;
}

export function parseLegacyTimesheet(
  workbook: ExcelJS.Workbook,
  sourceFileName: string,
  knownUsers: KnownUser[],
  knownProjects: KnownProject[],
): ParsedTimesheet {
  const sheet = workbook.worksheets[0];
  const warnings: string[] = [];

  const employeeLabel = findLabelCell(sheet, ["employee name"]);
  const detectedEmployeeName = employeeLabel
    ? valueNearLabel(sheet, employeeLabel.row, employeeLabel.col) || null
    : null;
  if (!detectedEmployeeName) warnings.push('Could not find an "Employee Name" field in this file.');

  const matchedUser =
    detectedEmployeeName &&
    knownUsers.find((u) => normalize(u.fullName) === normalize(detectedEmployeeName));
  if (detectedEmployeeName && !matchedUser) {
    warnings.push(`No system user matches the name "${detectedEmployeeName}". Pick one manually.`);
  }

  const weekStartLabel = findLabelCell(sheet, ["week starting"]);
  const weekEndLabel = findLabelCell(sheet, ["week ending"]);
  const checkDateLabel = findLabelCell(sheet, ["check date"]);

  const weekStartRaw = weekStartLabel ? valueNearLabel(sheet, weekStartLabel.row, weekStartLabel.col) : "";
  const weekEndRaw = weekEndLabel ? valueNearLabel(sheet, weekEndLabel.row, weekEndLabel.col) : "";
  const checkDateRaw = checkDateLabel ? valueNearLabel(sheet, checkDateLabel.row, checkDateLabel.col) : "";

  const weekStartDate = parseDateLike(weekStartRaw);
  const weekEndDate = parseDateLike(weekEndRaw);
  const checkDate = parseDateLike(checkDateRaw);
  if (!weekStartDate) warnings.push('Could not read a "Week Starting" date. You will need to set it manually.');
  if (!weekEndDate) warnings.push('Could not read a "Week Ending" date. You will need to set it manually.');

  // Locate the grid: a row containing both "Date" and "Day of Week" headers.
  let headerRow: number | null = null;
  let dateCol = 1;
  let dayCol = 2;
  let totalCol: number | null = null;
  for (let r = 1; r <= Math.min(40, sheet.rowCount); r++) {
    const row = sheet.getRow(r);
    let foundDate = -1;
    let foundDay = -1;
    let foundTotal = -1;
    const width = row.cellCount + 2;
    for (let c = 1; c <= width; c++) {
      const text = normalize(cellText(row.getCell(c)));
      if (text === "date") foundDate = c;
      if (text === "day of week") foundDay = c;
      if (text === "total") foundTotal = c;
    }
    if (foundDate > 0 && foundDay > 0) {
      headerRow = r;
      dateCol = foundDate;
      dayCol = foundDay;
      totalCol = foundTotal > 0 ? foundTotal : null;
      break;
    }
  }

  const rows: ParsedRow[] = [];
  const weekDates: string[] = [];

  if (!headerRow) {
    warnings.push('Could not find the Date/Day of Week grid header. This file may not match the expected layout.');
    return {
      sourceFileName,
      detectedEmployeeName,
      matchedUserId: matchedUser ? matchedUser.id : null,
      weekStartDate,
      weekEndDate,
      checkDate,
      weekDates,
      rows,
      warnings,
    };
  }

  const taskStartCol = dayCol + 1;
  const taskEndCol = (totalCol ?? sheet.getRow(headerRow).cellCount + 1) - 1;

  // Build column -> project name from the header row's task numbers, cross-referenced
  // against a "TASKS" legend panel elsewhere on the sheet if present.
  const legendByNumber = new Map<number, string>();
  const legendLabel = findLabelCell(sheet, ["tasks"], sheet.rowCount);
  if (legendLabel) {
    for (let r = legendLabel.row + 1; r <= Math.min(legendLabel.row + 30, sheet.rowCount); r++) {
      const numText = cellText(sheet.getRow(r).getCell(legendLabel.col));
      const nameText = cellText(sheet.getRow(r).getCell(legendLabel.col + 1));
      const num = Number(numText);
      if (Number.isInteger(num) && nameText) legendByNumber.set(num, nameText);
    }
  }

  const columnProjectName = new Map<number, string>();
  for (let c = taskStartCol; c <= taskEndCol; c++) {
    const headerText = cellText(sheet.getRow(headerRow).getCell(c));
    const num = Number(headerText);
    if (Number.isInteger(num) && legendByNumber.has(num)) {
      columnProjectName.set(c, legendByNumber.get(num)!);
    } else if (headerText) {
      columnProjectName.set(c, headerText);
    }
  }

  // Find the 5 Mon-Fri data rows following the header.
  const dayRows: number[] = [];
  for (let r = headerRow + 1; r <= Math.min(headerRow + 20, sheet.rowCount); r++) {
    const dayText = normalize(cellText(sheet.getRow(r).getCell(dayCol)));
    if (DAY_NAMES.includes(dayText)) dayRows.push(r);
    if (dayRows.length === 5) break;
  }
  if (dayRows.length < 5) {
    warnings.push(`Only found ${dayRows.length} of 5 weekday rows in the grid.`);
  }

  const projectRowByCol = new Map<number, ParsedRow>();
  for (let c = taskStartCol; c <= taskEndCol; c++) {
    const label = columnProjectName.get(c);
    if (!label) continue;
    const matchedProject = knownProjects.find((p) => normalize(p.name) === normalize(label));
    if (!matchedProject) warnings.push(`No matching project for "${label}" — its hours will be skipped.`);
    projectRowByCol.set(c, {
      label,
      matchedProjectId: matchedProject ? matchedProject.id : null,
      hoursByDate: {},
      rowTotal: 0,
    });
  }

  for (const r of dayRows) {
    const dateText = cellText(sheet.getRow(r).getCell(dateCol));
    const date = parseDateLike(dateText);
    if (!date) {
      warnings.push(`Could not parse a date on row ${r}; that day's hours were skipped.`);
      continue;
    }
    weekDates.push(date);
    for (const [col, parsedRow] of projectRowByCol) {
      const raw = cellText(sheet.getRow(r).getCell(col));
      const hours = Number(raw);
      if (raw && Number.isFinite(hours) && hours > 0) {
        parsedRow.hoursByDate[date] = hours;
        parsedRow.rowTotal += hours;
      }
    }
  }

  rows.push(...Array.from(projectRowByCol.values()).filter((r) => r.rowTotal > 0));

  return {
    sourceFileName,
    detectedEmployeeName,
    matchedUserId: matchedUser ? matchedUser.id : null,
    weekStartDate,
    weekEndDate,
    checkDate,
    weekDates,
    rows,
    warnings,
  };
}
