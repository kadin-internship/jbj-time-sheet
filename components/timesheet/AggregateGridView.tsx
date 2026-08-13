import { computeTotals, type HourEntry } from "@/lib/utils/totals";

type Project = { id: string; name: string };
type WeekDate = { date: string; label: string };

export function AggregateGridView({
  entries,
  projects,
  weekDates,
}: {
  entries: HourEntry[];
  projects: Project[];
  weekDates: WeekDate[];
}) {
  const totals = computeTotals(entries);
  const projectsWithHours = projects.filter((p) => (totals.projectTotals[p.id] ?? 0) > 0);

  if (projectsWithHours.length === 0) {
    return <p className="text-base text-brand-gray">No hours logged yet this week.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-rose/40">
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="bg-brand-maroon text-brand-white">
            <th className="p-2 text-base font-semibold">Project</th>
            {weekDates.map((wd) => (
              <th key={wd.date} className="w-20 p-2 text-center text-base font-semibold">
                {wd.label.slice(0, 3)}
              </th>
            ))}
            <th className="w-20 p-2 text-center text-base font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {projectsWithHours.map((project, i) => (
            <tr key={project.id} className={i % 2 === 0 ? "bg-brand-white" : "bg-brand-rose/10"}>
              <td className="p-2 text-base text-brand-gray">{project.name}</td>
              {weekDates.map((wd) => (
                <td key={wd.date} className="p-2 text-center text-base text-brand-gray">
                  {(totals.hours[project.id]?.[wd.date] ?? 0) > 0
                    ? totals.hours[project.id][wd.date].toFixed(2)
                    : ""}
                </td>
              ))}
              <td className="p-2 text-center text-base font-semibold text-brand-gray">
                {(totals.projectTotals[project.id] ?? 0).toFixed(2)}
              </td>
            </tr>
          ))}
          <tr className="bg-brand-maroon/10 font-bold text-brand-gray">
            <td className="p-2 text-base">Daily Total</td>
            {weekDates.map((wd) => (
              <td key={wd.date} className="p-2 text-center text-base">
                {(totals.dailyTotals[wd.date] ?? 0).toFixed(2)}
              </td>
            ))}
            <td className="p-2 text-center text-base">{totals.weekTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
