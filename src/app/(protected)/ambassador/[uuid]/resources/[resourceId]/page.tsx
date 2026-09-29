import type { Metadata } from "next";

import AmbassadorResourceDetail from "@/features/(protected)/ambassador/resources/pages/ambassador-resource-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string; resourceId: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Resource Details",
  description:
    "View playbook guides, videos, brand kit assets, captions, and templates for ambassadors.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid, resourceId } = await params;

  return <AmbassadorResourceDetail uuid={uuid} resourceId={resourceId} />;
}
