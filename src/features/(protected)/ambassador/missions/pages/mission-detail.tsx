"use client";

import { useQuery } from "convex/react";
import { CalendarDays, Target, Timer } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";
import { MissionDescription } from "../components/mission-description";
import { MissionStatus } from "../components/mission-status";
import { MissionSubmitDialog } from "../components/mission-submit-dialog";
import { MissionTrackBadge } from "../components/mission-track-badge";
import { toMission } from "../mission-mapper";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const sentFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const DAY = 24 * 60 * 60 * 1000;

function remainingLabel(endsAt: number, now: number): string {
  const days = Math.round((endsAt - now) / DAY);

  if (Math.abs(days) < 1) {
    return "closes today";
  }

  return days > 0 && days < 14
    ? `${days} days left`
    : `${Math.round(days / 7)} weeks left`;
}

export function MissionDetail({ missionId }: { missionId: string }) {
  // Frozen at mount — a live clock would change the query key every render.
  const [now] = useState(() => Date.now());

  const row = useQuery(api.missions.get, { missionId, now });

  if (row === undefined) {
    return (
      <div className="w-full lg:max-w-3xl">
        <div
          aria-hidden
          className="h-9 w-2/3 animate-pulse rounded-md bg-muted"
        />
        <div
          aria-hidden
          className="mt-4 h-5 w-1/2 animate-pulse rounded-md bg-muted"
        />
        <div
          aria-hidden
          className="mt-8 h-64 animate-pulse rounded-xl border border-border bg-card"
        />
      </div>
    );
  }

  if (row === null) {
    return (
      <div className="w-full lg:max-w-3xl">
        <EmptyState
          icon={Target}
          title="Mission not found"
          description="This mission may have closed, or the link may be wrong."
        />
      </div>
    );
  }

  const mission = toMission(row);
  const submission = row.submission;

  // Open states. `rejected` is included because the backend accepts a revised
  // submission after one is turned down — without it that path is unreachable.
  const canSubmit =
    mission.status === "available" ||
    mission.status === "in_progress" ||
    mission.status === "rejected";

  const isExpired = row.openState === "expired";

  return (
    <div className="w-full lg:max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <MissionTrackBadge track={mission.category} />
            <MissionStatus status={mission.status} />
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
            {mission.title}
          </h2>
        </div>

        {canSubmit ? (
          <MissionSubmitDialog
            missionId={row._id}
            label={
              mission.status === "rejected"
                ? "Resubmit for review"
                : "Submit for review"
            }
          />
        ) : submission ? null : (
          <Button variant="outline" disabled className="shrink-0">
            Closed
          </Button>
        )}
      </div>

      <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-foreground/70">
        <div className="font-semibold tabular-nums text-foreground">
          <dt className="sr-only">Points</dt>
          <dd>
            {mission.points}
            <span className="ml-1 font-normal text-foreground/60">pts</span>
          </dd>
        </div>

        <div>
          <dt className="sr-only">Difficulty</dt>
          <dd className="capitalize">{mission.difficulty}</dd>
        </div>

        <div className="flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-4" />
          <dt className="sr-only">Closing date</dt>
          <dd>
            Closes{" "}
            <time dateTime={new Date(mission.endsAt).toISOString()}>
              {dateFormat.format(new Date(mission.endsAt))}
            </time>
          </dd>
        </div>

        <div className="flex items-center gap-1.5">
          <Timer aria-hidden="true" className="size-4" />
          <dt className="sr-only">Time remaining</dt>
          <dd>{isExpired ? "Closed" : remainingLabel(mission.endsAt, now)}</dd>
        </div>
      </dl>

      <Card className="mt-7 gap-0 border-border py-0">
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <MissionDescription text={mission.description} />
        </div>
      </Card>

      {submission ? (
        <section aria-labelledby="submission-heading" className="mt-8">
          <h3
            id="submission-heading"
            className="text-sm font-semibold tracking-wide uppercase"
          >
            Your submission
          </h3>

          <Card className="mt-3 gap-0 border-border py-0">
            <div className="px-5 py-4">
              <p className="text-sm leading-6 whitespace-pre-line text-foreground/80">
                {submission.note}
              </p>

              {submission.link ? (
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block max-w-full break-words text-sm font-medium text-primary underline underline-offset-4"
                >
                  {submission.link}
                </a>
              ) : null}

              {submission.quantity !== undefined ? (
                <p className="mt-3 text-sm text-foreground/70">
                  {submission.quantity} people took part
                </p>
              ) : null}
            </div>

            <p className="border-t border-border px-5 py-3 text-xs text-foreground/55">
              Sent{" "}
              <time dateTime={new Date(submission._creationTime).toISOString()}>
                {sentFormat.format(new Date(submission._creationTime))}
              </time>
            </p>
          </Card>
        </section>
      ) : null}

      <p className="mt-10 border-t border-border pt-6 text-xs leading-5 text-foreground/55">
        Ambassadors do not diagnose, counsel, or act as therapists. If a
        conversation goes somewhere serious, follow the escalation protocol in
        the safety guide rather than handling it yourself.
      </p>
    </div>
  );
}
