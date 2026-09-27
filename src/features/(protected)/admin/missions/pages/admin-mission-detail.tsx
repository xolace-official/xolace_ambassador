"use client";

import { useQuery } from "convex/react";
import { CalendarDays, Clock3, Sparkles, UserRound } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MISSION_CATEGORY_LABELS } from "@/types/missions.type";
import { api } from "../../../../../../convex/_generated/api";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const statusStyle = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success text-success-foreground",
  closed: "border-border bg-muted text-muted-foreground",
} as const;

const responseTypeLabel = {
  short_text: "Short answer",
  long_text: "Long answer",
  url: "Link",
  number: "Number",
} as const;

export default function AdminMissionDetail({
  missionId,
}: {
  missionId: string;
}) {
  const mission = useQuery(api.missions.adminGet, { missionId });

  if (mission === undefined) {
    return (
      <output className="block space-y-5" aria-label="Loading mission details">
        <div
          aria-hidden="true"
          className="h-52 animate-pulse rounded-xl border border-border bg-card"
        />
        <div
          aria-hidden="true"
          className="h-72 animate-pulse rounded-xl border border-border bg-card"
        />
      </output>
    );
  }

  if (mission === null) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Mission not found"
        description="This task may have been removed, or the link may be incorrect."
      />
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-label="Mission information" className="min-w-0 space-y-6">
          <header className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {MISSION_CATEGORY_LABELS[mission.track]}
              </Badge>
              <Badge className={statusStyle[mission.status]}>
                {mission.status[0].toUpperCase() + mission.status.slice(1)}
              </Badge>
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                {mission.title}
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                {mission.summary}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 capitalize">
                <Clock3 aria-hidden="true" className="size-4" />
                {mission.difficulty}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="size-4" />
                Due {dateFormat.format(new Date(mission.endsAt))}
              </span>
            </div>
          </header>

          <Card className="gap-0 border-border p-5 sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Mission brief
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  What ambassadors are asked to do and share.
                </p>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">
              {mission.description}
            </div>
            {mission.submissionFields?.length ? (
              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Requested responses
                </h3>
                <ul className="mt-3 space-y-2">
                  {mission.submissionFields.map((field) => (
                    <li
                      key={field.key}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span className="font-medium text-foreground">
                        {field.label}
                        {field.required ? "" : " (optional)"}
                      </span>
                      <span className="text-muted-foreground">
                        {responseTypeLabel[field.type]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4">
          <Card className="gap-0 border-border p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Contribution value
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
                {mission.points}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                impact points
              </span>
            </div>
            <div className="my-5 h-px bg-border" />
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarDays aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Deadline</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dateFormat.format(new Date(mission.endsAt))}
                </p>
              </div>
            </div>
          </Card>

          <Card className="gap-4 border-border bg-muted/30 p-5">
            <p className="text-sm font-semibold text-foreground">
              Mission record
            </p>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground">
                <UserRound aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Created by {mission.createdByName}
                </p>
                <time
                  className="mt-1 block text-sm text-muted-foreground"
                  dateTime={new Date(mission._creationTime).toISOString()}
                >
                  {dateTimeFormat.format(new Date(mission._creationTime))}
                </time>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
