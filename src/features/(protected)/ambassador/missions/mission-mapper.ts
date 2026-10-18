import type { Mission, MissionProgressStatus } from "@/types/missions.type";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type Submission = Doc<"contributions">;

export type MissionRow = Doc<"missions"> & {
  openState: "available" | "expired";
  submission: Submission | null;
};

const SUBMISSION_STATUS: Record<Submission["status"], MissionProgressStatus> = {
  pending: "submitted",
  approved: "approved",
  rejected: "rejected",
  declined: "declined",
};

// The document and the card view model disagree on two field names on purpose:
// `track` is the stored column, and `status` on a document is the publishing
// state (draft/published/closed) which says nothing about the ambassador.
export function toMission(row: MissionRow): Mission {
  return {
    id: row._id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.track,
    points: row.points,
    difficulty: row.difficulty,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    // A submission outranks the deadline: work that was approved still counts
    // as done after the mission closes.
    status: row.submission
      ? SUBMISSION_STATUS[row.submission.status]
      : row.openState,
  };
}
