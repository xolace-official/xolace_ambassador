import type { FunctionReturnType } from "convex/server";
import { ArrowUpRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "../../../../../../convex/_generated/api";

type PendingReview = FunctionReturnType<typeof api.impact.adminPending>[number];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const statusStyles: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

export function AdminPendingReviews({
  reviews,
  uuid,
}: {
  reviews: PendingReview[];
  uuid: string;
}) {
  return (
    <Card className="h-full rounded-2xl border-border py-0 shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">Needs review</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contributions waiting for an admin decision.
            </p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full bg-warning/15 text-warning">
            <ClipboardCheck aria-hidden="true" className="size-4" />
          </span>
        </div>

        {/* Table-style header */}
        <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-x-3 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
          <span>Submission</span>
          <span className="hidden sm:block">Date</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-border/60">
          {reviews.length ? (
            reviews.slice(0, 3).map((review) => (
              <Link
                key={review._id}
                href={`/admin/${uuid}/missions/submissions/${review._id}`}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {review.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {review.ambassadorName}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {dateFormatter.format(review._creationTime)}
                </time>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles.pending}`}
                >
                  Pending
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground mt-3">
              No contributions need your attention right now.
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <Badge variant="secondary">{reviews.length} shown</Badge>
          <Link
            href={`/admin/${uuid}/missions?section=submissions`}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
