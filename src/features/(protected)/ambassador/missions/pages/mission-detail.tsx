"use client";

import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";
import { MissionContributionSidebar } from "../components/mission-contribution-sidebar";
import { MissionDescription } from "../components/mission-description";
import { MissionStatus } from "../components/mission-status";
import { MissionTrackBadge } from "../components/mission-track-badge";
import { toMission } from "../mission-mapper";

const sentFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const deadlineFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DAY = 24 * 60 * 60 * 1000;

function remainingLabel(endsAt: number, now: number): string {
  const days = Math.round((endsAt - now) / DAY);

  if (Math.abs(days) < 1) {
    return "Closing today";
  }

  return days > 0 && days < 14
    ? `${days} days left`
    : `${Math.round(days / 7)} weeks left`;
}

export function MissionDetail({
  missionId,
  uuid,
}: {
  missionId: string;
  uuid: string;
}) {
  // Frozen at mount — a live clock would change the query key every render.
  const [now] = useState(() => Date.now());

  const row = useQuery(api.missions.get, { missionId, now });
  const backHref = `/ambassador/${uuid}/missions`;

  if (row === undefined) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
        <div
          aria-hidden
          className="h-9 w-2/3 animate-pulse rounded-md bg-muted"
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <div
              aria-hidden
              className="h-64 animate-pulse rounded-xl border border-border bg-card"
            />
            <div
              aria-hidden
              className="h-64 animate-pulse rounded-xl border border-border bg-card"
            />
          </div>
          <div
            aria-hidden
            className="h-80 animate-pulse rounded-xl border border-border bg-card"
          />
        </div>
      </div>
    );
  }

  if (row === null) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <EmptyState
          icon={Target}
          title="Mission not found"
          description="This mission may have closed, or the link may be wrong."
        />
        <Link
          href={backHref}
          className="mx-auto mt-5 flex min-h-11 w-fit items-center gap-2 rounded-md px-3 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to missions
        </Link>
      </div>
    );
  }

  const mission = toMission(row);
  const submission = row.submission;

  // Rejected missions accept revised submissions, so keep them in the submit path.
  const canSubmit =
    mission.status === "available" ||
    mission.status === "in_progress" ||
    mission.status === "rejected";
  const isExpired = row.openState === "expired";
  const remaining = isExpired ? "Closed" : remainingLabel(mission.endsAt, now);

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-label="Mission information" className="min-w-0 space-y-6">
          <header className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <MissionTrackBadge track={mission.category} />
              <MissionStatus status={mission.status} />
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
                Due {deadlineFormat.format(new Date(mission.endsAt))}
              </span>
              <span className="font-medium text-foreground">{remaining}</span>
            </div>
          </header>

          <Card className="gap-0 border-border p-5 sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  The mission brief
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  What to do and how to share your contribution.
                </p>
              </div>
            </div>
            <MissionDescription text={mission.description} />
          </Card>

          <Card className="gap-0 border-border bg-muted/40 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div className="space-y-2">
                <h2 className="font-semibold text-foreground">
                  Keep conversations safe
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Don’t diagnose, counsel, or promise confidentiality beyond
                  Xolace’s systems. Ask permission before sharing someone’s
                  story. If a conversation becomes serious, follow the safety
                  guide and connect them with professional support.
                </p>
                <Link
                  href={`/ambassador/${uuid}/resources`}
                  className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Read the safety resources
                </Link>
              </div>
            </div>
          </Card>

          {submission ? (
            <section aria-labelledby="submission-heading">
              <h2
                id="submission-heading"
                className="text-sm font-semibold tracking-wide uppercase"
              >
                Your submission
              </h2>

              <Card className="mt-3 gap-0 border-border py-0">
                <div className="px-5 py-4">
                  {submission.note ? (
                    <p className="text-sm leading-6 whitespace-pre-line text-foreground/80">
                      {submission.note}
                    </p>
                  ) : null}

                  {submission.responses?.length ? (
                    <dl className="divide-y divide-border">
                      {submission.responses.map((response) => (
                        <div
                          key={response.fieldKey}
                          className="py-3 first:pt-0"
                        >
                          <dt className="text-sm font-medium text-foreground">
                            {response.label}
                          </dt>
                          <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                            {response.value || "No response provided."}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

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
                  <time
                    dateTime={new Date(submission._creationTime).toISOString()}
                  >
                    {sentFormat.format(new Date(submission._creationTime))}
                  </time>
                </p>
              </Card>
            </section>
          ) : null}
        </section>

        <MissionContributionSidebar
          mission={mission}
          missionId={row._id}
          submissionFields={row.submissionFields}
          canSubmit={canSubmit}
          remaining={remaining}
          reviewNote={submission?.reviewNote}
        />
      </div>
    </div>
  );
}
