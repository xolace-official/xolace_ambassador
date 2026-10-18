import type { Metadata } from "next";

import AdminSubmissionDetail from "@/features/(protected)/admin/missions/pages/admin-submission-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ submissionId: string; uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Submission details",
  description: "Review an ambassador contribution and its submission details.",
});

export default async function Page({ params }: { params: Params }) {
  const { submissionId, uuid } = await params;
  return <AdminSubmissionDetail submissionId={submissionId} uuid={uuid} />;
}
