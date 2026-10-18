"use client";

import { useQuery } from "convex/react";
import { Activity, Award, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { Card } from "@/components/ui/card";
import { ImpactChartCard } from "@/features/(protected)/ambassador/impact/components/impact-chart-card";
import { ImpactChartTooltip } from "@/features/(protected)/ambassador/impact/components/impact-chart-tooltip";
import { ImpactSkeleton } from "@/features/(protected)/ambassador/impact/components/impact-skeleton";
import { ImpactStatsGrid } from "@/features/(protected)/ambassador/impact/components/impact-stats-grid";
import { useSessionUser } from "@/hooks/use-session-user";
import { api } from "../../../../../../convex/_generated/api";
import { ContributionHistory } from "../components/contribution-history";

const kindLabel: Record<string, string> = {
  mission_submission: "Mission submission",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Event",
  other: "Other",
};

const chartDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

const contributionTypes = [
  "mission_submission",
  "people_reached",
  "app_install",
  "referral",
  "content",
  "event",
  "other",
] as const;

const contributionLineColors = {
  mission_submission: "var(--chart-1)",
  people_reached: "var(--chart-2)",
  app_install: "var(--chart-3)",
  referral: "var(--chart-4)",
  content: "var(--chart-5)",
  event: "var(--primary)",
  other: "var(--muted-foreground)",
} as const;

export default function AmbassadorImpact({ uuid }: { uuid: string }) {
  const session = useSessionUser();
  const impact = useQuery(
    api.impact.getForAmbassador,
    session.status === "signedIn" ? {} : "skip",
  );
  const contributionHistory = useQuery(
    api.impact.getContributionHistory,
    session.status === "signedIn" ? { history: "summary" } : "skip",
  );

  if (session.status === "loading") {
    return <ImpactSkeleton />;
  }

  if (session.status === "signedOut") {
    return (
      <EmptyState
        title="Sign in required"
        description="You need to be signed in to view your impact."
      />
    );
  }

  if (impact === undefined || contributionHistory === undefined) {
    return <ImpactSkeleton />;
  }

  const { contributions } = impact;
  const timeline = impact.timeline.map((entry) => ({
    date: entry.date,
    points: entry.points,
  }));
  const contributionTimeline = buildContributionTimeline(contributions);

  const stats = [
    {
      label: "Points earned",
      value: impact.totals.points,
      description: "Lifetime approved rewards",
      icon: Award,
    },
    {
      label: "Missions completed",
      value: impact.totals.missionsCompleted,
      description: "Approved mission submissions",
      icon: Activity,
    },
    {
      label: "People reached",
      value: impact.totals.peopleReached,
      description: "People reached through approved work",
      icon: Users,
    },
    {
      label: "Referrals",
      value: impact.totals.referrals,
      description: "Approved referrals",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-5">
      <PageDescription page="ambassadorImpact" className="max-w-2xl" />

      <ImpactStatsGrid stats={stats} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ImpactChartCard
          title="Points over time"
          isEmpty={timeline.length === 0}
          emptyTitle="No activity yet"
          emptyDescription="Your points history will appear here once you start contributing."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timeline}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="date"
                scale="time"
                domain={
                  timeline.length === 1
                    ? [
                        timeline[0].date - 86_400_000,
                        timeline[0].date + 86_400_000,
                      ]
                    : ["dataMin", "dataMax"]
                }
                tickFormatter={(value: number) =>
                  chartDateFormat.format(new Date(value))
                }
                tick={{ fontSize: 11 }}
                minTickGap={24}
                stroke="var(--muted-foreground)"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                content={<ImpactChartTooltip />}
                labelFormatter={(value) =>
                  chartDateFormat.format(new Date(Number(value)))
                }
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ImpactChartCard>

        <ContributionTypeChart
          data={contributionTimeline.data}
          activeTypes={contributionTimeline.activeTypes}
        />
      </div>

      <ContributionHistory
        contributions={contributionHistory}
        moreHref={`/ambassador/${uuid}/impact/history?mode=all`}
      />
    </div>
  );
}

type ContributionType = (typeof contributionTypes)[number];
type ContributionTimelineRow = { date: number } & Partial<
  Record<ContributionType, number>
>;

function ContributionTypeChart({
  data,
  activeTypes,
}: {
  data: ContributionTimelineRow[];
  activeTypes: ContributionType[];
}) {
  return (
    <Card className="border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Contributions by type
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Cumulative approved activity across the current mission set.
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {activeTypes.length} types
        </span>
      </div>
      {activeTypes.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Approved contributions will appear here.
        </p>
      ) : (
        <div
          className="mt-5 h-72 min-w-0 sm:h-80"
          role="img"
          aria-label="Contributions by type over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="date"
                scale="time"
                domain={
                  data.length === 1
                    ? [data[0].date - 86_400_000, data[0].date + 86_400_000]
                    : ["dataMin", "dataMax"]
                }
                tickFormatter={(value: number) =>
                  chartDateFormat.format(new Date(value))
                }
                tick={{ fontSize: 11 }}
                minTickGap={24}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
              />
              <Tooltip
                content={<ImpactChartTooltip />}
                labelFormatter={(value) =>
                  chartDateFormat.format(new Date(Number(value)))
                }
              />
              <Legend
                formatter={(value) => kindLabel[value] ?? value}
                wrapperStyle={{ fontSize: "11px" }}
              />
              {activeTypes.map((type) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  name={type}
                  stroke={contributionLineColors[type]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function buildContributionTimeline(
  contributions: Array<{
    _creationTime: number;
    kind: string;
    status: string;
    quantity?: number;
  }>,
): { data: ContributionTimelineRow[]; activeTypes: ContributionType[] } {
  const approved = contributions
    .filter(
      (
        contribution,
      ): contribution is typeof contribution & {
        kind: ContributionType;
      } =>
        contribution.status === "approved" &&
        contributionTypes.includes(contribution.kind as ContributionType),
    )
    .sort((a, b) => a._creationTime - b._creationTime);
  const byDay = new Map<number, Partial<Record<ContributionType, number>>>();
  const quantityTypes = new Set<ContributionType>([
    "people_reached",
    "app_install",
    "referral",
  ]);

  for (const contribution of approved) {
    const day = new Date(contribution._creationTime);
    day.setUTCHours(0, 0, 0, 0);
    const row = byDay.get(day.getTime()) ?? {};
    const value = quantityTypes.has(contribution.kind)
      ? (contribution.quantity ?? 0)
      : 1;
    row[contribution.kind] = (row[contribution.kind] ?? 0) + value;
    byDay.set(day.getTime(), row);
  }

  if (byDay.size > 0) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    byDay.set(today.getTime(), byDay.get(today.getTime()) ?? {});
  }

  const activeTypes = contributionTypes.filter((type) =>
    approved.some((contribution) => contribution.kind === type),
  );
  const running = Object.fromEntries(
    contributionTypes.map((type) => [type, 0]),
  ) as Record<ContributionType, number>;
  const data = [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([date, values]) => {
      for (const type of contributionTypes) {
        running[type] += values[type] ?? 0;
      }
      return { date, ...running };
    });

  return { data, activeTypes };
}
