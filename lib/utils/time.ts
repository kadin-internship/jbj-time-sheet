const HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidHHMM(value: string): boolean {
  return HHMM_RE.test(value);
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Hours between two "HH:MM" times, rounded to 2 decimals. Returns 0 if end <= start. */
export function hoursBetween(startTime: string, endTime: string): number {
  if (!isValidHHMM(startTime) || !isValidHHMM(endTime)) return 0;
  const diffMinutes = toMinutes(endTime) - toMinutes(startTime);
  if (diffMinutes <= 0) return 0;
  return Math.round((diffMinutes / 60) * 100) / 100;
}

/** "14:30" -> "2:30 PM" */
export function formatTime12h(hhmm: string): string {
  if (!isValidHHMM(hhmm)) return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(startTime: string | null, endTime: string | null): string {
  if (!startTime || !endTime) return "";
  return `${formatTime12h(startTime)} to ${formatTime12h(endTime)}`;
}
