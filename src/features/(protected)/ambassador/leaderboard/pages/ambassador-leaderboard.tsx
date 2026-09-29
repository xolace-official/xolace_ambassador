"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsStringLiteral } from "nuqs/server";
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
  lastMission: "Last Mission",
};

export default function AmbassadorLeaderboard() {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [period, setPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(periodOptions).withDefault("allTime"),
  );

  const leaderboard = useQuery(
    api.leaderboard.getLeaderboard,
    period === "lastMission" ? { period } : {},
  );

  if (leaderboard === undefined) {
    return <LeaderboardSkeleton />;
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageDescription page="ambassadorLeaderboard" className="max-w-2xl" />
        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
          {periodOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handlePeriodChange(option)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                period === option
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
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
        offset={PODIUM_COUNT}
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
