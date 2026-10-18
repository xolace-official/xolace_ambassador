import { Crown, Gem, Medal, Star, Trophy } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";

const recognitionIcon: Record<string, typeof Trophy> = {
  spotlight: Star,
  featured: Gem,
  pod_lead: Crown,
  fellowship: Medal,
};

const recognitionLabel: Record<string, string> = {
  spotlight: "Spotlight",
  featured: "Featured",
  pod_lead: "Pod Lead",
  fellowship: "Fellowship",
};

const recognitionStyle: Record<string, string> = {
  spotlight: "bg-warning/10 text-warning border-warning/20",
  featured: "bg-primary/10 text-primary border-primary/20",
  pod_lead: "bg-success/10 text-success border-success/20",
  fellowship: "bg-accent/10 text-accent border-accent/20",
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

interface Recognition {
  _id: string;
  _creationTime: number;
  kind: string;
  note: string;
}

export function RewardsRecognitionList({
  recognitions,
}: {
  recognitions: Recognition[];
}) {
  if (recognitions.length === 0) {
    return (
      <Card className="border-border p-6">
        <EmptyState
          icon={Trophy}
          title="No recognition yet"
          description="Keep contributing to earn spotlights, features, and fellowships."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recognitions.map((rec) => {
        const Icon = recognitionIcon[rec.kind] ?? Trophy;
        return (
          <Card key={rec._id} className="border-border p-5">
            <div className="flex items-start gap-3">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${
                  recognitionStyle[rec.kind] ??
                  "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {recognitionLabel[rec.kind] ?? rec.kind}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  {rec.note}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dateFormat.format(new Date(rec._creationTime))}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
