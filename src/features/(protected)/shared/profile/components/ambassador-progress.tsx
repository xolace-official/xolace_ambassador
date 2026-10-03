import type { useQuery } from "convex/react";
import { Award, Sparkles, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { api } from "../../../../../../convex/_generated/api";
import { ProfileActivityCard } from "./profile-activity-card";
import { ProfileRecognitionCard } from "./profile-recognition-card";

const numberFormatter = new Intl.NumberFormat("en-GB");

export function AmbassadorProgress({
  profile,
}: {
  profile: NonNullable<
    ReturnType<typeof useQuery<typeof api.ambassadors.getProfile>>
  >;
}) {
  const totals = profile.totals;
  if (!totals) return null;

  const current = profile.currentLevel;
  const next = profile.nextLevel;
  const progress =
    next && current
      ? ((totals.points - current.minPoints) /
          (next.minPoints - current.minPoints)) *
        100
      : 100;
  const stats = [
    { label: "Points", value: totals.points, icon: Sparkles },
    {
      label: "Missions completed",
      value: totals.missionsCompleted,
      icon: Target,
    },
    { label: "People reached", value: totals.peopleReached, icon: Users },
    { label: "Recognitions", value: profile.recognitions.length, icon: Award },
  ];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border p-3 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
                <stat.icon
                  aria-hidden="true"
                  className="size-4 text-primary sm:size-5"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  {numberFormatter.format(stat.value)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {current ? (
        <Card className="border-border p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current level
              </p>
              <p className="text-xl font-bold text-foreground">
                {current.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {current.description}
              </p>
            </div>
            <Badge variant="secondary">
              {next
                ? `${numberFormatter.format(next.minPoints - totals.points)} points to go`
                : "Max level"}
            </Badge>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>{numberFormatter.format(totals.points)} points</span>
              <span>
                {next ? numberFormatter.format(next.minPoints) : "Max"}
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileActivityCard contributions={profile.contributions} />
        <ProfileRecognitionCard recognitions={profile.recognitions} />
      </div>
    </section>
  );
}
