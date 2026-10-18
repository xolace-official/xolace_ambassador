"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import { RewardRedemptionList } from "../components/reward-redemption-list";
import { RewardsCatalogue } from "../components/rewards-catalogue";
import { RewardsHistoryList } from "../components/rewards-history-list";
import { RewardsLevelProgress } from "../components/rewards-level-progress";
import { RewardsRecognitionList } from "../components/rewards-recognition-list";
import { RewardsSkeleton } from "../components/rewards-skeleton";
import { RewardsStatsGrid } from "../components/rewards-stats-grid";

export default function AmbassadorRewards({ uuid }: { uuid: string }) {
  const rewards = useQuery(api.rewards.getRewards, { history: "summary" });
  const catalogue = useQuery(api.rewards.listCatalogue);
  const redemptions = useQuery(api.rewards.listRedemptions);
  const redeem = useMutation(api.rewards.redeem);

  if (
    rewards === undefined ||
    catalogue === undefined ||
    redemptions === undefined
  ) {
    return <RewardsSkeleton />;
  }

  const {
    totals,
    currentLevel,
    nextLevel,
    availablePoints,
    ledger,
    recognitions,
  } = rewards;

  return (
    <div className="space-y-6">
      <PageDescription page="ambassadorRewards" className="max-w-2xl" />

      <RewardsStatsGrid
        points={totals.points}
        levelRank={currentLevel.rank}
        availablePoints={availablePoints}
        contributionsApproved={totals.contributionsApproved}
      />

      <RewardsLevelProgress
        currentLevel={currentLevel}
        nextLevel={nextLevel}
        points={totals.points}
        availablePoints={availablePoints}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Available rewards
        </h2>
        <RewardsCatalogue
          rewards={catalogue}
          points={totals.points}
          onRedeem={async (rewardId) => {
            await redeem({
              rewardId: rewardId as (typeof catalogue)[number]["_id"],
            });
            toast.success("Reward request sent for review.");
          }}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Your redemption requests
        </h2>
        <RewardRedemptionList redemptions={redemptions} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Recognition</h2>
        <RewardsRecognitionList recognitions={recognitions} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Reward history
        </h2>
        <RewardsHistoryList
          ledger={ledger}
          moreHref={`/ambassador/${uuid}/rewards/history?mode=all`}
        />
      </div>
    </div>
  );
}
