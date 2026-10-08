import type { Metadata } from "next";

import { AdminMeetings } from "@/features/(protected)/admin/meetings/pages/admin-meetings";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Meetings",
  description:
    "Manage your availability and keep up with the ambassador meetings you have scheduled.",
});

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <AdminMeetings uuid={uuid} />;
}
