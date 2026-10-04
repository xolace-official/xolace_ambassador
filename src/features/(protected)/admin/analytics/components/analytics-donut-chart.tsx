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
  const coverage = total > 0 ? 0.69 : 0;
  const segments = sorted.map((item, i) => {
    const start = total > 0 ? (cumulative / total) * 360 * coverage : 0;
    cumulative += item.count;
    const end = total > 0 ? (cumulative / total) * 360 * coverage : 0;
    return { ...item, start, end, color: COLORS[i % COLORS.length] };
  });

  return (
    <Card className="rounded-2xl border-border py-0 shadow-none">
      <div className="flex h-full min-h-[320px] flex-col p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <Select defaultValue="monthly">
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Last Week</SelectItem>
              <SelectItem value="monthly">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
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
                    strokeLinecap="butt"
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
          <ul className="mt-3 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
            {sorted.map((item, i) => (
              <li
                key={item.kind}
                className="flex items-center gap-1 text-[10px]"
              >
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="truncate text-muted-foreground">
                  {kindLabels[item.kind] ?? item.kind}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid w-full grid-cols-2 gap-3 border-t border-border pt-3">
            {sorted.slice(0, 2).map((item, index) => (
              <div key={item.kind} className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xs font-semibold">{index + 1}</span>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-muted-foreground">
                    {kindLabels[item.kind] ?? item.kind}
                  </p>
                  <p className="text-xs font-semibold tabular-nums text-foreground">
                    {numberFormat.format(item.count)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
