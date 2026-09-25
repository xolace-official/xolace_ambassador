import type { Metadata } from "next";

import AdminAmbassadors from "@/features/(protected)/admin/ambassadors/pages/admin-ambassadors";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Ambassadors",
  description:
    "Applications, profiles, tracks, pods, progress and activity for everyone running the program.",
});

export default function Page() {
  return <AdminAmbassadors />;
}
