import type { Metadata } from "next";
import { PortalProfile } from "@/features/(protected)/shared/profile/pages/portal-profile";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Profile",
  description: "View your Xolace profile.",
});

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <PortalProfile portalRole="admin" uuid={uuid} />;
}
