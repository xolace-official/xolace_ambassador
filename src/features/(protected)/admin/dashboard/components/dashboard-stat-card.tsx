import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function MiniSparkline({
  data,
  isUp,
  gradientId,
}: {
  data: number[];
  isUp: boolean;
  gradientId: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return { x, y };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  const fillD = `${pathD} L ${w} ${h} L 0 ${h} Z`;
  const strokeColor = isUp ? "var(--success)" : "var(--destructive)";
  const lastPt = points[points.length - 1];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <path d={fillD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastPt.x} cy={lastPt.y} r="3" fill={strokeColor} />
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
  const gradientId = `spark-grad-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className="group relative overflow-hidden bg-card/60 p-0 backdrop-blur-xs rounded-none transition-all hover:border-border hover:shadow-xs">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-3xl">
              {value}
            </p>
            {deltaLabel && (
              <p className="mt-2 flex items-center gap-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    isUp
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isUp ? (
                    <TrendingUp aria-hidden="true" className="size-3" />
                  ) : (
                    <TrendingDown aria-hidden="true" className="size-3" />
                  )}
                  {deltaLabel}
                </span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              {periodLabel}
            </span>
            {trend && (
              <MiniSparkline data={trend} isUp={isUp} gradientId={gradientId} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
