import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
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

export function MissionCard({
  mission,
  href,
}: {
  mission: Mission;
  href: string;
}) {
  return (
    <Card className="group relative h-full gap-0 overflow-hidden border-border py-0 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-within:border-primary/50">
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <MissionTrackBadge track={mission.category} />
        <MissionStatus status={mission.status} />
      </div>

      <div className="px-5 pt-4">
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-card-foreground">
          <Link
            href={href}
            className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {mission.title}
          </Link>
        </h2>
        <MissionDescription text={mission.summary} lines={2} className="pt-2" />
      </div>

      <div className="mt-2 flex flex-row justify-between border-t border-border px-5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0 text-sm">
            <span className="block font-semibold tabular-nums text-foreground">
              {mission.points} pts
            </span>
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-4" />
          </span>
          <span className="min-w-0 text-sm">
            <span className="text-xs text-muted-foreground">
              Due {deadlineFormat.format(new Date(mission.endsAt))}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5 capitalize">
          <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
          {mission.difficulty} mission
        </span>
        <span
          aria-disabled={mission.status === "expired"}
          className={`shrink-0 font-medium transition-colors ${
            mission.status === "expired"
              ? "text-muted-foreground"
              : "text-foreground group-hover:text-primary"
          }`}
        >
          View brief{" "}
          <ArrowUpRight aria-hidden="true" className="ml-1 inline size-3.5" />
        </span>
      </div>
    </Card>
  );
}
