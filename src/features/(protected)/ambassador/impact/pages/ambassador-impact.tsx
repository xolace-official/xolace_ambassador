"use client";

import { useQuery } from "convex/react";
import { useSessionUser } from "@/hooks/use-session-user";
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
import { Activity, Award, TrendingUp, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { ImpactStatsGrid } from "@/features/(protected)/ambassador/impact/components/impact-stats-grid";
import { ImpactSkeleton } from "@/features/(protected)/ambassador/impact/components/impact-skeleton";
import { ImpactChartCard } from "@/features/(protected)/ambassador/impact/components/impact-chart-card";
import { ImpactChartTooltip } from "@/features/(protected)/ambassador/impact/components/impact-chart-tooltip";
import { ContributionHistory } from "../components/contribution-history";
import { api } from "../../../../../../convex/_generated/api";

const kindLabel: Record<string, string> = {
  mission_submission: "Mission submission",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Event",
  other: "Other",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default function AmbassadorImpact() {
  const session = useSessionUser();
  const userId = session.status === "signedIn" ? session.user._id : null;

  const totals = useQuery(
    api.ambassadors.getTotals,
    userId ? { userId } : "skip",
  );
  const contributions = useQuery(
    api.contributions.listForUser,
    userId ? { userId, limit: 50 } : "skip",
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

  if (totals == null || contributions === undefined) {
    return <ImpactSkeleton />;
  }

  const approved = contributions.filter((c) => c.status === "approved");
  const totalPeopleReached = approved
    .filter((c) => c.kind === "people_reached")
    .reduce((sum, c) => sum + (c.quantity ?? 0), 0);
  const totalReferrals = approved
    .filter((c) => c.kind === "referral")
    .reduce((sum, c) => sum + (c.quantity ?? 0), 0);

  const byKind = Object.entries(
    contributions.reduce<Record<string, number>>((acc, c) => {
      if (c.status === "approved") {
        acc[c.kind] =
          (acc[c.kind] ?? 0) +
          (c.kind === "people_reached" ||
            c.kind === "app_install" ||
            c.kind === "referral"
            ? c.quantity ?? 1
            : 1);
      }
      return acc;
    }, {}),
  ).map(([kind, count]) => ({ kind: kindLabel[kind] ?? kind, count }));

  const timeline = contributions
    .slice()
    .sort((a, b) => a._creationTime - b._creationTime)
    .map((c) => ({
      date: dateFormat.format(new Date(c._creationTime)),
      points: c.awardedPoints ?? 0,
    }));

  const stats = [
    { label: "Points earned", value: totals?.points ?? 0, icon: Award },
    { label: "Missions completed", value: totals?.missionsCompleted ?? 0, icon: Activity },
    { label: "People reached", value: totalPeopleReached, icon: Users },
    { label: "Referrals", value: totalReferrals, icon: TrendingUp },
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
            <AreaChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip content={<ImpactChartTooltip />} />
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

        <ImpactChartCard
          title="Contributions by type"
          isEmpty={byKind.length === 0}
          emptyTitle="No contributions yet"
          emptyDescription="Your contribution breakdown will appear here once approved."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byKind} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="kind" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
              <Tooltip content={<ImpactChartTooltip />} />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ImpactChartCard>
      </div>

      <ContributionHistory contributions={contributions} />
    </div>
  );
}
