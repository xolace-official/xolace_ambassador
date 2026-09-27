import type { Metadata } from "next";

import { MissionDetail } from "@/features/(protected)/ambassador/missions/pages/mission-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string; missionId: string }>;

// The mission title cannot be resolved here. Convex Auth keeps its token in
// localStorage, so a server component has no way to authenticate a
// `fetchQuery` — the request would go out anonymous and be rejected. The real
// title is rendered by the client component instead.
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  await params;

  return portalMetadata({
    title: "Mission",
    description: "The full brief, deadline and requirements for this mission.",
  });
}

export default async function Page({ params }: { params: Params }) {
  const { missionId } = await params;

  return <MissionDetail missionId={missionId} />;
}
