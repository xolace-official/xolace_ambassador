import type { Metadata } from "next";
import { Suspense } from "react";
import AmbassadorContributionHistory from "@/features/(protected)/ambassador/impact/pages/ambassador-contribution-history";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Contribution history",
  description:
    "Review mission submissions and impact contributions you have recorded.",
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AmbassadorContributionHistory />
    </Suspense>
  );
}
