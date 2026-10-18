import { Suspense } from "react";

import AdminAmbassadorDetail from "@/features/(protected)/admin/ambassadors/pages/admin-ambassador-detail";
import { portalMetadata } from "@/lib/metadata";

type Params = Promise<{ ambassadorId: string }>;

export const metadata = portalMetadata({
  title: "Ambassador overview",
  description: "Review an ambassador’s profile, activity and impact.",
});

export default async function Page({ params }: { params: Params }) {
  const { ambassadorId } = await params;
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-72 animate-pulse rounded-xl border border-border bg-card"
        />
      }
    >
      <AdminAmbassadorDetail ambassadorId={ambassadorId} />
    </Suspense>
  );
}
