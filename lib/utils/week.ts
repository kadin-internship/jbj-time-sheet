const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDateISO(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDateISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Monday of the week containing `date` (defaults to today). */
export function getWeekStart(date: Date = new Date()): Date {
  const d = toDateOnly(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = toDateOnly(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Returns the 5 Mon-Fri dates (as ISO strings) for the week starting `weekStart`. */
export function getWeekDates(weekStart: Date): { date: string; label: string }[] {
  return DAY_NAMES.map((label, i) => ({
    date: formatDateISO(addDays(weekStart, i)),
    label,
  }));
}

export function formatWeekRange(weekStartISO: string, weekEndISO: string): string {
  const start = parseDateISO(weekStartISO);
  const end = parseDateISO(weekEndISO);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} to ${fmt(end)}`;
}
