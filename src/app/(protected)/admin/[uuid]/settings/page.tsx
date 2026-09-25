import type { Metadata } from "next";

import { PortalSettings } from "@/features/(protected)/shared/portal-settings";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Settings",
  description: "Your profile, notification preferences and portal access.",
});

export default function Page() {
  return <PortalSettings />;
}
