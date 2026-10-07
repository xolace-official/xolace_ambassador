import type { Metadata } from "next";

import AmbassadorRewards from "@/features/(protected)/ambassador/rewards/pages/ambassador-rewards";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Rewards",
  description:
    "Track your points, levels, recognition, and reward history earned through contributions.",
});

type Params = Promise<{ uuid: string }>;

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;
  return <AmbassadorRewards uuid={uuid} />;
}
