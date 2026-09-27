import type { Metadata } from "next";

import AdminApplicationDetail from "@/features/(protected)/admin/ambassadors/pages/admin-application-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ applicationId: string; uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Application details",
  description: "Review an ambassador application.",
});

export default async function Page({ params }: { params: Params }) {
  const { applicationId } = await params;
  return <AdminApplicationDetail applicationId={applicationId} />;
}
