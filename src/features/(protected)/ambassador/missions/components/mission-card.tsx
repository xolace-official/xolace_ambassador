import { ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import type { Mission } from "@/types/missions.type";
import { MissionDescription } from "./mission-description";
import { MissionStatus } from "./mission-status";
import { MissionTrackBadge } from "./mission-track-badge";

const deadlineFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

interface MissionCardProps {
  mission: Mission;
  href: string;
}

export function MissionCard({ mission, href }: MissionCardProps) {
  return (
    <Card className="group relative h-full cursor-pointer gap-0 border-border py-0 transition-colors hover:border-primary/50 focus-within:border-primary/50">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <MissionTrackBadge track={mission.category} />

          {mission.status !== "available" && (
            <MissionStatus status={mission.status} />
          )}
        </div>

        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {mission.points}
          <span className="ml-1 font-normal text-foreground/60">pts</span>
        </p>
      </div>

      <h2 className="px-5 pt-4 text-base font-semibold tracking-tight text-balance text-card-foreground">
        {/* Stretched link: one tab stop per card, accessible name is the title
            only, and the whole surface is clickable. */}
        <Link
          href={href}
          className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {mission.title}
        </Link>
      </h2>

      {/* `summary` is the short card line; the full `description` lives on the
          detail page. The clamp is a safety net for a badly written summary,
          not the mechanism that keeps cards even. */}
      <MissionDescription
        text={mission.summary}
        lines={2}
        className="px-5 pt-2 pb-5"
      />

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-foreground/55">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2">
          <span className="capitalize">{mission.difficulty}</span>

          <span aria-hidden="true">·</span>

          <span className="inline-flex items-center gap-1">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            Ends{" "}
            <time dateTime={new Date(mission.endsAt).toISOString()}>
              {deadlineFormat.format(new Date(mission.endsAt))}
            </time>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1 font-medium text-foreground">
          View
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Card>
  );
}
