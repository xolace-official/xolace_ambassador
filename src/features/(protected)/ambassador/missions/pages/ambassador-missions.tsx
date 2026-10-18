"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Target } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageDescription } from "@/components/shared/page-description";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStableQuery } from "@/hooks/use-stable-query";
import type { Mission, MissionCategory } from "@/types/missions.type";
import {
  MISSION_CATEGORIES,
  MISSION_CATEGORY_LABELS,
} from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { MissionCard } from "../components/mission-card";
import { MissionStats } from "../components/mission-stats";
import { toMission } from "../mission-mapper";

const ALL = "all";
const PAGE_SIZE = 6;

type MissionFilter = MissionCategory | typeof ALL;

const FILTERS = [ALL, ...MISSION_CATEGORIES] as const;

// Typed parsers, so a hand-edited url cannot produce a value outside the list.
const parseMissionFilter = parseAsStringLiteral(FILTERS)
  .withDefault(ALL)
  .withOptions({ clearOnDefault: true });

const parseMissionSetFilter = parseAsString
  .withDefault("")
  .withOptions({ clearOnDefault: true });

function isMissionFilter(value: string): value is MissionFilter {
  return (FILTERS as readonly string[]).includes(value);
}

export default function AmbassadorMissions() {
  const user = useQuery(api.users.current);

  // Frozen at mount. Passing a live `Date.now()` would change the query key on
  // every render and refetch in a loop.
  const [now] = useState(() => Date.now());
  const pageSize = PAGE_SIZE;
  const missionSets = useQuery(api.missionSets.listForAmbassador, { now });

  const [track, setTrack] = useQueryState("track", parseMissionFilter);
  const [missionSet, setMissionSet] = useQueryState(
    "missionSet",
    parseMissionSetFilter,
  );
  const [requestedPage, setPage] = useQueryState(
    "missionPage",
    parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  );

  const trackArg = track === ALL ? undefined : track;
  const selectedMissionSet =
    missionSets?.find((set) => set._id === missionSet) ?? missionSets?.[0];

  useEffect(() => {
    if (
      missionSets !== undefined &&
      missionSets.length > 0 &&
      missionSet !== "" &&
      !missionSets.some((set) => set._id === missionSet)
    ) {
      void setMissionSet(missionSets[0]._id);
      void setPage(1);
    }
  }, [missionSet, missionSets, setMissionSet, setPage]);

  // Wait for the sets so the first load does not briefly show the unscoped
  // list before swapping to the selected set.
  const rows = useStableQuery(
    api.missions.list,
    missionSets === undefined
      ? "skip"
      : {
          track: trackArg,
          missionSetId: selectedMissionSet?._id as
            | Id<"missionSets">
            | undefined,
          now,
        },
  );

  const all = useMemo(() => (rows ?? []).map((row) => toMission(row)), [rows]);

  const visibleMissions = all;
  const pageCount = Math.max(1, Math.ceil(visibleMissions.length / pageSize));
  const currentPage = Math.min(Math.max(requestedPage, 1), pageCount);
  const pageMissions = visibleMissions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const isFiltered = track !== ALL || missionSet !== "";

  function clearFilters() {
    void setTrack(ALL);
    void setMissionSet(null);
    void setPage(1);
  }

  return (
    <div className="w-full">
      <PageDescription page="ambassadorMissions" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <MissionStats missions={all} />

        <div className="ml-auto flex items-center justify-end gap-2">
          <Select
            value={track}
            onValueChange={(value) => {
              if (isMissionFilter(value)) {
                void setTrack(value);
                void setPage(1);
              }
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter missions by track"
              className="w-32 shrink-0 border-border bg-card text-foreground hover:bg-muted"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={ALL}>All tracks</SelectItem>

              {MISSION_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {MISSION_CATEGORY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMissionSet?._id ?? ""}
            onValueChange={(value) => {
              if (missionSets?.some((set) => set._id === value)) {
                void setMissionSet(value);
                void setPage(1);
              }
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter missions by mission set"
              className="w-44 shrink-0 border-border bg-card text-foreground hover:bg-muted"
            >
              <SelectValue placeholder="Mission set" />
            </SelectTrigger>

            <SelectContent>
              {missionSets?.map((set) => (
                <SelectItem key={set._id} value={set._id}>
                  {set.isCurrent ? "Current" : "Previous"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows === undefined ? (
          <MissionGridSkeleton />
        ) : visibleMissions.length === 0 ? (
          <EmptyState
            className="col-span-full w-full"
            icon={Target}
            title={
              user?.role === "ambassador" && !user.track
                ? "Your track has not been assigned"
                : selectedMissionSet
                  ? `No missions in ${selectedMissionSet.isCurrent ? "the current" : "the previous"} set`
                  : "No mission set available"
            }
            description={
              user?.role === "ambassador" && !user.track
                ? "Ask a program admin to assign your ambassador track before viewing missions."
                : selectedMissionSet?.isCurrent
                  ? "This set has no published missions yet. Choose Previous to view the last mission set."
                  : selectedMissionSet
                    ? "There are no published missions in this previous set."
                    : "No mission set is currently available. Check back soon."
            }
            action={
              isFiltered
                ? { label: "Clear filters", onClick: clearFilters }
                : undefined
            }
          />
        ) : (
          pageMissions.map((mission: Mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              href={`/ambassador/${user?._id}/missions/${mission.id}`}
            />
          ))
        )}
      </div>

      {rows !== undefined && visibleMissions.length > PAGE_SIZE ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, visibleMissions.length)} of{" "}
            {visibleMissions.length} missions
          </p>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              disabled={currentPage === 1}
              onClick={() => void setPage(currentPage - 1)}
            >
              <ArrowLeft aria-hidden="true" />
              Previous
            </Button>
            <span className="px-2 text-sm tabular-nums text-muted-foreground">
              {currentPage} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11"
              disabled={currentPage === pageCount}
              onClick={() => void setPage(currentPage + 1)}
            >
              Next
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}

      {user?._id ? (
        <Card className="mt-8 flex flex-col gap-3 border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-11">
            <BookOpenCheck aria-hidden="true" className="size-4 sm:size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground">
              Looking for a place to start?
            </h2>
            <p className="mt-1 hidden text-sm leading-6 text-muted-foreground sm:block">
              Explore practical guides and resources to help you choose your
              next contribution.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href={`/ambassador/${user._id}/resources`}>
              Explore resources
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Card>
      ) : null}
    </div>
  );
}

function MissionGridSkeleton() {
  return (
    <>
      {["a", "b", "c", "d", "e", "f"].map((key) => (
        <div
          key={key}
          aria-hidden
          className="h-44 animate-pulse rounded-xl border border-border bg-card"
        />
      ))}
    </>
  );
}
