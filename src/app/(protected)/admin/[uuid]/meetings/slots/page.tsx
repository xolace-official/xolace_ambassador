import type { Metadata } from "next";

import { AdminMeetingsSlots } from "@/features/(protected)/admin/meetings/pages/admin-meetings-slots";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Meeting slots",
  description:
    "Every meeting slot you have created, including booked and disabled ones.",
});

export default function Page() {
  return <AdminMeetingsSlots />;
}
