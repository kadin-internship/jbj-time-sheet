// Categories that appear on every timesheet regardless of hours logged. Every other project
// (actual client work) is hidden unless the employee logged hours against it that week — this
// keeps a timesheet handed to one client from revealing which other clients the company works with.
const ALWAYS_VISIBLE_PROJECT_NAMES = new Set([
  "Benevolence",
  "Administration",
  "Holiday",
  "PTO",
  "Sick Time",
]);

export function filterVisibleProjects<T extends { id: string; name: string }>(
  projects: T[],
  projectTotals: Record<string, number>,
): T[] {
  return projects.filter(
    (p) => ALWAYS_VISIBLE_PROJECT_NAMES.has(p.name) || (projectTotals[p.id] ?? 0) > 0,
  );
}
