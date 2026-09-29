import type { Metadata } from "next";

import AdminResourceDetail from "@/features/(protected)/admin/resources/pages/resource-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ resourceId: string; uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Resource Details",
  description: "View resource details, content, attachments, and settings.",
});

export default async function Page({ params }: { params: Params }) {
  const { resourceId, uuid } = await params;
  return <AdminResourceDetail resourceId={resourceId} uuid={uuid} />;
}
