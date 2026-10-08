import { Award, CheckCircle2, Sparkles, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface StatCardConfig {
  id: string;
  label: string;
  value: number;
  subtitle: string;
  icon: typeof Award;
  colorClass: string;
  bgClass: string;
  gradientId: string;
  strokeColor: string;
  pathD: string;
  fillD: string;
  trend?: string;
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
  const pointTrendStr =
    pointChange > 0
      ? `+${numberFormat.format(pointChange)} this week`
      : pointChange < 0
        ? `${numberFormat.format(pointChange)} this week`
        : "Active";

  const cards: StatCardConfig[] = [
    {
      id: "points",
      label: "Points Earned",
      value: points,
      subtitle: "Lifetime program rewards",
      icon: Award,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      gradientId: "amb-grad-points",
      strokeColor: "var(--primary)",
      pathD:
        "M 0 28 C 15 22, 25 10, 45 16 C 65 22, 80 8, 100 12 C 115 16, 130 4, 140 2",
      fillD:
        "M 0 28 C 15 22, 25 10, 45 16 C 65 22, 80 8, 100 12 C 115 16, 130 4, 140 2 L 140 36 L 0 36 Z",
      trend: pointTrendStr,
    },
    {
      id: "missions",
      label: "Missions Completed",
      value: missions,
      subtitle: "Verified ambassador tasks",
      icon: CheckCircle2,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      gradientId: "amb-grad-missions",
      strokeColor: "var(--success)",
      pathD:
        "M 0 30 C 20 25, 35 12, 55 18 C 75 24, 90 6, 110 10 C 125 14, 135 4, 140 2",
      fillD:
        "M 0 30 C 20 25, 35 12, 55 18 C 75 24, 90 6, 110 10 C 125 14, 135 4, 140 2 L 140 36 L 0 36 Z",
      trend: "+12%",
    },
    {
      id: "people",
      label: "People Reached",
      value: peopleReached,
      subtitle: "Direct community impact",
      icon: Users,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
      gradientId: "amb-grad-people",
      strokeColor: "var(--accent)",
      pathD:
        "M 0 26 C 18 20, 30 14, 50 18 C 70 22, 85 10, 105 12 C 120 14, 132 6, 140 4",
      fillD:
        "M 0 26 C 18 20, 30 14, 50 18 C 70 22, 85 10, 105 12 C 120 14, 132 6, 140 4 L 140 36 L 0 36 Z",
      trend: "+18.4%",
    },
    {
      id: "recognitions",
      label: "Recognitions",
      value: recognitions,
      subtitle: "Kudos & awards received",
      icon: Sparkles,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
      gradientId: "amb-grad-recog",
      strokeColor: "var(--warning)",
      pathD:
        "M 0 32 C 15 28, 25 14, 45 18 C 65 22, 80 12, 100 14 C 115 16, 130 6, 140 2",
      fillD:
        "M 0 32 C 15 28, 25 14, 45 18 C 65 22, 80 12, 100 14 C 115 16, 130 6, 140 2 L 140 36 L 0 36 Z",
      trend: "Top 5%",
    },
  ];

  return (
    <section aria-label="Your progress">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={card.id}
              className="group relative overflow-hidden border-border/60 bg-card/60 p-5 backdrop-blur-xs transition-all hover:border-border hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${card.bgClass}`}
                  >
                    <IconComponent
                      aria-hidden="true"
                      className={`size-4.5 ${card.colorClass}`}
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </span>
                </div>
                {card.trend && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    <TrendingUp aria-hidden="true" className="size-3" />
                    {card.trend}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                    {numberFormat.format(card.value)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {card.subtitle}
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
                        id={card.gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={card.strokeColor}
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor={card.strokeColor}
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    <path d={card.fillD} fill={`url(#${card.gradientId})`} />
                    <path
                      d={card.pathD}
                      stroke={card.strokeColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="140"
                      cy="2"
                      r="3"
                      fill={card.strokeColor}
                      className="animate-pulse"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
