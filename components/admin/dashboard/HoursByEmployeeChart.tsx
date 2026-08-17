type Row = { userId: string; employeeName: string; hours: number };

export function HoursByEmployeeChart({ data }: { data: Row[] }) {
  const max = Math.max(1, ...data.map((d) => d.hours));

  if (data.length === 0) {
    return <p className="text-brand-gray">No employees yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((row) => (
        <div key={row.userId} className="flex items-center gap-3" title={`${row.employeeName}: ${row.hours.toFixed(2)} hrs`}>
          <span className="w-32 shrink-0 truncate text-sm text-brand-gray">{row.employeeName}</span>
          <div className="h-6 flex-1 rounded-full bg-brand-rose/15">
            <div
              className="flex h-6 items-center justify-end rounded-full bg-brand-maroon px-2"
              style={{ width: `${Math.max(4, (row.hours / max) * 100)}%` }}
            >
              {row.hours > 0 && (
                <span className="text-xs font-semibold text-brand-white">{row.hours.toFixed(1)}</span>
              )}
            </div>
          </div>
          {row.hours > 40 && (
            <span className="shrink-0 rounded-full bg-brand-red px-2 py-0.5 text-xs font-semibold text-brand-white">
              OT
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
