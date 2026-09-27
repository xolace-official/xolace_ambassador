"use client";

import { useQuery } from "convex/react";
import { Target } from "lucide-react";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Mission, MissionCategory } from "@/types/missions.type";
import {
  MISSION_CATEGORIES,
  MISSION_CATEGORY_LABELS,
  MISSION_STATUS_LABELS,
  MISSION_STATUSES,
} from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";
import { MissionCard } from "../components/mission-card";
import { MissionStats } from "../components/mission-stats";
import { toMission } from "../mission-mapper";

const ALL = "all";

type MissionFilter = MissionCategory | typeof ALL;

const FILTERS = [ALL, ...MISSION_CATEGORIES] as const;
const STATUS_FILTERS = [ALL, ...MISSION_STATUSES] as const;

// Typed parsers, so a hand-edited url cannot produce a value outside the list.
const parseMissionFilter = parseAsStringLiteral(FILTERS)
  .withDefault(ALL)
  .withOptions({ clearOnDefault: true });

const parseStatusFilter = parseAsStringLiteral(STATUS_FILTERS)
  .withDefault(ALL)
  .withOptions({ clearOnDefault: true });

function isMissionFilter(value: string): value is MissionFilter {
  return (FILTERS as readonly string[]).includes(value);
}

function isStatusFilter(
  value: string,
): value is (typeof STATUS_FILTERS)[number] {
  return (STATUS_FILTERS as readonly string[]).includes(value);
}

export default function AmbassadorMissions() {
  const user = useQuery(api.users.current);

  // Frozen at mount. Passing a live `Date.now()` would change the query key on
  // every render and refetch in a loop.
  const [now] = useState(() => Date.now());

  const [track, setTrack] = useQueryState("track", parseMissionFilter);
  const [status, setStatus] = useQueryState("status", parseStatusFilter);

  const trackArg = track === ALL ? undefined : track;

  const rows = useQuery(api.missions.list, { track: trackArg, now });

  // The track filter is a query arg, so it hits the database. Status reflects
  // this ambassador's own submissions and stays client-side until the
  // contributions table lands.
  const all = useMemo(() => (rows ?? []).map((row) => toMission(row)), [rows]);

  const visibleMissions = all.filter(
    (mission) => status === ALL || mission.status === status,
  );

  const isFiltered = track !== ALL || status !== ALL;

  function clearFilters() {
    void setTrack(ALL);
    void setStatus(ALL);
  }

  return (
    <div className="w-full" >
      <p className="text-sm leading-6 text-foreground/70">
        Choose a mission, make your contribution, and grow with Xolace.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <MissionStats missions={all} />

        <div className="flex items-center gap-2">
          <Select
            value={track}
            onValueChange={(value) => {
              if (isMissionFilter(value)) {
                void setTrack(value);
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
            value={status}
            onValueChange={(value) => {
              if (isStatusFilter(value)) {
                void setStatus(value);
              }
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Filter missions by status"
              className="w-36 shrink-0 border-border bg-card text-foreground hover:bg-muted"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={ALL}>Any status</SelectItem>

              {MISSION_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {MISSION_STATUS_LABELS[value]}
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
            className="col-span-full md:mx-auto md:w-4/5"
            icon={Target}
            title="Nothing matches those filters"
            description={
              isFiltered
                ? "Try widening your search, or clear the filters to see every mission."
                : "New missions open every week. Check back soon."
            }
            action={
              isFiltered
                ? { label: "Clear filters", onClick: clearFilters }
                : undefined
            }
          />
        ) : (
          visibleMissions.map((mission: Mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              href={`/ambassador/${user?._id}/missions/${mission.id}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MissionGridSkeleton() {
  return (
    <>
      {["a", "b", "c"].map((key) => (
        <div
          key={key}
          aria-hidden
          className="h-44 animate-pulse rounded-xl border border-border bg-card"
        />
      ))}
    </>
  );
}
