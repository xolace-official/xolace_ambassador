import type { Metadata } from "next";

import { PortalHelp } from "@/features/(protected)/shared/portal-help";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Help",
  description:
    "How the Xolace Ambassadors program works, and where to get support.",
});

export default function Page() {
  return <PortalHelp />;
}
