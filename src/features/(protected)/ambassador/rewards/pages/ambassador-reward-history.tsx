"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsStringLiteral } from "nuqs/server";
import { api } from "../../../../../../convex/_generated/api";
import { RewardsHistoryList } from "../components/rewards-history-list";
import { RewardsPagination } from "../components/rewards-pagination";
import { RewardsSkeleton } from "../components/rewards-skeleton";

const modes = ["all"] as const;
const PAGE_SIZE = 8;

export default function AmbassadorRewardHistory() {
  const [mode] = useQueryState(
    "mode",
    parseAsStringLiteral(modes).withDefault("all"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const rewards = useQuery(api.rewards.getRewards, { history: mode });

  if (rewards === undefined) return <RewardsSkeleton />;

  const totalPages = Math.max(1, Math.ceil(rewards.ledger.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const entries = rewards.ledger.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Reward history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review points awarded through approved contributions and reward
          activity.
        </p>
      </div>
      <RewardsHistoryList ledger={entries} />
      <RewardsPagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
