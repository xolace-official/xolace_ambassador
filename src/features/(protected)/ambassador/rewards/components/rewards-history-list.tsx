import { Activity, Gift, TrendingUp } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

interface LedgerEntry {
  _id: string;
  _creationTime: number;
  delta: number;
  reason: string;
  actionKey?: string;
}

export function RewardsHistoryList({
  ledger,
  moreHref,
}: {
  ledger: LedgerEntry[];
  moreHref?: string;
}) {
  if (ledger.length === 0) {
    return (
      <Card className="border-border p-5">
        <EmptyState
          icon={Gift}
          title="No rewards yet"
          description="Complete missions and contribute to earn points and rewards."
        />
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <ul className="divide-y divide-border">
        {ledger.map((entry) => (
          <li
            key={entry._id}
            className="flex min-h-14 items-center gap-3 px-4 py-2"
          >
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                entry.delta >= 0
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {entry.delta >= 0 ? (
                <TrendingUp aria-hidden="true" className="size-4" />
              ) : (
                <Activity aria-hidden="true" className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {entry.reason}
              </p>
              <p className="text-xs text-muted-foreground">
                {dateFormat.format(new Date(entry._creationTime))}
              </p>
            </div>
            <span
              className={`text-sm font-semibold tabular-nums ${
                entry.delta >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {entry.delta >= 0 ? "+" : ""}
              {entry.delta}
            </span>
          </li>
        ))}
      </ul>
      {moreHref ? (
        <div className="flex justify-end border-t border-border p-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={moreHref}>See more</Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
