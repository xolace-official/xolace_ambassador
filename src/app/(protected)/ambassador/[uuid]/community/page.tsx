import type { Metadata } from "next";

import AmbassadorCommunity from "@/features/(protected)/ambassador/community/pages/ambassador-community";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Community",
  description:
    "Announcements, events, pods and discussions with fellow ambassadors.",
});

export default function Page() {
  return <AmbassadorCommunity />;
}
