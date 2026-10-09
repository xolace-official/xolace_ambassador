"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsStringLiteral } from "nuqs/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { api } from "../../../../../../convex/_generated/api";
import { LeaderboardPagination } from "../components/leaderboard-pagination";
import { LeaderboardPodium } from "../components/leaderboard-podium";
import { LeaderboardSkeleton } from "../components/leaderboard-skeleton";
import { LeaderboardTable } from "../components/leaderboard-table";

const PAGE_SIZE = 8;
const PODIUM_COUNT = 3;

const periodOptions = ["allTime", "lastMission"] as const;
type Period = (typeof periodOptions)[number];

const periodLabels: Record<Period, string> = {
  allTime: "All Time",
  lastMission: "Latest Set",
};

export default function AmbassadorLeaderboard() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(periodOptions)
      .withDefault("allTime")
      .withOptions({ clearOnDefault: true }),
  );

  const leaderboard = useQuery(
    api.leaderboard.getLeaderboard,
    period === "lastMission" ? { period } : {},
  );

  if (leaderboard === undefined) {
    return <LeaderboardSkeleton />;
  }

  if (!leaderboard.published) {
    return (
      <div className="space-y-6">
        <PageDescription page="ambassadorLeaderboard" className="max-w-2xl" />
        <EmptyState
          title="The leaderboard is not published yet"
          description="The program team will publish rankings after the latest Mission Set closes and every submission has been reviewed."
        />
      </div>
    );
  }

  const { entries, currentUserId, currentUserRank } = leaderboard;
  const tableEntries = entries.slice(PODIUM_COUNT);
  const totalPages = Math.ceil(tableEntries.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* flex-wrap plus justify-between made each wrapped line spread apart, so
          the period tabs landed hard right on their own row. Column on mobile
          with the tabs self-end keeps them on the right; row from sm up. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageDescription page="ambassadorLeaderboard" className="max-w-2xl" />
        <div className="flex w-fit items-center gap-1 self-end rounded-full border border-border bg-background p-1 sm:self-auto">
          {periodOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handlePeriodChange(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                period === option
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              {periodLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <LeaderboardPodium entries={entries} currentUserId={currentUserId} />

      <LeaderboardTable
        entries={tableEntries}
        currentUserId={currentUserId}
        page={currentPage}
        pageSize={PAGE_SIZE}
      />

      <LeaderboardPagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {currentUserRank > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          You are ranked{" "}
          <span className="font-semibold text-foreground">
            #{currentUserRank}
          </span>{" "}
          out of {entries.length} ambassadors
        </p>
      ) : null}
    </div>
  );
}
