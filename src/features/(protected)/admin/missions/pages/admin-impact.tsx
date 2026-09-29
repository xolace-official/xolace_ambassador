"use client";

import { useQuery } from "convex/react";
import { Activity, Award, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import { ImpactChartCard } from "../../../ambassador/impact/components/impact-chart-card";
import { ImpactChartTooltip } from "../../../ambassador/impact/components/impact-chart-tooltip";
import { ImpactSkeleton } from "../../../ambassador/impact/components/impact-skeleton";
import { ImpactStatsGrid } from "../../../ambassador/impact/components/impact-stats-grid";

const kindLabel: Record<string, string> = {
  mission_submission: "Mission submissions",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Events",
  other: "Other",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export default function AdminImpact() {
  const stats = useQuery(api.impact.adminStats);
  const byKind = useQuery(api.impact.adminByKind);
  const timeline = useQuery(api.impact.adminTimeline);

  if (stats === undefined || byKind === undefined || timeline === undefined) {
    return <ImpactSkeleton />;
  }

  const statCards = [
    { label: "Total points", value: stats.totalPoints, icon: Award },
    { label: "Contributions", value: stats.totalContributions, icon: Activity },
    { label: "People reached", value: stats.totalPeopleReached, icon: Users },
    { label: "Pending review", value: stats.pendingCount, icon: TrendingUp },
  ];

  const chartData = byKind.map((item) => ({
    ...item,
    kind: kindLabel[item.kind] ?? item.kind,
  }));

  const { dateRange, data } = timeline;
  const timelineData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  const dateStart = dateFormatter.format(new Date(dateRange.min));
  const dateEnd = dateFormatter.format(new Date(dateRange.max));
  const maxPeopleReached = Math.max(...data.map((d) => d.peopleReached), 1);
  const maxContributions = Math.max(...data.map((d) => d.contributions), 1);

  return (
    <div className="space-y-5 pt-2">
      <PageDescription page="adminSubmissions" className="max-w-2xl" />

      <ImpactStatsGrid stats={statCards} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ImpactChartCard
          title="Impact over time"
          isEmpty={timelineData.length === 0}
          emptyTitle="No data yet"
          emptyDescription="Impact data will appear here once ambassadors start contributing."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                label={{
                  value: `${dateStart} — ${dateEnd}`,
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                domain={[0, maxPeopleReached + 1]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                domain={[0, maxContributions + 1]}
              />
              <Tooltip content={<ImpactChartTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="peopleReached"
                name="People reached"
                stroke="var(--chart-3)"
                fill="var(--chart-3)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="contributions"
                name="Contributions"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ImpactChartCard>

        <ImpactChartCard
          title="By contribution type"
          isEmpty={chartData.length === 0}
          emptyTitle="No contributions yet"
          emptyDescription="Contribution breakdown will appear here once ambassadors start submitting."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="kind"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                allowDecimals={false}
              />
              <Tooltip content={<ImpactChartTooltip />} />
              <Bar
                dataKey="count"
                name="Count"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ImpactChartCard>
      </div>
    </div>
  );
}
