import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const numberFormat = new Intl.NumberFormat("en-GB");

interface Level {
  rank: number;
  key: string;
  name: string;
  minPoints: number;
  description: string;
}

interface RewardsLevelProgressProps {
  currentLevel: Level;
  nextLevel: Level | null;
  points: number;
  availablePoints: number;
}

export function RewardsLevelProgress({
  currentLevel,
  nextLevel,
  points,
  availablePoints,
}: RewardsLevelProgressProps) {
  return (
    <Card className="border-border p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-warning/10">
            <Crown aria-hidden="true" className="size-7 text-warning" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current level
            </p>
            <p className="text-xl font-bold text-foreground">
              Level {currentLevel.rank}
            </p>
          </div>
        </div>
        {nextLevel ? (
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Next level
            </p>
            <p className="text-lg font-semibold text-foreground">
              Level {nextLevel.rank}
            </p>
            <p className="text-xs text-muted-foreground">
              {numberFormat.format(nextLevel.minPoints - points)} points to go
            </p>
          </div>
        ) : (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <Sparkles aria-hidden="true" className="size-3" />
            Max level reached
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{numberFormat.format(points)} earned</span>
          <span>{numberFormat.format(availablePoints)} available</span>
        </div>
        <Progress
          value={
            availablePoints > 0
              ? Math.min((points / availablePoints) * 100, 100)
              : 0
          }
          className="h-2"
        />
      </div>
    </Card>
  );
}
