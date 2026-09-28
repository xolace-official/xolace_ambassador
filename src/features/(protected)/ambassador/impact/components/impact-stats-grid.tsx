import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function ImpactStatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon aria-hidden="true" className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {numberFormat.format(stat.value)}
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
