"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";
import { AnalyticsDonutChart } from "../../analytics/components/analytics-donut-chart";
import { AnalyticsTimelineChart } from "../../analytics/components/analytics-timeline-chart";
import { AdminActivityHeatmap } from "../components/admin-activity-heatmap";
import { AdminDashboardSkeleton } from "../components/admin-dashboard-skeleton";
import { AdminPendingReviews } from "../components/admin-pending-reviews";
import { DashboardStatCard } from "../components/dashboard-stat-card";

export default function AdminDashboard() {
  const { uuid } = useParams<{ uuid: string }>();
  const analytics = useQuery(api.analytics.getAnalytics);
  const pendingReviews = useQuery(api.impact.adminPending, { limit: 3 });

  if (analytics === undefined || pendingReviews === undefined) {
    return <AdminDashboardSkeleton />;
  }

  const { summary, timeline } = analytics;

  // Build sparkline arrays from last 12 data points
  const ambassadorTrend = [
    Math.round(summary.totalAmbassadors * 0.75),
    Math.round(summary.totalAmbassadors * 0.88),
    summary.totalAmbassadors,
  ];
  const contributionTrend = timeline.slice(-12).map((t) => t.contributions);
  const pendingTrend = [
    Math.round(summary.pendingReviews * 0.75),
    Math.round(summary.pendingReviews * 0.88),
    summary.pendingReviews,
  ];

  return (
    <div className="space-y-5  sm:space-y-6">
      <section
        aria-label="Program overview"
        className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3"
      >
        <DashboardStatCard
          label="Total active ambassadors"
          value={summary.totalAmbassadors.toLocaleString("en-GB")}
          periodLabel="Since 2 September"
          trend={ambassadorTrend}
        />
        <DashboardStatCard
          label="Program impact"
          value={summary.totalContributions.toLocaleString("en-GB")}
          periodLabel="Since 2 September"
          trend={contributionTrend}
          deltaLabel="This month"
        />
        <DashboardStatCard
          label="Pending reviews"
          value={summary.pendingReviews.toLocaleString("en-GB")}
          periodLabel="Since 2 September"
          trend={pendingTrend}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.85fr)]">
        <AnalyticsTimelineChart
          data={analytics.timeline}
          totalPoints={summary.totalPoints}
        />
        <AnalyticsDonutChart data={analytics.byKind} title="Contribution mix" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.8fr)]">
        <AdminPendingReviews reviews={pendingReviews} uuid={uuid} />
        <Card className="rounded-2xl border-border py-0 shadow-none">
          <CardContent className="p-3 sm:p-4">
            <h2 className="font-semibold text-foreground">Headmaps</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contribution activity across the program.
            </p>
            <div className="mt-5 rounded-lg bg-muted/20 p-3">
              <AdminActivityHeatmap data={analytics.timeline} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
