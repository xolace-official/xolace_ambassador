import type { Metadata } from "next";
import { Suspense } from "react";

import AdminAmbassadors from "@/features/(protected)/admin/ambassadors/pages/admin-ambassadors";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ uuid: string }>;

export const metadata: Metadata = portalMetadata({
  title: "Ambassadors",
  description:
    "Applications, profiles, tracks, pods, progress and activity for everyone running the program.",
});

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-72 animate-pulse rounded-xl border border-border bg-card"
        />
      }
    >
      <AdminAmbassadors uuid={uuid} />
    </Suspense>
  );
}
