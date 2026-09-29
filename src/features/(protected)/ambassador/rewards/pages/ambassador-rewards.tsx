"use client";

import { useQuery } from "convex/react";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import { RewardsHistoryList } from "../components/rewards-history-list";
import { RewardsLevelProgress } from "../components/rewards-level-progress";
import { RewardsRecognitionList } from "../components/rewards-recognition-list";
import { RewardsSkeleton } from "../components/rewards-skeleton";
import { RewardsStatsGrid } from "../components/rewards-stats-grid";

export default function AmbassadorRewards() {
  const rewards = useQuery(api.rewards.getRewards);

  if (rewards === undefined) {
    return <RewardsSkeleton />;
  }

  const { totals, currentLevel, nextLevel, progress, ledger, recognitions } =
    rewards;

  return (
    <div className="space-y-6">
      <PageDescription page="ambassadorRewards" className="max-w-2xl" />

      <RewardsStatsGrid
        points={totals.points}
        levelName={currentLevel.name}
        contributionsApproved={totals.contributionsApproved}
        missionsCompleted={totals.missionsCompleted}
      />

      <RewardsLevelProgress
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        progress={progress}
        points={totals.points}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Recognition</h2>
        <RewardsRecognitionList recognitions={recognitions} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Reward history
        </h2>
        <RewardsHistoryList ledger={ledger} />
      </div>
    </div>
  );
}
