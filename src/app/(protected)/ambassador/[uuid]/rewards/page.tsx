import type { Metadata } from "next";

import AmbassadorRewards from "@/features/(protected)/ambassador/rewards/pages/ambassador-rewards";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Rewards",
  description:
    "Points, achievements, recognition and reward history from your contributions.",
});

export default function Page() {
  return <AmbassadorRewards />;
}
