import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const kindColor: Record<string, string> = {
  mission_submission: "bg-chart-1",
  people_reached: "bg-chart-3",
  app_install: "bg-chart-2",
  referral: "bg-chart-4",
  content: "bg-chart-5",
  event: "bg-accent",
  other: "bg-muted",
};

const kindLabel: Record<string, string> = {
  mission_submission: "Mission submission",
  people_reached: "People reached",
  app_install: "App installs",
  referral: "Referrals",
  content: "Content",
  event: "Event",
  other: "Other",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  declined: "Declined",
};

const statusStyle: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-warning text-warning-foreground",
  declined: "bg-destructive text-destructive-foreground",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

interface Contribution {
  _id: string;
  _creationTime: number;
  title: string;
  kind: string;
  status: string;
  quantity?: number;
  awardedPoints?: number;
}

export function ContributionHistory({
  contributions,
}: {
  contributions: Contribution[];
}) {
  const approved = contributions.filter((c) => c.status === "approved");
  const pending = contributions.filter((c) => c.status === "pending");

  return (
    <Card className="border-border">
      <div className="border-b border-border p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Contribution history
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {contributions.length} total · {approved.length} approved ·{" "}
          {pending.length} pending
        </p>
      </div>
      {contributions.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No contributions yet"
            description="Submit your first mission or log your impact to get started."
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {contributions.slice(0, 20).map((contribution) => (
            <li
              key={contribution._id}
              className="flex items-center gap-3 px-5 py-3"
            >
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${kindColor[contribution.kind] ?? "bg-muted"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {contribution.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {kindLabel[contribution.kind]} ·{" "}
                  {dateFormat.format(new Date(contribution._creationTime))}
                </p>
              </div>
              {contribution.awardedPoints !== undefined ? (
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  +{contribution.awardedPoints}
                </span>
              ) : null}
              <Badge className={statusStyle[contribution.status]}>
                {statusLabel[contribution.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
