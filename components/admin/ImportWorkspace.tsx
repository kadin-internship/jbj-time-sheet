"use client";

import { useState, useTransition } from "react";
import { commitImportAction, parseImportFilesAction } from "@/app/admin/import/actions";
import type { ParsedTimesheet } from "@/lib/excel/importLegacyTimesheet";

type KnownUser = { id: string; fullName: string };

type PreviewState = ParsedTimesheet & {
  chosenUserId: string;
  chosenWeekStartDate: string;
  status: "pending" | "importing" | "done" | "error";
  resultMessage: string | null;
};

export function ImportWorkspace({ users }: { users: KnownUser[] }) {
  const [previews, setPreviews] = useState<PreviewState[]>([]);
  const [parsing, startParsing] = useTransition();

  function handleParse(formData: FormData) {
    startParsing(async () => {
      const results = await parseImportFilesAction(formData);
      setPreviews(
        results.map((r) => ({
          ...r,
          chosenUserId: r.matchedUserId ?? "",
          chosenWeekStartDate: r.weekStartDate ?? "",
          status: "pending",
          resultMessage: null,
        })),
      );
    });
  }

  function updatePreview(index: number, patch: Partial<PreviewState>) {
    setPreviews((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  async function handleImport(index: number) {
    const preview = previews[index];
    updatePreview(index, { status: "importing" });
    const result = await commitImportAction({
      userId: preview.chosenUserId,
      weekStartDate: preview.chosenWeekStartDate,
      rows: preview.rows.map((r) => ({
        matchedProjectId: r.matchedProjectId,
        hoursByDate: r.hoursByDate,
      })),
    });
    updatePreview(index, {
      status: result.error ? "error" : "done",
      resultMessage: result.error ?? `Imported ${result.imported} time entries.`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        action={handleParse}
        className="flex flex-col gap-3 rounded-md border border-brand-rose/40 p-4"
      >
        <label className="text-lg font-medium text-brand-gray" htmlFor="files">
          Legacy Timesheet Files (.xlsx / .xlsm): select one or more
        </label>
        <input
          id="files"
          name="files"
          type="file"
          multiple
          accept=".xlsx,.xlsm"
          className="text-lg"
        />
        <button
          type="submit"
          disabled={parsing}
          className="h-12 self-start rounded-md bg-brand-red px-6 text-lg font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
        >
          {parsing ? "Reading files..." : "Parse Files"}
        </button>
      </form>

      {previews.map((preview, index) => (
        <div key={preview.sourceFileName + index} className="rounded-md border border-brand-rose/40 p-4">
          <h3 className="mb-2 text-xl font-bold text-brand-gray">{preview.sourceFileName}</h3>

          {preview.warnings.length > 0 && (
            <ul className="mb-3 list-disc pl-5 text-base text-brand-red">
              {preview.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}

          <div className="mb-3 flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium text-brand-gray">Employee</label>
              <select
                value={preview.chosenUserId}
                onChange={(e) => updatePreview(index, { chosenUserId: e.target.value })}
                className="h-11 w-56 rounded-md border border-brand-rose/50 px-3 text-lg"
              >
                <option value="">-- Select employee --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
              {preview.detectedEmployeeName && (
                <span className="text-sm text-brand-gray">
                  Detected: {preview.detectedEmployeeName}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium text-brand-gray">Week Starting</label>
              <input
                type="date"
                value={preview.chosenWeekStartDate}
                onChange={(e) => updatePreview(index, { chosenWeekStartDate: e.target.value })}
                className="h-11 w-44 rounded-md border border-brand-rose/50 px-3 text-lg"
              />
            </div>
          </div>

          {preview.rows.length > 0 && (
            <table className="mb-3 w-full max-w-xl border-collapse text-left text-base">
              <thead>
                <tr className="border-b border-brand-rose/40">
                  <th className="py-1 pr-4">Project</th>
                  <th className="py-1 text-right">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => (
                  <tr key={i} className="border-b border-brand-rose/20">
                    <td className="py-1 pr-4">
                      {r.label}
                      {!r.matchedProjectId && (
                        <span className="ml-2 text-sm text-brand-red">(no matching project)</span>
                      )}
                    </td>
                    <td className="py-1 text-right">{r.rowTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button
            type="button"
            disabled={
              !preview.chosenUserId ||
              !preview.chosenWeekStartDate ||
              preview.status === "importing" ||
              preview.status === "done"
            }
            onClick={() => handleImport(index)}
            className="h-11 rounded-md bg-brand-red px-6 text-lg font-semibold text-brand-white hover:bg-brand-maroon disabled:opacity-60"
          >
            {preview.status === "importing"
              ? "Importing..."
              : preview.status === "done"
                ? "Imported"
                : "Confirm Import"}
          </button>
          {preview.resultMessage && (
            <p
              className={`mt-2 text-base font-medium ${preview.status === "error" ? "text-brand-red" : "text-brand-gray"}`}
            >
              {preview.resultMessage}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
