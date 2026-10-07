import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const numberFormat = new Intl.NumberFormat("en-GB");

interface StatItem {
  label: string;
  value: number;
  description?: string;
  icon: LucideIcon;
}

export function ImpactStatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                {numberFormat.format(stat.value)}
              </p>
              {stat.description ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {stat.description}
                </p>
              ) : null}
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <stat.icon aria-hidden="true" className="size-5 text-primary" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
