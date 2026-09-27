import type { Metadata } from "next";
import { Suspense } from "react";

import AmbassadorMissions from "@/features/(protected)/ambassador/missions/pages/ambassador-missions";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Missions",
  description:
    "Available missions you can take on, what's in progress, and everything you've completed.",
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-64 animate-pulse rounded-xl border border-border bg-card"
        />
      }
    >
      <AmbassadorMissions />
    </Suspense>
  );
}
