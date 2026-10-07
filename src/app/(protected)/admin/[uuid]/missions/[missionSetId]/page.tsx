import type { Metadata } from "next";

import AdminMissionSetDetail from "@/features/(protected)/admin/missions/pages/admin-mission-set-detail";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Mission set",
  description: "View and manage the missions inside a mission set.",
});

type Params = Promise<{ uuid: string; missionSetId: string }>;

export default async function Page({ params }: { params: Params }) {
  const { uuid, missionSetId } = await params;
  return <AdminMissionSetDetail uuid={uuid} missionSetId={missionSetId} />;
}
