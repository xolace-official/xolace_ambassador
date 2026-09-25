import type { Metadata } from "next";

import { FeatureComingSoon } from "@/components/shared/feature-coming-soon";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ ambassadorId: string }>;

// TODO: resolve the real title once profile data exists.
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { ambassadorId } = await params;

  return portalMetadata({
    title: "Ambassador",
    description: `Progress, submissions and activity for ${ambassadorId}.`,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { ambassadorId } = await params;

  return (
    <FeatureComingSoon
      title="Ambassador profile"
      description={`Progress, submissions and activity for ${ambassadorId}.`}
    />
  );
}
