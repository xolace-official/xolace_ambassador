import type { Metadata } from "next";

import AdminCommunities from "@/features/(protected)/admin/communities/pages/admin-communities";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Communities",
  description:
    "Announcements, events, pods, discussions and recognition across ambassador communities.",
});

export default function Page() {
  return <AdminCommunities />;
}
