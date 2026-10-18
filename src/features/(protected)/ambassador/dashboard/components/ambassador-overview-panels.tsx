import type { FunctionReturnType } from "convex/server";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "../../../../../../convex/_generated/api";
import type {
  getWeeklyContributionCounts,
  getWeeklyPointTotals,
} from "../utils/dashboard-metrics";
import { AmbassadorConnectionsVisual } from "./ambassador-connections-visual";
import { AmbassadorReportsChart } from "./ambassador-reports-chart";

type Profile = FunctionReturnType<typeof api.ambassadors.getProfile>;
type Mission = FunctionReturnType<typeof api.missions.list>[number];
type DashboardContribution = FunctionReturnType<
  typeof api.ambassadors.getProfile
>["contributions"][number];

const numberFormat = new Intl.NumberFormat("en-GB");

export function AmbassadorOverviewPanels({
  profile,
  missions,
  uuid,
  contributions,
  weeklyPoints,
  weeklyContributions,
}: {
  profile: Profile;
  missions: Mission[];
  uuid: string;
  contributions: DashboardContribution[];
  weeklyPoints: ReturnType<typeof getWeeklyPointTotals>;
  weeklyContributions: ReturnType<typeof getWeeklyContributionCounts>;
}) {
  const completed = missions.filter(
    (m) => m.submission?.status === "approved",
  ).length;
  const submitted = missions.filter((m) => m.submission !== null).length;
  const open = Math.max(missions.length - submitted, 0);

  const points = profile.totals?.points ?? 0;
  const peopleReached = profile.totals?.peopleReached ?? 0;
  const weeklyBars = weeklyContributions;
  const weeklyMax = Math.max(...weeklyBars, 1);

  return (
    <div className="space-y-5">
      {/* Row 1: Reports chart + Connections visual */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <AmbassadorReportsChart
          contributions={contributions}
          totalPoints={points}
        />
        <AmbassadorConnectionsVisual
          peopleReached={peopleReached}
          uuid={uuid}
        />
      </section>

      {/* Row 2: Mission status + Contribution frequency + Weekly summary */}
      <section className="grid gap-5 sm:grid-cols-3">
        {/* Mission status */}
        <Card className="rounded-2xl border-border/60 py-0 shadow-none">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">
                Mission status
              </h2>
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <CalendarDays aria-hidden="true" className="size-4" />
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {/* Big pill for open missions */}
              <Link
                href={`/ambassador/${uuid}/missions`}
                className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium">Available missions</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tabular-nums">{open}</span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary-foreground text-primary">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </Link>
              {/* Stacked blocks */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Available", value: open, cls: "bg-primary/80" },
                  {
                    label: "Submitted",
                    value: submitted,
                    cls: "bg-success/80",
                  },
                  { label: "Approved", value: completed, cls: "bg-warning/80" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 text-primary-foreground ${item.cls}`}
                    style={{ minHeight: "64px" }}
                  >
                    <span className="text-base font-bold tabular-nums">
                      {item.value}
                    </span>
                    <span className="mt-0.5 text-[10px] opacity-80">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              {[
                { label: "Available", value: open, tone: "bg-primary" },
                { label: "Submitted", value: submitted, tone: "bg-success" },
                { label: "Approved", value: completed, tone: "bg-warning" },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1">
                  <span
                    className={`inline-block size-2 rounded-full ${item.tone}`}
                  />
                  {item.label}: {numberFormat.format(item.value)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contribution frequency bar chart */}
        <Card className="rounded-2xl border-border/60 py-0 shadow-none">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Contribution frequency
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {numberFormat.format(
                    weeklyBars.reduce((sum, value) => sum + value, 0),
                  )}{" "}
                  contributions recorded ·{" "}
                  {numberFormat.format(weeklyPoints.current)} points earned
                </p>
              </div>
            </div>
            <div className="mt-5 flex h-32 items-end gap-1.5 sm:h-40 sm:gap-2">
              {weeklyBars.map((value, index) => {
                const day = new Intl.DateTimeFormat("en-GB", {
                  weekday: "short",
                  timeZone: "UTC",
                }).format(new Date(Date.now() - (6 - index) * 86_400_000));
                return (
                  <div
                    key={day}
                    className="flex h-full flex-1 flex-col justify-end gap-1.5"
                  >
                    <div
                      className="rounded-t-lg bg-primary/30"
                      style={{
                        height: `${Math.max(
                          (value / weeklyMax) * 100,
                          value > 0 ? 8 : 2,
                        )}%`,
                      }}
                    >
                      <div className="h-full w-2/3 rounded-t-lg bg-primary/70" />
                    </div>
                    <span className="text-center text-[9px] text-muted-foreground">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly summary */}
        <Card className="rounded-2xl border-border/60 py-0 shadow-none">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">
                Weekly summary
              </h2>
              <div className="flex gap-1">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CalendarDays aria-hidden="true" className="size-4" />
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-GB", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              }).format(new Date(Date.now() - 6 * 86400000))}{" "}
              –{" "}
              {new Intl.DateTimeFormat("en-GB", {
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              }).format(new Date())}
            </p>
            <div className="mt-3">
              <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                {numberFormat.format(points)}
              </p>
              <p className="text-xs text-muted-foreground">
                Earned in the current 7-day period
              </p>
            </div>
            {/* Mini line chart */}
            <div className="mt-4 h-28">
              <svg
                viewBox="0 0 200 80"
                width="100%"
                height="100%"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="wk-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--primary)"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--primary)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                {/* Actual trend line */}
                {(() => {
                  const pts = weeklyBars.map((v, i) => {
                    const x = (i / (weeklyBars.length - 1)) * 190 + 5;
                    const y = 75 - (v / weeklyMax) * 55;
                    return `${x},${y}`;
                  });
                  const area = [
                    `5,75`,
                    ...weeklyBars.map((v, i) => {
                      const x = (i / (weeklyBars.length - 1)) * 190 + 5;
                      const y = 75 - (v / weeklyMax) * 55;
                      return `${x},${y}`;
                    }),
                    `195,75`,
                  ];
                  return (
                    <>
                      <polygon points={area.join(" ")} fill="url(#wk-grad)" />
                      <polyline
                        points={pts.join(" ")}
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      {/* Dot on last point */}
                      <circle
                        cx={(190 + 5).toString()}
                        cy={(75 - (weeklyBars[6] / weeklyMax) * 55).toString()}
                        r="3"
                        fill="var(--primary)"
                      />
                    </>
                  );
                })()}
              </svg>
            </div>
            <Link
              href={`/ambassador/${uuid}/impact`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View full impact
              <ArrowUpRight aria-hidden="true" className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
