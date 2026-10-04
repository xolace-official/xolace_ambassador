import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const numberFormat = new Intl.NumberFormat("en-GB");

export interface TimelinePoint {
  date: string;
  points: number;
  contributions: number;
  peopleReached: number;
}

interface AnalyticsTimelineChartProps {
  data: TimelinePoint[];
  totalPoints: number;
}

type TimelinePeriod = "weekly" | "monthly" | "yearly";

const emptyPoint = (date: string): TimelinePoint => ({
  date,
  points: 0,
  contributions: 0,
  peopleReached: 0,
});

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCurrentPeriodData(data: TimelinePoint[], period: TimelinePeriod) {
  const today = new Date();
  const source = new Map(data.map((point) => [point.date, point]));

  if (period === "yearly") {
    const year = today.getUTCFullYear();
    const monthlyTotals = new Map<string, TimelinePoint>();

    for (const point of data) {
      if (!point.date.startsWith(`${year}-`)) continue;
      const month = point.date.slice(0, 7);
      const current = monthlyTotals.get(month) ?? emptyPoint(month);
      monthlyTotals.set(month, {
        date: month,
        points: current.points + point.points,
        contributions: current.contributions + point.contributions,
        peopleReached: current.peopleReached + point.peopleReached,
      });
    }

    return Array.from({ length: 12 }, (_, month) => {
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      return monthlyTotals.get(key) ?? emptyPoint(key);
    });
  }

  const start = new Date(today);
  if (period === "monthly") {
    start.setUTCDate(1);
  } else {
    start.setUTCDate(start.getUTCDate() - 6);
  }

  const length =
    period === "monthly"
      ? new Date(
        today.getUTCFullYear(),
        today.getUTCMonth() + 1,
        0,
      ).getUTCDate()
      : 7;

  return Array.from({ length }, (_, index) => {
    const current = new Date(start);
    current.setUTCDate(start.getUTCDate() + index);
    const key = dateKey(current);
    return source.get(key) ?? emptyPoint(key);
  });
}

function getYAxisMax(data: TimelinePoint[]) {
  const maximum = Math.max(
    ...data.map((point) =>
      Math.max(point.points, point.contributions, point.peopleReached),
    ),
    0,
  );
  if (maximum === 0) return 10;

  const magnitude = 10 ** Math.floor(Math.log10(maximum));
  const normalized = maximum / magnitude;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function AnalyticsTimelineChart({
  data,
  totalPoints,
}: AnalyticsTimelineChartProps) {
  const [period, setPeriod] = useState<TimelinePeriod>("monthly");
  const chartData = useMemo(
    () => getCurrentPeriodData(data, period),
    [data, period],
  );
  const yAxisMax = getYAxisMax(chartData);
  const today = new Date();
  const todayKey =
    period === "yearly" ? dateKey(today).slice(0, 7) : dateKey(today);

  return (
    <Card className="rounded-2xl border-border py-0 shadow-none">
      <div className="p-3 sm:p-4">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Total points</p>
              <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-foreground">
                {numberFormat.format(totalPoints)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted-foreground">
              <input
                type="checkbox"
                defaultChecked
                className="size-3 rounded accent-primary"
              />
              Aggregate
            </label>
            <label className="flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="size-3 rounded accent-primary"
              />
              Individual
            </label>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as TimelinePeriod)}
            >
              <SelectTrigger size="sm" className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Last Week</SelectItem>
                <SelectItem value="monthly">Last Month</SelectItem>
                <SelectItem value="yearly">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                interval={0}
                tick={{ fontSize: period === "monthly" ? 9 : 10 }}
                stroke="var(--muted-foreground)"
                tickFormatter={(v: string) => {
                  if (period === "yearly") {
                    return new Intl.DateTimeFormat("en-GB", {
                      month: "short",
                    }).format(new Date(`${v}-01T00:00:00Z`));
                  }
                  return period === "monthly"
                    ? v.slice(-2).replace(/^0/, "")
                    : new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                    }).format(new Date(`${v}T00:00:00Z`));
                }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tickCount={6}
                tick={{ fontSize: 10 }}
                stroke="var(--muted-foreground)"
                tickFormatter={(value: number) => numberFormat.format(value)}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelFormatter={(v) => {
                  const d = new Date(String(v));
                  return d.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                }}
              />
              <ReferenceLine
                x={todayKey}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: "Today",
                  position: "insideTop",
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey="points"
                fill="var(--primary)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="contributions"
                fill="var(--success)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="peopleReached"
                fill="var(--warning)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-5 rounded-full bg-primary" />
            Points
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-5 rounded-full bg-success" />
            Contributions
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-5 rounded-full bg-warning" />
            People reached
          </span>
        </div>
      </div>
    </Card>
  );
}
