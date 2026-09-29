import type { Metadata } from "next";

import { AdminResourceForm } from "@/features/(protected)/admin/resources/components/admin-resource-form";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string; resourceId: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Edit Resource",
  description: "Edit resource details, content, or published status.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid, resourceId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <header className="max-w-3xl space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Resource
        </h1>
        <p className="text-sm text-muted-foreground">
          Update resource write-ups, video links, attachments, or settings.
        </p>
      </header>

      <AdminResourceForm uuid={uuid} editingId={resourceId} />
    </div>
  );
}
