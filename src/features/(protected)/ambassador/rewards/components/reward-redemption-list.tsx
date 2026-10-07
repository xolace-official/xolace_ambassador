import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Redemption = {
  _id: string;
  _creationTime: number;
  rewardName: string;
  points: number;
  status: "requested" | "approved" | "declined" | "fulfilled";
  reviewNote: string | null;
};

const statusStyles = {
  requested: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  declined: "bg-destructive text-destructive-foreground",
  fulfilled: "bg-primary text-primary-foreground",
} as const;

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function RewardRedemptionList({
  redemptions,
}: {
  redemptions: Redemption[];
}) {
  if (redemptions.length === 0) return null;

  return (
    <Card className="border-border">
      <ul className="divide-y divide-border">
        {redemptions.map((redemption) => (
          <li key={redemption._id} className="flex items-start gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {redemption.rewardName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {redemption.points} points ·{" "}
                {dateFormat.format(new Date(redemption._creationTime))}
              </p>
              {redemption.reviewNote ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {redemption.reviewNote}
                </p>
              ) : null}
            </div>
            <Badge className={statusStyles[redemption.status]}>
              {redemption.status}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
