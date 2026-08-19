"use client";

import { useState } from "react";

export function PdfDownloadButton({
  timesheetId,
  spansTwoMonths,
}: {
  timesheetId: string;
  spansTwoMonths: boolean;
}) {
  const [split, setSplit] = useState(false);
  const href = `/api/timesheets/${timesheetId}/pdf/detailed${split ? "?split=true" : ""}`;

  return (
    <div className="flex flex-col gap-2">
      <a
        href={href}
        className="h-12 rounded-md border-2 border-brand-red px-6 py-3 text-lg font-semibold text-brand-red hover:bg-brand-red hover:text-brand-white"
      >
        Download Timesheet PDF
      </a>
      {spansTwoMonths && (
        <label className="flex items-center gap-2 text-base text-brand-gray">
          <input
            type="checkbox"
            checked={split}
            onChange={(e) => setSplit(e.target.checked)}
            className="h-5 w-5"
          />
          Split into two PDFs at the month (this week crosses a month boundary)
        </label>
      )}
    </div>
  );
}
