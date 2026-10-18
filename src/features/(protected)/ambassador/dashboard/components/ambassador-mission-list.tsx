import type { FunctionReturnType } from "convex/server";
import { ArrowUpRight, CalendarDays, Target } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "../../../../../../convex/_generated/api";

type Mission = FunctionReturnType<typeof api.missions.list>[number];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function AmbassadorMissionList({
  missions,
  uuid,
}: {
  missions: Mission[];
  uuid: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">
              Available missions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose one action that fits your time and strengths.
            </p>
          </div>
          <Target aria-hidden="true" className="size-5 text-muted-foreground" />
        </div>
        <div className="mt-5 space-y-3">
          {missions.length ? (
            missions.slice(0, 3).map((mission) => (
              <Link
                key={mission._id}
                href={`/ambassador/${uuid}/missions/${mission._id}`}
                className="group block rounded-xl border border-border p-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                    {mission.title}
                  </p>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {mission.summary}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{mission.points} points</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {dateFormatter.format(mission.endsAt)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              New missions will appear here when they are published.
            </div>
          )}
        </div>
        <Link
          href={`/ambassador/${uuid}/missions`}
          className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all missions
        </Link>
      </CardContent>
    </Card>
  );
}
