import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const numberFormat = new Intl.NumberFormat("en-GB");

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const kindLabels: Record<string, string> = {
  mission_submission: "Mission submissions",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Events",
  other: "Other",
};

interface DonutItem {
  kind: string;
  count: number;
}

interface AnalyticsDonutChartProps {
  data: DonutItem[];
  title: string;
}

export function AnalyticsDonutChart({ data, title }: AnalyticsDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const sorted = [...data].sort((a, b) => b.count - a.count);

  let cumulative = 0;
  const segments = sorted.map((item, i) => {
    const start = total > 0 ? (cumulative / total) * 360 : 0;
    cumulative += item.count;
    const end = total > 0 ? (cumulative / total) * 360 : 0;
    return { ...item, start, end, color: COLORS[i % COLORS.length] };
  });

  return (
    <Card className="border-border p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Select defaultValue="monthly">
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Last Week</SelectItem>
            <SelectItem value="monthly">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative h-36 w-36 shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label={`${title} breakdown`}
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="12"
            />
            {segments.map((seg) => {
              const r = 40;
              const circumference = 2 * Math.PI * r;
              const dash = ((seg.end - seg.start) / 360) * circumference;
              const gap = circumference - dash;
              const offset = -((seg.start / 360) * circumference);
              return (
                <circle
                  key={seg.kind}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={offset}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums text-foreground">
              {numberFormat.format(total)}
            </span>
            <span className="text-[10px] text-muted-foreground">Total</span>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5">
          {sorted.map((item, i) => (
            <li key={item.kind} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-muted-foreground">
                {kindLabels[item.kind] ?? item.kind}
              </span>
              <span className="ml-auto font-medium tabular-nums text-foreground">
                {numberFormat.format(item.count)}
              </span>
              <span className="w-10 text-right text-muted-foreground">
                {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
