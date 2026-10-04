import { ArrowUpRight, CheckCircle2, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function AmbassadorDashboardSideCard({
  uuid,
  points,
  currentLevel,
  nextLevel,
  progress,
  safetyAcknowledged,
}: {
  uuid: string;
  points: number;
  currentLevel: string;
  nextLevel: { name: string; minPoints: number } | null;
  progress: number;
  safetyAcknowledged: boolean;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-none">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Trophy aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground">Your level</h2>
            <p className="mt-1 text-sm text-muted-foreground">{currentLevel}</p>
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>{points.toLocaleString("en-GB")} points</span>
            <span>
              {nextLevel ? `${nextLevel.minPoints} to go` : "Max level"}
            </span>
          </div>
          <Progress value={progress * 100} />
        </div>
        <Link
          href={`/ambassador/${uuid}/rewards`}
          className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View rewards
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
        <div className="border-t border-border pt-4">
          <div className="flex items-start gap-2">
            <CheckCircle2
              aria-hidden="true"
              className={`mt-0.5 size-4 shrink-0 ${safetyAcknowledged ? "text-success" : "text-muted-foreground"}`}
            />
            <p className="text-sm text-muted-foreground">
              {safetyAcknowledged
                ? "Safety acknowledgement completed."
                : "Complete your safety acknowledgement before contributing."}
            </p>
          </div>
          {!safetyAcknowledged ? (
            <Link
              href={`/ambassador/${uuid}/settings?section=program`}
              className="mt-3 inline-flex text-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Complete it now
            </Link>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
