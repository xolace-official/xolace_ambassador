import type { Metadata } from "next";
import { Suspense } from "react";

import AmbassadorResources from "@/features/(protected)/ambassador/resources/pages/ambassador-resources";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Resources",
  description:
    "Brand kit, templates, campaign assets, playbooks, and guides for representing Xolace.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      }
    >
      <AmbassadorResources uuid={uuid} />
    </Suspense>
  );
}
