import type { Metadata } from "next";

import AdminMissions from "@/features/(protected)/admin/missions/pages/admin-missions";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Missions",
  description:
    "Create and manage missions, review submissions and track performance.",
});

export default function Page() {
  return <AdminMissions />;
}
