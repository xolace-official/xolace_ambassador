"use client";

import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { PageDescription } from "@/components/shared/page-description";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "../../../../../../convex/_generated/api";
import { AdminRewardForm } from "../components/admin-reward-form";

export default function AdminRewards() {
  const rewards = useQuery(api.rewards.adminListRewards);
  const redemptions = useQuery(api.rewards.adminListRedemptions);
  const createReward = useMutation(api.rewards.adminCreateReward);
  const updateStatus = useMutation(api.rewards.adminUpdateRewardStatus);
  const review = useMutation(api.rewards.adminReviewRedemption);

  if (rewards === undefined || redemptions === undefined) {
    return (
      <div className="h-64 animate-pulse rounded-xl bg-card" aria-busy="true" />
    );
  }

  return (
    <div className="space-y-6">
      <PageDescription page="adminRewards" className="max-w-2xl" />
      <Card className="border-border p-4 sm:p-6">
        <h1 className="text-xl font-semibold text-foreground">
          Reward catalogue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create rewards ambassadors can request with earned points.
        </p>
        <div className="mt-5">
          <AdminRewardForm
            onCreate={async (values) => {
              await createReward(values);
              toast.success("Reward created.");
            }}
          />
        </div>
      </Card>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Available rewards
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {rewards.map((reward) => (
            <Card
              key={reward._id}
              className="flex items-start justify-between gap-4 border-border p-4"
            >
              <div className="min-w-0">
                <h3 className="font-medium text-foreground">{reward.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reward.costPoints} points ·{" "}
                  {reward.stock === null
                    ? "Unlimited stock"
                    : `${reward.stock} in stock`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  void updateStatus({
                    rewardId: reward._id,
                    status: reward.status === "active" ? "paused" : "active",
                  }).then(() => toast.success("Reward status updated."))
                }
              >
                {reward.status === "active" ? "Pause" : "Activate"}
              </Button>
            </Card>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Redemption requests
        </h2>
        <Card className="border-border">
          <ul className="divide-y divide-border">
            {redemptions.map((redemption) => (
              <li
                key={redemption._id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {redemption.ambassadorName} · {redemption.rewardName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {redemption.points} points
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{redemption.status}</Badge>
                  {redemption.status === "requested" ? (
                    <>
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          void review({
                            redemptionId: redemption._id,
                            status: "approved",
                          }).then(() => toast.success("Redemption approved."))
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          const note = window.prompt("Reason for declining");
                          if (note)
                            void review({
                              redemptionId: redemption._id,
                              status: "declined",
                              reviewNote: note,
                            }).then(() =>
                              toast.success("Redemption declined."),
                            );
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                  {redemption.status === "approved" ? (
                    <Button
                      size="sm"
                      type="button"
                      onClick={() =>
                        void review({
                          redemptionId: redemption._id,
                          status: "fulfilled",
                        }).then(() =>
                          toast.success("Redemption marked fulfilled."),
                        )
                      }
                    >
                      Mark fulfilled
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
