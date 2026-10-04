import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="text-primary"
      />
    </svg>
  );
}

export function DashboardStatCard({
  label,
  value,
  periodLabel,
  trend,
  deltaLabel,
}: {
  label: string;
  value: string;
  periodLabel: string;
  trend?: number[];
  deltaLabel?: string;
}) {
  const isUp =
    trend && trend.length >= 2 ? trend[trend.length - 1] >= trend[0] : true;

  return (
    <Card className="rounded-none border-0 py-0 shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
              {value}
            </p>
            {deltaLabel && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {isUp ? (
                  <TrendingUp
                    aria-hidden="true"
                    className="size-3 text-success"
                  />
                ) : (
                  <TrendingDown
                    aria-hidden="true"
                    className="size-3 text-destructive"
                  />
                )}
                <span className={isUp ? "text-success" : "text-destructive"}>
                  {deltaLabel}
                </span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="text-[10px] text-muted-foreground">
              {periodLabel}
            </span>
            {trend && <MiniSparkline data={trend} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
