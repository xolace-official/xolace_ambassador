export type MissionCategory =
  | "creator"
  | "community"
  | "growth"
  | "creative"
  | "production"
  | "advocacy";

export const MISSION_CATEGORY_LABELS: Record<MissionCategory, string> = {
  creator: "Creator",
  community: "Community",
  growth: "Growth",
  creative: "Creative",
  production: "Production",
  advocacy: "Advocacy",
};

export const MISSION_CATEGORIES = [
  "creator",
  "community",
  "growth",
  "creative",
  "production",
  "advocacy",
] as const satisfies readonly MissionCategory[];

export type MissionProgressStatus =
  | "available"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export const MISSION_STATUS_LABELS: Record<MissionProgressStatus, string> = {
  available: "Available",
  in_progress: "In progress",
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Completed",
  rejected: "Needs revision",
  expired: "Expired",
};

export const MISSION_STATUSES = [
  "available",
  "in_progress",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "expired",
] as const satisfies readonly MissionProgressStatus[];

export const MISSION_DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type MissionDifficulty = (typeof MISSION_DIFFICULTIES)[number];

export interface Mission {
  id: string;
  title: string;
  /** One short sentence for the card. Never the full brief. */
  summary: string;
  /** The full brief. Blank lines separate blocks. */
  description: string;
  category: MissionCategory;
  points: number;
  difficulty: MissionDifficulty;
  /** Epoch ms. */
  startsAt: number;
  /** Epoch ms. */
  endsAt: number;
  /** Where this ambassador stands on this mission. */
  status: MissionProgressStatus;
}
