import type { Metadata } from "next";

import { AdminMeetingsAll } from "@/features/(protected)/admin/meetings/pages/admin-meetings-all";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "All meetings",
  description: "Every scheduled ambassador meeting, across all statuses.",
});

export default function Page() {
  return <AdminMeetingsAll />;
}
