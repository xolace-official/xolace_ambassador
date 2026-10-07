"use client";

import { useQuery } from "convex/react";
import { CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { AmbassadorDashboardSkeleton } from "../components/ambassador-dashboard-skeleton";
import { AmbassadorDashboardStats } from "../components/ambassador-dashboard-stats";
import { AmbassadorOverviewPanels } from "../components/ambassador-overview-panels";
import {
  getWeeklyContributionCounts,
  getWeeklyPointTotals,
} from "../utils/dashboard-metrics";

export default function AmbassadorDashboard() {
  const { uuid } = useParams<{ uuid: string }>();
  const profile = useQuery(api.ambassadors.getProfile);
  const missions = useQuery(api.missions.list, { now: Date.now() });
  const impact = useQuery(api.impact.getForAmbassador);
  const contributionHistory = useQuery(api.impact.getContributionHistory, {
    history: "all",
  });

  if (
    profile === undefined ||
    missions === undefined ||
    impact === undefined ||
    contributionHistory === undefined
  ) {
    return <AmbassadorDashboardSkeleton />;
  }

  const totals = profile.totals;
  const points = totals?.points ?? 0;
  const weeklyPoints = getWeeklyPointTotals(impact.timeline);
  const weeklyContributions = getWeeklyContributionCounts(contributionHistory);

  return (
    <div className="-m-4 min-h-full space-y-5 p-4 sm:-m-8 sm:space-y-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon aria-hidden="true" className="size-4" />
          <span>Current program activity</span>
        </div>
      </div>

      <AmbassadorDashboardStats
        points={points}
        missions={totals?.missionsCompleted ?? 0}
        peopleReached={totals?.peopleReached ?? 0}
        recognitions={profile.recognitions.length}
        weeklyPoints={weeklyPoints}
      />

      <AmbassadorOverviewPanels
        profile={profile}
        missions={missions}
        uuid={uuid}
        contributions={contributionHistory.map((contribution) => ({
          _id: contribution._id,
          _creationTime: contribution._creationTime,
          title: contribution.title,
          status: contribution.status,
          awardedPoints: contribution.awardedPoints ?? null,
        }))}
        weeklyPoints={weeklyPoints}
        weeklyContributions={weeklyContributions}
      />
    </div>
  );
}
