type Row = {
  id: string;
  name: string;
  budgetHours: number | null;
  actualHours: number;
};

export function HoursByProjectChart({ data }: { data: Row[] }) {
  const worked = data.filter((d) => d.actualHours > 0);
  const max = Math.max(1, ...worked.map((d) => Math.max(d.actualHours, d.budgetHours ?? 0)));

  if (worked.length === 0) {
    return <p className="text-brand-gray">No hours logged yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {worked.map((row) => {
        const overBudget = row.budgetHours !== null && row.actualHours > row.budgetHours;
        const budgetPercent = row.budgetHours !== null ? (row.budgetHours / max) * 100 : null;
        return (
          <div
            key={row.id}
            className="flex items-center gap-3"
            title={
              row.budgetHours !== null
                ? `${row.name}: ${row.actualHours.toFixed(2)} / ${row.budgetHours.toFixed(2)} hrs budget`
                : `${row.name}: ${row.actualHours.toFixed(2)} hrs`
            }
          >
            <span className="w-40 shrink-0 truncate text-sm text-brand-gray">{row.name}</span>
            <div className="relative h-6 flex-1 rounded-full bg-brand-rose/15">
              <div
                className={`flex h-6 items-center justify-end rounded-full px-2 ${overBudget ? "bg-brand-red" : "bg-brand-maroon"}`}
                style={{ width: `${Math.max(4, (row.actualHours / max) * 100)}%` }}
              >
                <span className="text-xs font-semibold text-brand-white">{row.actualHours.toFixed(1)}</span>
              </div>
              {budgetPercent !== null && (
                <div
                  className="absolute top-0 h-6 w-0.5 bg-brand-black"
                  style={{ left: `${budgetPercent}%` }}
                />
              )}
            </div>
            {overBudget && (
              <span className="shrink-0 rounded-full bg-brand-red px-2 py-0.5 text-xs font-semibold text-brand-white">
                Over
              </span>
            )}
          </div>
        );
      })}
      <p className="mt-1 text-xs text-brand-gray">The black tick marks a project&apos;s budget, where set.</p>
    </div>
  );
}
