"use client";

import { useQuery } from "convex/react";

import { EmptyState } from "@/components/shared/empty-state";
import { api } from "../../../../../../convex/_generated/api";
import AdminMissions from "./admin-missions";

export default function AdminMissionSetDetail({
  uuid,
  missionSetId,
}: {
  uuid: string;
  missionSetId: string;
}) {
  const missionSet = useQuery(api.missionSets.adminGet, { missionSetId });

  if (missionSet === undefined) {
    return (
      <div
        className="h-64 animate-pulse rounded-xl border border-border bg-card"
        aria-hidden="true"
      />
    );
  }

  if (missionSet === null) {
    return (
      <EmptyState
        title="Mission set not found"
        description="This set may have been removed or the link may be incorrect."
      />
    );
  }

  return <AdminMissions uuid={uuid} missionSetId={missionSet._id} />;
}
