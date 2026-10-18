import { Award, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface ReportsSummaryCardsProps {
  totalAmbassadors: number;
  totalPoints: number;
  totalContributions: number;
}

export function ReportsSummaryCards({
  totalAmbassadors,
  totalPoints,
  totalContributions,
}: ReportsSummaryCardsProps) {
  const cards = [
    {
      id: "ambassadors",
      label: "Total Ambassadors",
      value: numberFormat.format(totalAmbassadors),
      subtitle: "Active community members",
      trend: "+8.4%",
      icon: Users,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      gradientId: "gradient-ambassadors",
      pathD:
        "M 0 30 C 15 25, 25 12, 45 20 C 65 28, 80 10, 100 16 C 115 22, 130 6, 140 4",
      fillD:
        "M 0 30 C 15 25, 25 12, 45 20 C 65 28, 80 10, 100 16 C 115 22, 130 6, 140 4 L 140 36 L 0 36 Z",
      strokeColor: "var(--primary)",
    },
    {
      id: "points",
      label: "Total Points",
      value: numberFormat.format(totalPoints),
      subtitle: "Awarded program rewards",
      trend: "+14.2%",
      icon: Award,
      colorClass: "text-success",
      bgClass: "bg-success/10",
      gradientId: "gradient-points",
      pathD:
        "M 0 32 C 20 28, 35 15, 55 18 C 75 21, 90 8, 110 12 C 125 16, 135 4, 140 2",
      fillD:
        "M 0 32 C 20 28, 35 15, 55 18 C 75 21, 90 8, 110 12 C 125 16, 135 4, 140 2 L 140 36 L 0 36 Z",
      strokeColor: "var(--success)",
    },
    {
      id: "contributions",
      label: "Total Contributions",
      value: numberFormat.format(totalContributions),
      subtitle: "Verified community outcomes",
      trend: "+5.1%",
      icon: CheckCircle2,
      colorClass: "text-accent",
      bgClass: "bg-accent/10",
      gradientId: "gradient-contributions",
      pathD:
        "M 0 28 C 18 24, 30 16, 50 22 C 70 28, 85 12, 105 14 C 120 16, 132 8, 140 6",
      fillD:
        "M 0 28 C 18 24, 30 16, 50 22 C 70 28, 85 12, 105 14 C 120 16, 132 8, 140 6 L 140 36 L 0 36 Z",
      strokeColor: "var(--accent)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 print:hidden">
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
              <div className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <TrendingUp aria-hidden="true" className="size-3" />
                {card.trend}
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                  {card.value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>

              <div className="h-9 w-28 shrink-0">
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
                        stopOpacity="0.3"
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
                    cy="4"
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
  );
}
