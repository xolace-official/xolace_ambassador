import type { Metadata } from "next";

import AmbassadorResources from "@/features/(protected)/ambassador/resources/pages/ambassador-resources";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Resources",
  description:
    "Brand kit, templates, campaign assets and guides for representing Xolace.",
});

export default function Page() {
  return <AmbassadorResources />;
}
