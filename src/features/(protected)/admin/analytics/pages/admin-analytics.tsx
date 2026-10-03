"use client";

import { useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { PageDescription } from "@/components/shared/page-description";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../../convex/_generated/api";
import { AnalyticsDemographics } from "../components/analytics-demographics";
import { AnalyticsDonutChart } from "../components/analytics-donut-chart";
import { AnalyticsSkeleton } from "../components/analytics-skeleton";
import { AnalyticsSourceList } from "../components/analytics-source-list";
import { AnalyticsTimelineChart } from "../components/analytics-timeline-chart";

const trackColors: Record<string, string> = {
  creator: "var(--chart-1)",
  community: "var(--chart-2)",
  growth: "var(--chart-3)",
  creative: "var(--chart-4)",
  production: "var(--chart-5)",
  advocacy: "var(--primary)",
};

export default function AdminAnalytics() {
  const analytics = useQuery(api.analytics.getAnalytics);

  if (analytics === undefined) {
    return <AnalyticsSkeleton />;
  }

  const { summary, timeline, byTrack, byKind, byLevel, byLocation } = analytics;

  const totalTrackCount = byTrack.reduce((sum, t) => sum + t.count, 0);
  const trackData = byTrack.map((t) => ({
    name: t.track.charAt(0).toUpperCase() + t.track.slice(1),
    value: t.count,
    percentage: totalTrackCount > 0 ? (t.count / totalTrackCount) * 100 : 0,
    color: trackColors[t.track] ?? "var(--muted-foreground)",
  }));

  const totalLevelCount = byLevel.reduce((sum, l) => sum + l.count, 0);
  const levelData = byLevel.map((l) => ({
    name: l.level,
    value: l.count,
    percentage: totalLevelCount > 0 ? (l.count / totalLevelCount) * 100 : 0,
    color: "var(--chart-4)",
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageDescription page="adminAnalytics" className="max-w-2xl" />
        <Button size="sm" className="gap-2">
          <Plus aria-hidden="true" className="size-4" />
          Create Report
        </Button>
      </div>

      <AnalyticsTimelineChart
        data={timeline}
        totalPoints={summary.totalPoints}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsDonutChart data={byKind} title="Contribution Types" />
        <AnalyticsSourceList title="Ambassador Tracks" data={trackData} />
        <AnalyticsSourceList title="Ambassador Levels" data={levelData} />
      </div>

      <AnalyticsDemographics data={byLocation} />
    </div>
  );
}
