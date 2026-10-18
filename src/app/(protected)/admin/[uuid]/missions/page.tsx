import type { Metadata } from "next";

import AdminMissionSets from "@/features/(protected)/admin/missions/pages/admin-mission-sets";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Missions",
  description:
    "Create and manage missions, review submissions and track performance.",
});

type Params = Promise<{ uuid: string }>;

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;

  return <AdminMissionSets uuid={uuid} />;
}
