import type { Metadata } from "next";
import { Suspense } from "react";
import AmbassadorRewardHistory from "@/features/(protected)/ambassador/rewards/pages/ambassador-reward-history";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Reward history",
  description:
    "Review every reward point earned through approved contributions.",
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AmbassadorRewardHistory />
    </Suspense>
  );
}
