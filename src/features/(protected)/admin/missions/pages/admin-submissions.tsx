"use client";

import { usePaginatedQuery } from "convex/react";
import { ArrowRight, ArrowUpRight, FileCheck2, UserRound } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../../../../convex/_generated/api";

const STATUSES = [
  "all",
  "pending",
  "approved",
  "rejected",
  "declined",
] as const;
const parseStatus = parseAsStringLiteral(STATUSES)
  .withDefault("pending")
  .withOptions({ clearOnDefault: true });

function isStatus(value: string): value is (typeof STATUSES)[number] {
  return STATUSES.some((status) => status === value);
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const statusLabel = {
  pending: "Submitted",
  approved: "Approved",
  rejected: "Changes requested",
  declined: "Rejected",
} as const;

const statusStyle = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-warning text-warning-foreground",
  declined: "bg-destructive text-destructive-foreground",
} as const;

const kindLabel = {
  mission_submission: "Mission submission",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Event",
  other: "Other contribution",
} as const;

export default function AdminSubmissions({ uuid }: { uuid: string }) {
  const [status, setStatus] = useQueryState("submissionStatus", parseStatus);
  const {
    results,
    status: pageStatus,
    loadMore,
  } = usePaginatedQuery(
    api.contributions.adminList,
    { status: status === "all" ? undefined : status },
    { initialNumItems: 8 },
  );

  return (
    <section aria-label="Ambassador submissions" className="space-y-5">
      <div className="flex  justify-end">
        <Select
          value={status}
          onValueChange={(value) => {
            if (isStatus(value)) {
              void setStatus(value);
            }
          }}
        >
          <SelectTrigger
            size="sm"
            aria-label="Filter submissions by status"
            className=" border-border bg-card text-foreground hover:bg-muted"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Changes requested</SelectItem>
            <SelectItem value="declined">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pageStatus === "LoadingFirstPage" ? (
        <div className="divide-y divide-border rounded-lg bg-card px-3 sm:px-4">
          {["one", "two", "three", "four", "five", "six"].map((key) => (
            <div
              key={key}
              aria-hidden="true"
              className="h-16 animate-pulse bg-card sm:h-24"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={"No submissions found"}
          description={
            status === "all"
              ? "Ambassador submissions will appear here."
              : `There are no ${statusLabel[status]} contributions right now.`
          }
          action={
            status !== "all"
              ? {
                  label: "Show all submissions",
                  onClick: () => void setStatus("all"),
                }
              : undefined
          }
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg bg-card px-3 sm:px-4">
          {results.map((submission) => (
            <li key={submission._id} className="min-w-0">
              <Link
                href={{
                  pathname: `/admin/${uuid}/missions/submissions/${submission._id}`,
                  query: {
                    section: "submissions",
                    ...(status !== "pending"
                      ? { submissionStatus: status }
                      : {}),
                  },
                }}
                className="group grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 py-2.5 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="line-clamp-1 text-sm font-semibold leading-snug text-foreground">
                      {submission.missionTitle ?? submission.title}
                    </span>
                    <Badge className={statusStyle[submission.status]}>
                      {statusLabel[submission.status]}
                    </Badge>
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <UserRound aria-hidden="true" className="size-3.5" />
                    <span>{submission.ambassadorName}</span>
                    <span aria-hidden="true">{"\u00b7"}</span>
                    <span>{kindLabel[submission.kind]}</span>
                    <span aria-hidden="true">{"\u00b7"}</span>
                    <time
                      dateTime={new Date(
                        submission._creationTime,
                      ).toISOString()}
                    >
                      {dateFormat.format(new Date(submission._creationTime))}
                    </time>
                  </span>
                  <span className="mt-1 block line-clamp-1 break-words text-xs leading-4 text-muted-foreground">
                    {submission.note ??
                      submission.responses?.find((response) =>
                        response.value.trim(),
                      )?.value ??
                      "No response preview available."}
                  </span>
                </span>
                <span className="inline-flex min-h-11 shrink-0 items-center justify-end gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  <span className="inline-flex items-center gap-2">
                    <span className="sr-only">Open submission</span>
                    <span aria-hidden="true">Open</span>
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageStatus === "CanLoadMore" || pageStatus === "LoadingMore" ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(8)}
            disabled={pageStatus === "LoadingMore"}
          >
            {pageStatus === "LoadingMore"
              ? "Loading…"
              : "Load 8 more submissions"}
            {pageStatus === "CanLoadMore" ? (
              <ArrowRight aria-hidden="true" />
            ) : null}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
