import type { Metadata } from "next";

import AdminMissionEdit from "@/features/(protected)/admin/missions/pages/admin-mission-edit";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Edit mission",
  description: "Update an ambassador mission.",
});

type Params = Promise<{
  uuid: string;
  missionId: string;
}>;

export default async function Page({ params }: { params: Params }) {
  const { uuid, missionId } = await params;
  return <AdminMissionEdit uuid={uuid} missionId={missionId} />;
}
