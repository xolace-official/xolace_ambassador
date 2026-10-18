import { Award, Crown, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface RewardsStatsGridProps {
  points: number;
  levelRank: number;
  availablePoints: number;
  contributionsApproved: number;
}

const sparkData = [
  {
    gradientId: "rew-grad-1",
    strokeColor: "var(--primary)",
    pathD:
      "M 0 28 C 15 22, 25 10, 45 16 C 65 22, 80 8, 100 12 C 115 16, 130 4, 140 2",
    fillD:
      "M 0 28 C 15 22, 25 10, 45 16 C 65 22, 80 8, 100 12 C 115 16, 130 4, 140 2 L 140 36 L 0 36 Z",
    trend: "+12.4%",
  },
  {
    gradientId: "rew-grad-2",
    strokeColor: "var(--warning)",
    pathD:
      "M 0 30 C 20 25, 35 12, 55 18 C 75 24, 90 6, 110 10 C 125 14, 135 4, 140 2",
    fillD:
      "M 0 30 C 20 25, 35 12, 55 18 C 75 24, 90 6, 110 10 C 125 14, 135 4, 140 2 L 140 36 L 0 36 Z",
    trend: "Tier Active",
  },
  {
    gradientId: "rew-grad-3",
    strokeColor: "var(--success)",
    pathD:
      "M 0 26 C 18 20, 30 14, 50 18 C 70 22, 85 10, 105 12 C 120 14, 132 6, 140 4",
    fillD:
      "M 0 26 C 18 20, 30 14, 50 18 C 70 22, 85 10, 105 12 C 120 14, 132 6, 140 4 L 140 36 L 0 36 Z",
    trend: "+100%",
  },
  {
    gradientId: "rew-grad-4",
    strokeColor: "var(--accent)",
    pathD:
      "M 0 32 C 15 28, 25 14, 45 18 C 65 22, 80 12, 100 14 C 115 16, 130 6, 140 2",
    fillD:
      "M 0 32 C 15 28, 25 14, 45 18 C 65 22, 80 12, 100 14 C 115 16, 130 6, 140 2 L 140 36 L 0 36 Z",
    trend: "Ready to claim",
  },
];

export function RewardsStatsGrid({
  points,
  levelRank,
  availablePoints,
  contributionsApproved,
}: RewardsStatsGridProps) {
  const stats = [
    {
      id: "earned",
      label: "Points earned",
      value: numberFormat.format(points),
      subtitle: "Lifetime reward points",
      icon: Award,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      config: sparkData[0],
    },
    {
      id: "level",
      label: "Current level",
      value: `Level ${levelRank}`,
      subtitle: "Ambassador milestone",
      icon: Crown,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      config: sparkData[1],
    },
    {
      id: "contributions",
      label: "Approved outcome",
      value: numberFormat.format(contributionsApproved),
      subtitle: "Verified submissions",
      icon: Target,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      config: sparkData[2],
    },
    {
      id: "available",
      label: "Points available",
      value: numberFormat.format(availablePoints),
      subtitle: "Redeemable balance",
      icon: Award,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
      config: sparkData[3],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        const config = stat.config;
        return (
          <Card
            key={stat.id}
            className="group relative overflow-hidden border-border/60 bg-card/60 p-5 backdrop-blur-xs transition-all hover:border-border hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex size-9 items-center justify-center rounded-lg ${stat.bgClass}`}
                >
                  <IconComponent
                    aria-hidden="true"
                    className={`size-4.5 ${stat.colorClass}`}
                  />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <TrendingUp aria-hidden="true" className="size-3" />
                {config.trend}
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {stat.subtitle}
                </p>
              </div>

              <div className="h-9 w-24 shrink-0">
                <svg
                  aria-hidden="true"
                  className="h-full w-full overflow-visible"
                  viewBox="0 0 140 36"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id={config.gradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={config.strokeColor}
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor={config.strokeColor}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  <path d={config.fillD} fill={`url(#${config.gradientId})`} />
                  <path
                    d={config.pathD}
                    stroke={config.strokeColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="140"
                    cy="2"
                    r="3"
                    fill={config.strokeColor}
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
