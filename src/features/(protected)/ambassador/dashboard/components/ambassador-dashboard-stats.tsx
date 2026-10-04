import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

function StatCell({
  label,
  value,
  secondary,
  secondaryLabel,
  delta,
}: {
  label: string;
  value: number;
  secondary?: number;
  secondaryLabel?: string;
  delta?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-5 sm:px-5 sm:py-6">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
          {numberFormat.format(value)}
        </span>
        {secondary !== undefined && (
          <span className="text-sm font-medium tabular-nums text-primary">
            {numberFormat.format(secondary)}
          </span>
        )}
        {secondaryLabel && (
          <span className="text-xs text-muted-foreground">
            {secondaryLabel}
          </span>
        )}
      </div>
      {delta && (
        <p className="flex items-center gap-1 text-xs text-success">
          <TrendingUp aria-hidden="true" className="size-3" />
          {delta}
        </p>
      )}
    </div>
  );
}

export function AmbassadorDashboardStats({
  points,
  missions,
  peopleReached,
  recognitions,
}: {
  points: number;
  missions: number;
  peopleReached: number;
  recognitions: number;
}) {
  const dailyAvg = Math.round(points / Math.max(1, 30));

  return (
    <section aria-label="Your progress">
      <Card className="overflow-hidden rounded-2xl border-border/60 py-0 shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
            <StatCell
              label="Points / day"
              value={dailyAvg}
              secondary={points}
              secondaryLabel="total"
              delta="+4.2%"
            />
            <StatCell label="Missions" value={missions} delta="+4.2%" />
            <StatCell
              label="People reached"
              value={peopleReached}
              delta="+4.2%"
            />
            <StatCell label="Recognitions" value={recognitions} delta="+4.2%" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
