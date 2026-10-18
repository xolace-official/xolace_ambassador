import type { FunctionReturnType } from "convex/server";
import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "../../../../../../convex/_generated/api";
import { AdminActivityHeatmap } from "./admin-activity-heatmap";

type Activity = FunctionReturnType<
  typeof api.analytics.getAnalytics
>["recentActivity"][number];

type TimelinePoint = FunctionReturnType<
  typeof api.analytics.getAnalytics
>["timeline"][number];

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function AdminRecentActivity({
  activity,
  uuid,
  timeline,
}: {
  activity: Activity[];
  uuid: string;
  timeline: TimelinePoint[];
}) {
  return (
    <Card className="h-full rounded-2xl border-border py-0 shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">Recent activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The latest contribution activity across the program.
            </p>
          </div>
          <Link
            href={`/admin/${uuid}/reports`}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reports
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-5 space-y-4">
          {activity.length ? (
            activity.map((item) => (
              <div key={item.id} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Clock3 aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                  <time className="mt-1 block text-xs text-muted-foreground/70">
                    {timeFormatter.format(item.time)}
                  </time>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Activity will appear here as ambassadors contribute.
            </p>
          )}
        </div>
        {timeline.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Contribution heatmap
            </p>
            <AdminActivityHeatmap data={timeline} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
