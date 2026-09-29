import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const numberFormat = new Intl.NumberFormat("en-GB");

interface DemographicItem {
  location: string;
  count: number;
}

interface AnalyticsDemographicsProps {
  data: DemographicItem[];
}

export function AnalyticsDemographics({ data }: AnalyticsDemographicsProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="border-border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Ambassador Locations
        </h3>
        <Select defaultValue="monthly">
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Last Week</SelectItem>
            <SelectItem value="monthly">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-6">
        <div className="min-w-0 w-1/3 space-y-2.5">
          {data.map((item) => (
            <div key={item.location} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {item.location}
              </span>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {numberFormat.format(item.count)}
              </span>
              <span className="w-12 text-right text-xs text-muted-foreground">
                {total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
        </div>
        <div className="relative hidden h-56 w-2/3 shrink-0 overflow-hidden rounded-lg bg-muted/30 sm:block">
          <svg
            viewBox="0 0 200 100"
            className="h-full w-full opacity-30"
            aria-hidden="true"
          >
            <path
              d="M20 30 Q40 20 60 35 T100 30 Q120 25 140 35 T180 30"
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="0.5"
            />
            <path
              d="M30 60 Q50 50 70 65 T110 60 Q130 55 150 65 T190 60"
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="0.5"
            />
          </svg>
          {data.map((item, i) => {
            const x = 15 + (i * 35) % 170;
            const y = 20 + (i * 25) % 60;
            const size = 12 + (item.count / maxCount) * 24;
            return (
              <div
                key={item.location}
                className="absolute rounded-full bg-primary"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: 0.4 + (item.count / maxCount) * 0.6,
                }}
                title={`${item.location}: ${item.count}`}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
