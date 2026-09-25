import type { Metadata } from "next";

import AmbassadorImpact from "@/features/(protected)/ambassador/impact/pages/ambassador-impact";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Impact",
  description:
    "People reached, referrals, content, activities and your full contribution history.",
});

export default function Page() {
  return <AmbassadorImpact />;
}
