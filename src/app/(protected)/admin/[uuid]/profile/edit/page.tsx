import type { Metadata } from "next";
import { PortalSettings } from "@/features/(protected)/shared/settings/pages/portal-settings";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Edit profile",
  description: "Update your admin profile and public details.",
});

export default async function Page({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <PortalSettings profileEdit profileHref={`/admin/${uuid}/profile`} />;
}
