"use client";

import { usePaginatedQuery } from "convex/react";
import { ArrowRight, ArrowUpRight, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  .withDefault("all")
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

const kindLabel = {
  mission_submission: "Mission submission",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Event",
  other: "Other contribution",
} as const;

export default function AdminSubmissions({
  uuid,
  mode = "submissions",
}: {
  uuid: string;
  mode?: "submissions" | "impact";
}) {
  const [status, setStatus] = useQueryState("submissionStatus", parseStatus);
  const isImpact = mode === "impact";
  const selectedStatus = isImpact
    ? "approved"
    : status === "all"
      ? undefined
      : status;
  const {
    results,
    status: pageStatus,
    loadMore,
  } = usePaginatedQuery(
    api.contributions.adminList,
    { status: selectedStatus },
    { initialNumItems: 8 },
  );

  return (
    <section aria-label="Ambassador submissions" className="space-y-5">
      {isImpact ? null : (
        <div className="flex justify-end">
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
              className="w-36 shrink-0 border-border bg-card text-foreground hover:bg-muted"
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
      )}

      {pageStatus === "LoadingFirstPage" ? (
        <div className="grid gap-4">
          {["one", "two", "three"].map((key) => (
            <div
              key={key}
              aria-hidden="true"
              className="h-44 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={
            isImpact ? "No approved contributions yet" : "No submissions found"
          }
          description={
            isImpact
              ? "Approved work will appear here as ambassadors complete tasks and their contributions are reviewed."
              : status === "all"
                ? "Ambassador submissions and impact reports will appear here."
                : `There are no ${statusLabel[status]} contributions right now.`
          }
          action={
            !isImpact && status !== "all"
              ? {
                  label: "Show all submissions",
                  onClick: () => void setStatus("all"),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {results.map((submission) => (
            <Card
              key={submission._id}
              className="group relative grid gap-3 border-border p-4 transition-colors hover:border-primary/40 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    <Link
                      href={`/admin/${uuid}/missions/submissions/${submission._id}?section=${isImpact ? "impact" : "submissions"}${!isImpact && status !== "all" ? `&submissionStatus=${status}` : ""}`}
                      className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {submission.missionTitle ?? submission.title}
                    </Link>
                  </h2>
                  <Badge variant="outline">
                    {statusLabel[submission.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted by {submission.ambassadorName}{" "}
                  <span aria-hidden="true">·</span> {kindLabel[submission.kind]}{" "}
                  <span aria-hidden="true">·</span>{" "}
                  {dateFormat.format(new Date(submission._creationTime))}
                </p>
                {(submission.note ??
                submission.responses?.find((response) => response.value.trim())
                  ?.value) ? (
                  <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                    {submission.note ??
                      submission.responses?.find((response) =>
                        response.value.trim(),
                      )?.value}
                  </p>
                ) : null}
              </div>
              <span className="inline-flex min-h-11 shrink-0 items-center gap-1 px-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                Open submission
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </span>
            </Card>
          ))}
        </div>
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
