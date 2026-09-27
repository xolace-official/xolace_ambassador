import type { Metadata } from "next";

import { PageDescription } from "@/components/shared/page-description";
import { AdminMissionForm } from "@/features/(protected)/admin/missions/components/admin-mission-form";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Create mission",
  description: "Create a mission for Xolace ambassadors.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;

  return (
    <div className="flex flex-col gap-6">
      <header className="max-w-3xl space-y-2">
        <PageDescription page="createMission" />
      </header>

      <AdminMissionForm uuid={uuid} />
    </div>
  );
}
