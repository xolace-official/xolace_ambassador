import type { Metadata } from "next";

import { AdminResourceForm } from "@/features/(protected)/admin/resources/components/admin-resource-form";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Create Resource",
  description:
    "Create a new resource, playbook, video tutorial, or brand asset for ambassadors.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Publish a playbook, video stream, downloadable asset, caption copy
          list, or guide for ambassadors.
        </p>
      </header>

      <AdminResourceForm uuid={uuid} />
    </div>
  );
}
