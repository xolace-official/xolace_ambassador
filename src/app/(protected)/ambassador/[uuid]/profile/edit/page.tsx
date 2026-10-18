import type { Metadata } from "next";
import { PortalSettings } from "@/features/(protected)/shared/settings/pages/portal-settings";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Edit profile",
  description: "Update your ambassador profile and public details.",
});

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const { uuid } = await params;
  const { onboarding } = await searchParams;
  return (
    <PortalSettings
      profileEdit
      onboarding={onboarding === "1"}
      profileHref={`/ambassador/${uuid}/profile`}
    />
  );
}
