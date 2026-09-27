"use client";

import { usePaginatedQuery } from "convex/react";
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

export default function AdminMissions({ uuid }: { uuid: string }) {
  const [section, setSection] = useQueryState("section", parseSection);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageDescription
          page={
            section === "submissions"
              ? "adminSubmissions"
              : section === "impact"
                ? "adminImpact"
                : "adminMissions"
          }
          className="max-w-2xl"
        />
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/admin/${uuid}/missions/new`}>
            <Plus aria-hidden="true" />
            New mission
          </Link>
        </Button>
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
            {value === "impact" ? "Impact" : value}
          </button>
        ))}
      </nav>

      {section === "missions" ? (
        <MissionListing uuid={uuid} />
      ) : section === "submissions" ? (
        <AdminSubmissions uuid={uuid} />
      ) : (
        <AdminSubmissions mode="impact" uuid={uuid} />
      )}
    </div>
  );
}

function MissionListing({ uuid }: { uuid: string }) {
  const [track, setTrack] = useQueryState("track", parseTrack);
  const [status, setStatus] = useQueryState("status", parseStatus);

  const {
    results,
    status: pageStatus,
    loadMore,
  } = usePaginatedQuery(
    api.missions.adminList,
    {
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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
        <div className="grid gap-5 lg:grid-cols-2">
          {["one", "two", "three"].map((key) => (
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
        <div className="grid gap-5 lg:grid-cols-2">
          {results.map((mission) => (
            <Card
              key={mission._id}
              className="group flex h-full flex-col gap-0 border-border p-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
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

              <div className="flex-1 px-5 py-5">
                <h2 className="text-xl font-semibold leading-snug text-card-foreground">
                  {mission.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {mission.summary}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="capitalize">{mission.difficulty}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="size-4" />
                    Due {deadlineFormat.format(new Date(mission.endsAt))}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-2">
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
                  href={`/admin/${uuid}/missions/${mission._id}`}
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

      {pageStatus === "CanLoadMore" || pageStatus === "LoadingMore" ? (
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
