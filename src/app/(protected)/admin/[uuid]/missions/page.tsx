import type { Metadata } from "next";
import { Suspense } from "react";

import AdminMissions from "@/features/(protected)/admin/missions/pages/admin-missions";
import { portalMetadata } from "@/lib/metadata";

export const metadata: Metadata = portalMetadata({
  title: "Missions",
  description:
    "Create and manage missions, review submissions and track performance.",
});

type Params = Promise<{ uuid: string }>;

export default async function Page({ params }: { params: Params }) {
  const { uuid } = await params;

  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className="h-64 animate-pulse rounded-xl border border-border bg-card"
        />
      }
    >
      <AdminMissions uuid={uuid} />
    </Suspense>
  );
}
