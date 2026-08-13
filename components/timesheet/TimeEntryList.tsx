"use client";

import { activityTypeLabel } from "@/lib/constants/activityTypes";
import { computeTotals } from "@/lib/utils/totals";
import { formatTimeRange } from "@/lib/utils/time";
import type { TimeEntryRecord } from "./TimeEntryForm";

type Project = { id: string; name: string };
type WeekDate = { date: string; label: string };

export function TimeEntryList({
  entries,
  projects,
  weekDates,
  onEdit,
  onDuplicate,
  onDelete,
  deletingId,
}: {
  entries: TimeEntryRecord[];
  projects: Project[];
  weekDates: WeekDate[];
  onEdit: (entry: TimeEntryRecord) => void;
  onDuplicate: (entry: TimeEntryRecord) => void;
  onDelete: (entryId: string) => void;
  deletingId: string | null;
}) {
  const projectName = (id: string) => projects.find((p) => p.id === id)?.name ?? "Unknown project";
  const totals = computeTotals(entries.map((e) => ({ ...e, entryDate: e.entryDate })));

  return (
    <div className="flex flex-col gap-4">
      {weekDates.map((wd) => {
        const dayEntries = entries
          .filter((e) => e.entryDate === wd.date)
          .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));

        return (
          <div key={wd.date} className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-brand-gray">
              {wd.label}
              <span className="ml-2 text-base font-normal text-brand-gray">
                {(totals.dailyTotals[wd.date] ?? 0).toFixed(2)} hrs
              </span>
            </h3>
            {dayEntries.length === 0 ? (
              <p className="text-base text-brand-gray">No entries yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 rounded-md border border-brand-rose/40 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-lg text-brand-gray">
                        <span className="font-semibold">
                          {entry.startTime && entry.endTime
                            ? formatTimeRange(entry.startTime, entry.endTime)
                            : "Imported, no time logged"}
                        </span>
                        {" — "}
                        {projectName(entry.projectId)}
                      </span>
                      <span className="text-base font-semibold text-brand-gray">
                        {entry.hours.toFixed(2)} hrs
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base text-brand-gray">
                        {activityTypeLabel(entry.activityType)}
                        {entry.notes ? ` — ${entry.notes}` : ""}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="h-9 rounded-md border-2 border-brand-gray px-3 text-sm font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicate(entry)}
                          className="h-9 rounded-md border-2 border-brand-gray px-3 text-sm font-semibold text-brand-gray hover:bg-brand-gray hover:text-brand-white"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === entry.id}
                          onClick={() => onDelete(entry.id)}
                          className="h-9 rounded-md border-2 border-brand-red px-3 text-sm font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white disabled:opacity-60"
                        >
                          {deletingId === entry.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-2 rounded-md bg-brand-maroon/10 p-3 text-lg font-bold text-brand-gray">
        Week Total: {totals.weekTotal.toFixed(2)} hrs
      </div>
    </div>
  );
}
