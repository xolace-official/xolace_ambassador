import { Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const numberFormat = new Intl.NumberFormat("en-GB");

const mapDots = [
  [18, 28],
  [22, 24],
  [26, 27],
  [30, 22],
  [34, 26],
  [38, 22],
  [42, 25],
  [46, 20],
  [50, 24],
  [54, 22],
  [58, 27],
  [62, 24],
  [66, 29],
  [70, 25],
  [74, 30],
  [78, 27],
  [82, 32],
  [86, 29],
  [21, 38],
  [26, 35],
  [31, 39],
  [36, 35],
  [41, 40],
  [46, 36],
  [51, 41],
  [56, 37],
  [61, 42],
  [66, 38],
  [71, 43],
  [76, 39],
  [81, 44],
  [86, 41],
  [25, 50],
  [30, 46],
  [35, 52],
  [40, 48],
  [45, 53],
  [50, 49],
  [55, 54],
  [60, 50],
  [65, 55],
  [70, 51],
  [75, 56],
  [80, 52],
  [85, 57],
  [31, 62],
  [36, 59],
  [41, 64],
  [46, 61],
  [51, 66],
  [56, 62],
  [61, 67],
  [66, 63],
  [71, 68],
  [76, 64],
  [81, 69],
  [40, 76],
  [45, 72],
  [50, 78],
  [55, 74],
  [60, 79],
  [65, 75],
  [70, 80],
] as const;

const locationAnchors = [
  [24, 35],
  [42, 28],
  [58, 45],
  [73, 35],
  [50, 67],
] as const;

interface DemographicItem {
  location: string;
  count: number;
}

interface AnalyticsDemographicsProps {
  data: DemographicItem[];
}

export function AnalyticsDemographics({ data }: AnalyticsDemographicsProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="w-full rounded-2xl border-border py-0 shadow-none">
      <div className="p-3 sm:p-4">
        <div className="w-full mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Globe2
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            Ambassador locations
          </h3>
          <Select defaultValue="monthly">
            <SelectTrigger className="h-11 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Last Week</SelectItem>
              <SelectItem value="monthly">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(13rem,0.8fr)_minmax(0,2fr)]">
          <div className="min-w-0 space-y-1.5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 border-b border-border pb-1.5 text-[11px] text-muted-foreground">
              <span>Country</span>
              <span>Ambassadors</span>
              <span>%</span>
            </div>
            {data.map((item) => (
              <div
                key={item.location}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 py-0.5"
              >
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
          <div className="relative h-44 min-w-0 w-full overflow-hidden rounded-lg border border-border bg-muted/20 p-0 sm:h-48">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full"
              role="img"
              aria-label="Ambassador locations across the world"
            >
              {mapDots.map(([cx, cy], i) => (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="1.1"
                  fill="var(--muted-foreground)"
                  opacity={0.28 + (i % 4) * 0.08}
                />
              ))}
              {data.map((item, i) => {
                const [anchorX, anchorY] =
                  locationAnchors[i % locationAnchors.length];
                return (
                  <g key={item.location}>
                    <title>{`${item.location}: ${item.count} ambassadors`}</title>
                    {Array.from({ length: item.count }, (_, dotIndex) => {
                      const column = dotIndex % 7;
                      const row = Math.floor(dotIndex / 7);
                      const cx = anchorX + (column - 3) * 2.2;
                      const cy = anchorY + (row - 1) * 2.2;
                      return (
                        <circle
                          key={`${item.location}-${dotIndex}`}
                          cx={cx}
                          cy={cy}
                          r="1.1"
                          fill="var(--primary)"
                          opacity="0.9"
                        />
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}
