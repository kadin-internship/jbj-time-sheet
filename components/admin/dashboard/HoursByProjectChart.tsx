type Row = {
  id: string;
  name: string;
  actualHours: number;
};

export function HoursByProjectChart({ data }: { data: Row[] }) {
  const worked = data.filter((d) => d.actualHours > 0);
  const max = Math.max(1, ...worked.map((d) => d.actualHours));

  if (worked.length === 0) {
    return <p className="text-brand-gray">No hours logged yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {worked.map((row) => (
        <div key={row.id} className="flex items-center gap-3" title={`${row.name}: ${row.actualHours.toFixed(2)} hrs`}>
          <span className="w-40 shrink-0 truncate text-sm text-brand-gray">{row.name}</span>
          <div className="h-6 flex-1 rounded-full bg-brand-rose/15">
            <div
              className="flex h-6 items-center justify-end rounded-full bg-brand-maroon px-2"
              style={{ width: `${Math.max(4, (row.actualHours / max) * 100)}%` }}
            >
              <span className="text-xs font-semibold text-brand-white">{row.actualHours.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
