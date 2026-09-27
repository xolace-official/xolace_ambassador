import type { Metadata } from "next";

import AdminMissionDetail from "@/features/(protected)/admin/missions/pages/admin-mission-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ missionId: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { missionId } = await params;

  return portalMetadata({
    title: "Task details",
    description: `Review the full details for mission ${missionId}.`,
  });
}

export default async function Page({ params }: { params: Params }) {
  const { missionId } = await params;
  return <AdminMissionDetail missionId={missionId} />;
}
