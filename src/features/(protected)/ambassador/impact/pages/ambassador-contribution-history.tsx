"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import { parseAsInteger, parseAsStringLiteral } from "nuqs/server";
import { api } from "../../../../../../convex/_generated/api";
import { ContributionHistory } from "../components/contribution-history";
import { ContributionPagination } from "../components/contribution-pagination";
import { ImpactSkeleton } from "../components/impact-skeleton";

const modes = ["all"] as const;
const PAGE_SIZE = 8;

export default function AmbassadorContributionHistory() {
  const [mode] = useQueryState(
    "mode",
    parseAsStringLiteral(modes).withDefault("all"),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const contributions = useQuery(api.impact.getContributionHistory, {
    history: mode,
  });

  if (contributions === undefined) return <ImpactSkeleton />;

  const totalPages = Math.max(1, Math.ceil(contributions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const entries = contributions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Contribution history
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review every mission submission and impact contribution you have
          recorded.
        </p>
      </div>
      <ContributionHistory contributions={entries} />
      <ContributionPagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
