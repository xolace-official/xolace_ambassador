import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

function StatCell({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: { value: number; direction: "up" | "down" | "flat" };
}) {
  const TrendIcon =
    note?.direction === "up"
      ? ArrowUp
      : note?.direction === "down"
        ? ArrowDown
        : Minus;

  return (
    <div className="flex min-w-0 flex-col gap-1 px-3 py-4 sm:px-5 sm:py-6">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums text-foreground sm:text-2xl">
          {numberFormat.format(value)}
        </span>
      </div>
      {note ? (
        <p
          className={`flex items-center gap-1 text-xs ${
            note.direction === "down"
              ? "text-destructive"
              : note.direction === "up"
                ? "text-success"
                : "text-muted-foreground"
          }`}
        >
          <TrendIcon aria-hidden="true" className="size-3" />
          {note.direction === "flat"
            ? "No change this week"
            : `${numberFormat.format(note.value)} this week`}
        </p>
      ) : null}
    </div>
  );
}

export function AmbassadorDashboardStats({
  points,
  missions,
  peopleReached,
  recognitions,
  weeklyPoints,
}: {
  points: number;
  missions: number;
  peopleReached: number;
  recognitions: number;
  weeklyPoints: { current: number; previous: number };
}) {
  const pointChange = weeklyPoints.current - weeklyPoints.previous;
  const pointDirection =
    pointChange > 0 ? "up" : pointChange < 0 ? "down" : "flat";

  return (
    <section aria-label="Your progress">
      <Card className="overflow-hidden rounded-2xl border-border/60 py-0 shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
            <StatCell
              label="Points earned"
              value={points}
              note={{
                value: Math.abs(pointChange),
                direction: pointDirection,
              }}
            />
            <StatCell label="Missions completed" value={missions} />
            <StatCell label="People reached" value={peopleReached} />
            <StatCell label="Recognitions" value={recognitions} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
