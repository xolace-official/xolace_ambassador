import type { FunctionReturnType } from "convex/server";
import { ArrowUpRight, CalendarDays, Download } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "../../../../../../convex/_generated/api";
import { AmbassadorConnectionsVisual } from "./ambassador-connections-visual";
import { AmbassadorReportsChart } from "./ambassador-reports-chart";

type Profile = FunctionReturnType<typeof api.ambassadors.getProfile>;
type Mission = FunctionReturnType<typeof api.missions.list>[number];

const numberFormat = new Intl.NumberFormat("en-GB");

export function AmbassadorOverviewPanels({
  profile,
  missions,
  uuid,
}: {
  profile: Profile;
  missions: Mission[];
  uuid: string;
}) {
  const contributions = profile.contributions;
  const completed = missions.filter(
    (m) => m.submission?.status === "approved",
  ).length;
  const submitted = missions.filter((m) => m.submission !== null).length;
  const open = Math.max(missions.length - submitted, 0);

  const weeklyBars = [
    Math.max(18, Math.min(90, open * 14)),
    Math.max(24, Math.min(82, submitted * 20)),
    Math.max(16, Math.min(72, completed * 24)),
    Math.max(30, Math.min(94, missions.length * 8)),
    Math.max(22, Math.min(86, contributions.length * 18)),
    Math.max(28, Math.min(76, (profile.totals?.peopleReached ?? 0) / 4)),
    Math.max(20, Math.min(88, (profile.totals?.points ?? 0) / 15)),
  ];

  const points = profile.totals?.points ?? 0;
  const peopleReached = profile.totals?.peopleReached ?? 0;

  // Weekly summary — cumulative points trend (last 7 days simulated from contributions)
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
                  Average 45%
                </p>
              </div>
              <button
                type="button"
                aria-label="Download summary"
                className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Download aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div className="mt-5 flex h-40 items-end gap-1.5 sm:gap-2">
              {weeklyBars.map((value, index) => {
                const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                  index
                ];
                return (
                  <div
                    key={day}
                    className="flex h-full flex-1 flex-col justify-end gap-1.5"
                  >
                    <div
                      className="rounded-t-lg bg-primary/30"
                      style={{ height: `${value}%` }}
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
                <button
                  type="button"
                  aria-label="Download weekly summary"
                  className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Download aria-hidden="true" className="size-4" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Intl.DateTimeFormat("en-GB", {
                month: "short",
                day: "numeric",
              }).format(new Date(Date.now() - 6 * 86400000))}{" "}
              –{" "}
              {new Intl.DateTimeFormat("en-GB", {
                month: "short",
                day: "numeric",
              }).format(new Date())}
            </p>
            <div className="mt-3">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {numberFormat.format(points)}
              </p>
              <p className="flex items-center gap-1 text-xs text-success">
                <ArrowUpRight aria-hidden="true" className="size-3" />
                +4.2%
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
                {/* Target line */}
                <line
                  x1="0"
                  y1="20"
                  x2="200"
                  y2="20"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 3"
                  strokeWidth="1"
                />
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
                <text x="0" y="17" fontSize="8" fill="var(--muted-foreground)">
                  Target
                </text>
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
