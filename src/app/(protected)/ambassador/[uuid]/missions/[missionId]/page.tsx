import type { Metadata } from "next";

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ missionId: string }>;

// TODO: resolve the real title once the `missions` table exists.
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { missionId } = await params;

  return portalMetadata({
    title: "Mission",
    description: `The brief, deadline and submission flow for mission ${missionId}.`,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { missionId } = await params;

  return (
    <FeatureComingSoon
      title="Mission detail"
      description={`The brief and submission flow for ${missionId} will live here.`}
    />
  );
}
