"use client";

import type { FunctionReturnType } from "convex/server";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { api } from "../../../../../../convex/_generated/api";

type Contribution = FunctionReturnType<
  typeof api.ambassadors.getProfile
>["contributions"][number];

const numberFormat = new Intl.NumberFormat("en-GB");

function buildChartData(
  contributions: Contribution[],
  period: "weekly" | "monthly",
) {
  const now = new Date();
  const buckets = new Map<string, { points: number; submissions: number }>();

  if (period === "weekly") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { points: 0, submissions: 0 });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      buckets.set(key, { points: 0, submissions: 0 });
    }
  }

  for (const c of contributions) {
    const day = new Date(c._creationTime).toISOString().slice(0, 10);
    const key = period === "weekly" ? day : day.slice(0, 7);
    const entry = buckets.get(key);
    if (!entry) continue;
    entry.points += c.awardedPoints ?? 0;
    entry.submissions += 1;
  }

  return [...buckets.entries()].map(([date, data]) => ({ date, ...data }));
}

export function AmbassadorReportsChart({
  contributions,
  totalPoints,
}: {
  contributions: Contribution[];
  totalPoints: number;
}) {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const chartData = useMemo(
    () => buildChartData(contributions, period),
    [contributions, period],
  );

  return (
    <Card className="overflow-hidden rounded-2xl border-border/60 py-0 shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Reports</h2>
            <div className="mt-2 flex gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Points earned</p>
                <p className="font-semibold tabular-nums text-foreground">
                  {numberFormat.format(totalPoints)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submissions</p>
                <p className="font-semibold tabular-nums text-foreground">
                  {numberFormat.format(contributions.length)}
                </p>
              </div>
            </div>
          </div>
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}
          >
            <SelectTrigger className="h-8 px-3 text-xs ">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="grad-points" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="grad-submissions"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--success)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--success)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                stroke="var(--muted-foreground)"
                tickFormatter={(v: string) =>
                  period === "weekly"
                    ? new Intl.DateTimeFormat("en-GB", {
                        weekday: "short",
                      }).format(new Date(`${v}T12:00:00Z`))
                    : new Intl.DateTimeFormat("en-GB", {
                        month: "short",
                      }).format(new Date(`${v}-01T12:00:00Z`))
                }
              />
              <YAxis tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#grad-points)"
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke="var(--success)"
                strokeWidth={2}
                fill="url(#grad-submissions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full bg-primary" />
            Points
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-4 rounded-full bg-success" />
            Submissions
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
