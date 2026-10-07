import { Award, Crown, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface RewardsStatsGridProps {
  points: number;
  levelRank: number;
  availablePoints: number;
  contributionsApproved: number;
}

export function RewardsStatsGrid({
  points,
  levelRank,
  availablePoints,
  contributionsApproved,
}: RewardsStatsGridProps) {
  const stats = [
    {
      label: "Points earned",
      value: points,
      icon: Award,
      color: "text-primary",
    },
    {
      label: "Current level",
      value: `Level ${levelRank}`,
      icon: Crown,
      color: "text-warning",
    },
    {
      label: "Contributions approved",
      value: contributionsApproved,
      icon: Target,
      color: "text-success",
    },
    {
      label: "Points available",
      value: availablePoints,
      icon: Award,
      color: "text-accent",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon
                aria-hidden="true"
                className={`size-5 ${stat.color}`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {typeof stat.value === "number"
                  ? numberFormat.format(stat.value)
                  : stat.value}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
