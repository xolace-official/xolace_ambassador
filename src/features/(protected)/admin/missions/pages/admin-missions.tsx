"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Plus,
  Target,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
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
import {
  MISSION_CATEGORIES,
  MISSION_CATEGORY_LABELS,
} from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import AdminImpact from "./admin-impact";
import AdminSubmissions from "./admin-submissions";

const SECTIONS = ["missions", "submissions", "impact"] as const;
const parseSection = parseAsStringLiteral(SECTIONS)
  .withDefault("missions")
  .withOptions({ clearOnDefault: true });

const TRACKS = ["all", ...MISSION_CATEGORIES] as const;
const STATUSES = ["all", "draft", "published", "closed"] as const;
const parseTrack = parseAsStringLiteral(TRACKS)
  .withDefault("all")
  .withOptions({ clearOnDefault: true });
const parseStatus = parseAsStringLiteral(STATUSES)
  .withDefault("all")
  .withOptions({ clearOnDefault: true });

function isOneOf<T extends readonly string[]>(
  values: T,
  value: string,
): value is T[number] {
  return values.some((candidate) => candidate === value);
}

const createdFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const deadlineFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const statusLabel = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
} as const;

const statusStyle = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success text-success-foreground",
  closed: "border-border bg-muted text-muted-foreground",
} as const;

export default function AdminMissions({
  uuid,
  missionSetId,
}: {
  uuid: string;
  missionSetId?: string;
}) {
  const [section, setSection] = useQueryState("section", parseSection);
  const [publishing, setPublishing] = useState(false);
  const publicationStatus = useQuery(
    api.leaderboard.adminSetPublicationStatus,
    missionSetId ? { missionSetId: missionSetId as Id<"missionSets"> } : "skip",
  );
  const pendingSubmissions = useQuery(api.contributions.adminPendingCount);
  const togglePublication = useMutation(api.leaderboard.adminTogglePublication);

  return (
    <div className="flex flex-col gap-2">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <PageDescription page="adminMissions" className="max-w-2xl" />
        <div className="ml-auto flex w-fit flex-wrap justify-end gap-2 self-end">
          {missionSetId ? null : (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/${uuid}/missions`}>Mission sets</Link>
            </Button>
          )}
          {missionSetId && publicationStatus ? (
            <Button
              type="button"
              variant={publicationStatus.published ? "outline" : "secondary"}
              size="sm"
              aria-pressed={publicationStatus.published}
              disabled={
                publishing ||
                (!publicationStatus.published && !publicationStatus.canPublish)
              }
              onClick={() => {
                setPublishing(true);
                void togglePublication({
                  missionSetId: missionSetId as Id<"missionSets">,
                })
                  .then((published) =>
                    toast.success(
                      published
                        ? "Leaderboard published."
                        : "Leaderboard unpublished.",
                    ),
                  )
                  .catch((error: unknown) =>
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not update the leaderboard.",
                    ),
                  )
                  .finally(() => setPublishing(false));
              }}
            >
              {publishing
                ? "Updating…"
                : publicationStatus.published
                  ? "Unpublish Leaderboard"
                  : "Publish Leaderboard"}
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link
              href={`/admin/${uuid}/missions/new${missionSetId ? `?setId=${missionSetId}` : ""}`}
            >
              <Plus aria-hidden="true" />
              New mission
            </Link>
          </Button>
        </div>
      </header>

      <nav
        aria-label="Activity sections"
        className="flex flex-wrap items-center gap-x-6 border-b border-border"
      >
        {SECTIONS.map((value) => (
          <button
            key={value}
            type="button"
            aria-current={section === value ? "page" : undefined}
            onClick={() => void setSection(value)}
            className={`min-h-11 border-b-2 px-1 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              section === value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{value === "impact" ? "Impact" : value}</span>
            {value === "submissions" && pendingSubmissions ? (
              <Badge
                variant="destructive"
                aria-label={`${pendingSubmissions} pending`}
              >
                {pendingSubmissions}
              </Badge>
            ) : null}
          </button>
        ))}
      </nav>

      {section === "missions" ? (
        <MissionListing uuid={uuid} missionSetId={missionSetId} />
      ) : section === "submissions" ? (
        <AdminSubmissions uuid={uuid} />
      ) : (
        <AdminImpact />
      )}
    </div>
  );
}

function MissionListing({
  uuid,
  missionSetId,
}: {
  uuid: string;
  missionSetId?: string;
}) {
  const [track, setTrack] = useQueryState("track", parseTrack);
  const [status, setStatus] = useQueryState("status", parseStatus);

  const {
    results,
    status: pageStatus,
    loadMore,
  } = usePaginatedQuery(
    api.missions.adminList,
    {
      missionSetId: missionSetId
        ? (missionSetId as Id<"missionSets">)
        : undefined,
      track: track === "all" ? undefined : track,
      status: status === "all" ? undefined : status,
    },
    { initialNumItems: 6 },
  );

  const isFiltered = track !== "all" || status !== "all";

  function clearFilters() {
    void setTrack("all");
    void setStatus("all");
  }

  return (
    <section aria-label="Mission listings" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "mission" : "missions"} shown
        </p>
        <div className="flex flex-row gap-2 sm:w-auto">
          <Select
            value={track}
            onValueChange={(value) => {
              if (isOneOf(TRACKS, value)) {
                void setTrack(value);
              }
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter missions by track"
              className="w-full border-border bg-card sm:w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tracks</SelectItem>
              {MISSION_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {MISSION_CATEGORY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              if (isOneOf(STATUSES, value)) {
                void setStatus(value);
              }
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter missions by status"
              className="w-full border-border bg-card sm:w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageStatus === "LoadingFirstPage" ? (
        <div className="grid gap-5 md:grid-cols-2">
          {["one", "two", "three", "four", "five", "six"].map((key) => (
            <div
              key={key}
              aria-hidden="true"
              className="h-64 animate-pulse rounded-xl border border-border bg-card"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Target}
          title={
            isFiltered ? "No missions match these filters" : "No missions yet"
          }
          description={
            isFiltered
              ? "Try another track or status to see more missions."
              : "Create the first mission and give ambassadors a clear way to contribute."
          }
          action={
            isFiltered
              ? { label: "Clear filters", onClick: clearFilters }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {results.map((mission) => (
            <Card
              key={mission._id}
              className="group relative h-full gap-0 overflow-hidden border-border py-0 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-within:border-primary/50"
            >
              <div className="flex items-center justify-between gap-3 px-5 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-border bg-transparent text-foreground/80">
                    {MISSION_CATEGORY_LABELS[mission.track]}
                  </Badge>
                  <Badge className={statusStyle[mission.status]}>
                    {statusLabel[mission.status]}
                  </Badge>
                </div>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {mission.points} points
                </span>
              </div>

              <div className="px-5 py-3">
                <h2 className="h-10 line-clamp-2 overflow-hidden text-base font-semibold leading-5 tracking-tight text-card-foreground">
                  {mission.title}
                </h2>
                <p className="mt-2 h-10 line-clamp-2 overflow-hidden text-pretty text-sm leading-5 text-foreground/70">
                  {mission.summary}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <span className="capitalize">
                    {mission.difficulty} mission
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="size-4" />
                    Due {deadlineFormat.format(new Date(mission.endsAt))}
                  </span>
                </div>
              </div>

              <div className="mt-auto flex flex-row justify-between border-t border-border px-5 py-2">
                <div className="flex min-w-0 flex-col justify-center gap-1 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <UserRound
                      aria-hidden="true"
                      className="size-3.5 shrink-0"
                    />
                    <span className="truncate">
                      Created by {mission.createdByName}
                    </span>
                  </span>
                  <time
                    dateTime={new Date(mission._creationTime).toISOString()}
                  >
                    {createdFormat.format(new Date(mission._creationTime))}
                  </time>
                </div>
                <Link
                  href={
                    mission.missionSetId
                      ? `/admin/${uuid}/missions/${mission.missionSetId}/${mission._id}`
                      : `/admin/${uuid}/missions`
                  }
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View details
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {results.length > 6 &&
      (pageStatus === "CanLoadMore" || pageStatus === "LoadingMore") ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(6)}
            disabled={pageStatus === "LoadingMore"}
          >
            {pageStatus === "LoadingMore" ? "Loading…" : "Load 6 more missions"}
            {pageStatus === "CanLoadMore" ? (
              <ArrowRight aria-hidden="true" />
            ) : null}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
