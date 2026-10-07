"use client";

import { Gift, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Reward = {
  _id: string;
  name: string;
  description: string;
  costPoints: number;
  stock: number | null;
};

export function RewardsCatalogue({
  rewards,
  points,
  onRedeem,
}: {
  rewards: Reward[];
  points: number;
  onRedeem: (rewardId: string) => Promise<void>;
}) {
  if (rewards.length === 0) {
    return (
      <Card className="border-border p-5">
        <EmptyState
          icon={Gift}
          title="No rewards available yet"
          description="The program team will add rewards to the catalogue when they are ready."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rewards.map((reward) => {
        const outOfStock = reward.stock !== null && reward.stock <= 0;
        const canRedeem = points >= reward.costPoints && !outOfStock;
        return (
          <Card
            key={reward._id}
            className="flex flex-col gap-4 border-border p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PackageCheck aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">{reward.name}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {reward.description}
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{reward.costPoints} points</Badge>
                {outOfStock ? (
                  <Badge variant="outline">Out of stock</Badge>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                disabled={!canRedeem}
                onClick={() => {
                  void onRedeem(reward._id).catch((error: unknown) => {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Could not request this reward.",
                    );
                  });
                }}
              >
                {outOfStock
                  ? "Unavailable"
                  : points < reward.costPoints
                    ? "Need more points"
                    : "Request reward"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
