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

export type MissionProgressStatus =
  | "available"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  points: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  startsAt: string;
  endsAt: string;
  status: MissionProgressStatus;
}
