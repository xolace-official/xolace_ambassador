"use client";

import { useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageDescription } from "@/components/shared/page-description";
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

const kindLabels: Record<string, string> = {
  mission_submission: "Mission Submissions",
  people_reached: "People Reached",
  app_install: "App Installs",
  referral: "Referrals",
  content: "Content",
  event: "Events",
  other: "Other",
};

export default function AdminAnalytics() {
  const analytics = useQuery(api.analytics.getAnalytics);

  if (analytics === undefined) {
    return <AnalyticsSkeleton />;
  }

  const { timeline, byTrack, byKind, byLevel, byLocation } = analytics;

  const totalTrackCount = byTrack.reduce((sum, t) => sum + t.count, 0);
  const trackData = byTrack.map((t) => ({
    name: t.track.charAt(0).toUpperCase() + t.track.slice(1),
    value: t.count,
    percentage: totalTrackCount > 0 ? (t.count / totalTrackCount) * 100 : 0,
    color: trackColors[t.track] ?? "var(--muted-foreground)",
  }));

  const totalKindCount = byKind.reduce((sum, k) => sum + k.count, 0);
  const kindData = byKind.map((k) => ({
    name: kindLabels[k.kind] ?? k.kind,
    value: k.count,
    percentage: totalKindCount > 0 ? (k.count / totalKindCount) * 100 : 0,
    color: "var(--chart-2)",
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

      <AnalyticsTimelineChart data={timeline} />

      <div className="grid gap-4 lg:grid-cols-3">
        <AnalyticsDonutChart data={byKind} title="Contribution Types" />
        <AnalyticsSourceList title="Ambassador Tracks" data={trackData} />
        <AnalyticsSourceList title="Ambassador Levels" data={levelData} />
      </div>

      <AnalyticsDemographics data={byLocation} />
    </div>
  );
}
