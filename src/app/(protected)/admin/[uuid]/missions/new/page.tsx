import type { Metadata } from "next";

import { PageDescription } from "@/components/shared/page-description";
import { AdminMissionForm } from "@/features/(protected)/admin/missions/components/admin-mission-form";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string }>;
type SearchParams = Promise<{ setId?: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Create mission",
  description: "Create a mission for Xolace ambassadors.",
});

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { uuid } = await params;
  const { setId } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <header className="max-w-3xl space-y-2">
        <PageDescription page="createMission" />
      </header>

      <AdminMissionForm uuid={uuid} initialMissionSetId={setId} />
    </div>
  );
}
