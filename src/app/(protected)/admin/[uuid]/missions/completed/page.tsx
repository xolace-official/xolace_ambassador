import type { Metadata } from "next";

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Completed missions",
  description: "Missions that have been approved and closed out.",
});

export default function Page() {
  return (
    <FeatureComingSoon
      title="Completed missions"
      description="Missions that have been approved and closed out will be listed here."
    />
  );
}
