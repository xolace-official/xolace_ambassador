import type { Metadata } from "next";

import AdminMissionDetail from "@/features/(protected)/admin/missions/pages/admin-mission-detail";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Mission details",
  description: "Review the full details of an ambassador mission.",
});

type Params = Promise<{
  uuid: string;
  missionSetId: string;
  missionId: string;
}>;

export default async function Page({ params }: { params: Params }) {
  const { uuid, missionSetId, missionId } = await params;
  return (
    <AdminMissionDetail
      uuid={uuid}
      missionSetId={missionSetId}
      missionId={missionId}
    />
  );
}
