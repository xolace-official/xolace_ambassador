import {
  Area,
  AreaChart,
  CartesianGrid,
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

interface TimelinePoint {
  date: string;
  points: number;
  contributions: number;
  peopleReached: number;
}

function generateDummyData(): TimelinePoint[] {
  const data: TimelinePoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const base = 100 + Math.sin(i * 0.5) * 50 + i * 3;
    data.push({
      date: dateStr,
      points: Math.round(base + Math.random() * 80),
      contributions: Math.round(base * 0.6 + Math.random() * 40),
      peopleReached: Math.round(base * 0.3 + Math.random() * 20),
    });
  }
  return data;
}

interface AnalyticsTimelineChartProps {
  data: TimelinePoint[];
}

export function AnalyticsTimelineChart({ data }: AnalyticsTimelineChartProps) {
  const chartData = data.length > 0 ? data : generateDummyData();
  const totalPoints = chartData.reduce((sum, d) => sum + d.points, 0);

  return (
    <Card className="border-border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Total points:</span>
          <span className="text-lg font-bold tabular-nums text-foreground">
            {numberFormat.format(totalPoints)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" defaultChecked className="size-3 rounded accent-primary" />
            Aggregate
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="size-3 rounded accent-primary" />
            Individual
          </label>
          <Select defaultValue="monthly">
            <SelectTrigger className="h-7 w-28 text-xs">
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
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="var(--muted-foreground)"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              }}
            />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
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
            <Area
              type="monotone"
              dataKey="points"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stroke="var(--success)"
              fill="var(--success)"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="peopleReached"
              stroke="var(--warning)"
              fill="var(--warning)"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" />
          Points
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-success" />
          Contributions
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-warning" />
          People reached
        </span>
      </div>
    </Card>
  );
}
