"use client";

import { useQuery } from "convex/react";

import { EmptyState } from "@/components/shared/empty-state";
import { api } from "../../../../../../convex/_generated/api";
import { AdminMissionForm } from "../components/admin-mission-form";

export default function AdminMissionEdit({
  uuid,
  missionId,
}: {
  uuid: string;
  missionId: string;
}) {
  const mission = useQuery(api.missions.adminGet, { missionId });

  if (mission === undefined) {
    return (
      <div
        className="h-64 animate-pulse rounded-xl border border-border bg-card"
        aria-hidden="true"
      />
    );
  }

  if (mission === null || mission.missionSetId === null) {
    return (
      <EmptyState
        title="Mission not found"
        description="This mission may have been removed or is not assigned to a mission set."
      />
    );
  }

  return (
    <AdminMissionForm
      uuid={uuid}
      initial={{
        _id: mission._id,
        title: mission.title,
        summary: mission.summary,
        description: mission.description,
        track: mission.track,
        points: mission.points,
        difficulty: mission.difficulty,
        status: mission.status,
        submissionFields: mission.submissionFields,
        missionSetId: mission.missionSetId,
      }}
    />
  );
}
