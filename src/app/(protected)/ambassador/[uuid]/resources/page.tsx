import type { Metadata } from "next";

import AmbassadorResources from "@/features/(protected)/ambassador/resources/pages/ambassador-resources";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Resources",
  description:
    "Brand kit, templates, campaign assets, playbooks, and guides for representing Xolace.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;
  return <AmbassadorResources uuid={uuid} />;
}
