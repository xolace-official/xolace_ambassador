import { Card, CardContent } from "@/components/ui/card";
import { formatProfileLabel as formatLabel } from "./profile-format-label";

export function ProfileActivityCard({
  contributions,
}: {
  contributions: Array<{
    _id: string;
    title: string;
    status: string;
    awardedPoints: number | null;
  }>;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <h3 className="font-semibold text-foreground">Recent activity</h3>
        <div className="mt-4 space-y-4">
          {contributions.length ? (
            contributions.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-muted-foreground">
                    {formatLabel(item.status)}
                  </p>
                </div>
                {item.awardedPoints ? (
                  <span className="shrink-0 font-semibold text-success">
                    +{item.awardedPoints} pts
                  </span>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Your contribution activity will appear here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
