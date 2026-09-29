import type { Metadata } from "next";

import AmbassadorLeaderboard from "@/features/(protected)/ambassador/leaderboard/pages/ambassador-leaderboard";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Leaderboard",
  description:
    "See how you rank among fellow ambassadors by points, contributions, and impact.",
});

export default function Page() {
  return <AmbassadorLeaderboard />;
}
