import { parseDateISO } from "@/lib/utils/week";

type Row = { weekStartDate: string; hours: number };

const WIDTH = 600;
const HEIGHT = 180;
const PAD = 24;

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Deterministic, locale-independent formatting — toLocaleDateString can differ between
// server and browser ICU data and has caused real hydration mismatches here before.
function formatShortDate(iso: string): string {
  const d = parseDateISO(iso);
  return `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

export function WeeklyTrendChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return <p className="text-brand-gray">No data yet.</p>;
  }

  const max = Math.max(1, ...data.map((d) => d.hours));
  const stepX = data.length > 1 ? (WIDTH - PAD * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PAD + i * stepX;
    const y = HEIGHT - PAD - (d.hours / max) * (HEIGHT - PAD * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PAD} L ${points[0].x} ${HEIGHT - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Total team hours per week">
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="#D68182" strokeWidth={1} />
      <path d={areaPath} fill="#D68182" opacity={0.25} />
      <path d={linePath} fill="none" stroke="#6D0712" strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#6D0712"
            aria-label={`Week of ${formatShortDate(p.weekStartDate)}: ${p.hours.toFixed(2)} hrs`}
          >
            <title>{`Week of ${formatShortDate(p.weekStartDate)}: ${p.hours.toFixed(2)} hrs`}</title>
          </circle>
          <text x={p.x} y={HEIGHT - 6} textAnchor="middle" fontSize={9} fill="#3D4041">
            {formatShortDate(p.weekStartDate)}
          </text>
        </g>
      ))}
    </svg>
  );
}
