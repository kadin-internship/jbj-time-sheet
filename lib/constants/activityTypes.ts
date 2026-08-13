// Kept manually in sync with the `activityType` pgEnum in lib/db/schema.ts.
export const ACTIVITY_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "project_work", label: "Project Work" },
  { value: "administrative", label: "Administrative" },
  { value: "other", label: "Other" },
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];

export function activityTypeLabel(value: string | null): string {
  return ACTIVITY_TYPES.find((t) => t.value === value)?.label ?? "";
}
