import type { Metadata } from "next";

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Completed missions",
  description: "Missions you have finished and had approved.",
});

export default function Page() {
  return (
    <FeatureComingSoon
      title="Completed missions"
      description="Missions you have finished and had approved will be listed here."
    />
  );
}
