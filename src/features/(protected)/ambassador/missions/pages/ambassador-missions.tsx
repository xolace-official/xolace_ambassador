"use client";

import { useQuery } from "convex/react";
import { useQueryState } from "nuqs";
import { parseAsStringLiteral } from "nuqs/server";

import type { Mission } from "@/types/missions.type";
import { MISSION_CATEGORY_LABELS } from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";
import { MissionCard } from "../components/mission-card";
import { MissionStats } from "../components/mission-stats";

const parseMissionCategory = parseAsStringLiteral(
  Object.keys(MISSION_CATEGORY_LABELS) as [
    Mission["category"],
    ...Mission["category"][],
  ],
);

const missions: Mission[] = [
  {
    id: "mission-1",
    title: "Start a Conversation",
    description:
      "Start a meaningful conversation around something people don't usually talk about.",
    category: "community",
    points: 50,
    difficulty: "beginner",
    startsAt: "2026-09-25",
    endsAt: "2026-10-04",
    status: "available",
  },
  {
    id: "mission-2",
    title: "Tell a Story",
    description:
      "Create a short piece of content that helps someone feel understood.",
    category: "creator",
    points: 20,
    difficulty: "intermediate",
    startsAt: "2026-09-25",
    endsAt: "2026-10-08",
    status: "available",
  },
];

export default function AmbassadorMissions() {
  const user = useQuery(api.users.current);

  const [category, setCategory] = useQueryState(
    "category",
    parseMissionCategory,
  );

  const visibleMissions = category
    ? missions.filter((mission) => mission.category === category)
    : missions;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Your contribution</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Missions
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Choose a mission, make your contribution, and grow with Xolace.
        </p>
      </header>

      <MissionStats available={12} active={2} underReview={3} completed={18} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void setCategory(null)}
          aria-pressed={category === null}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            category === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          All
        </button>

        {(
          Object.entries(MISSION_CATEGORY_LABELS) as [
            Mission["category"],
            string,
          ][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => void setCategory(value === category ? null : value)}
            aria-pressed={category === value}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              category === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <section aria-labelledby="available-missions">
        <div className="mb-4">
          <h2
            id="available-missions"
            className="text-lg font-semibold tracking-tight"
          >
            Available missions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {category
              ? `Showing ${MISSION_CATEGORY_LABELS[category].toLowerCase()} missions.`
              : "Choose something you can meaningfully contribute to."}
          </p>
        </div>

        {visibleMissions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {category ? (
              <>
                No {MISSION_CATEGORY_LABELS[category].toLowerCase()} missions
                yet.
              </>
            ) : (
              "No missions available."
            )}{" "}
            <button
              type="button"
              onClick={() => void setCategory(null)}
              className="font-medium text-primary underline underline-offset-4"
            >
              Clear filter
            </button>
          </p>
        ) : (
          <div className="grid gap-4">
            {visibleMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                href={`/ambassador/${user?._id}/missions/${mission.id}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
