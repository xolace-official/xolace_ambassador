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
      label: "Total Ambassadors",
      value: numberFormat.format(totalAmbassadors),
      subtitle: "Total ambassadors last 365 days",
      sparkColor: "var(--primary)",
    },
    {
      label: "Total Points",
      value: numberFormat.format(totalPoints),
      subtitle: "Total points last 365 days",
      sparkColor: "var(--success)",
    },
    {
      label: "Total Contributions",
      value: numberFormat.format(totalContributions),
      subtitle: "Total contributions last 365 days",
      sparkColor: "var(--accent)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-border p-4">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
            {card.value}
          </p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-[10px] text-muted-foreground">
              {card.subtitle}
            </p>
            <svg
              aria-hidden="true"
              className="h-6 w-14"
              viewBox="0 0 64 32"
              fill="none"
            >
              <path
                d="M0 28 L8 24 L16 26 L24 18 L32 20 L40 12 L48 14 L56 6 L64 8"
                stroke={card.sparkColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>
      ))}
    </div>
  );
}
