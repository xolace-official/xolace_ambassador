import { Badge } from "@/components/ui/badge";
import type { MissionProgressStatus } from "@/types/missions.type";
import { MISSION_STATUS_LABELS } from "@/types/missions.type";

// These are the design system's own fill/foreground token pairs, so contrast is
// defined once in globals.css rather than guessed per call site. A neutral
// `bg-secondary` is deliberately avoided — it resolves to the same value as
// `bg-card` in dark mode, which made the badge disappear.
const statusStyles: Record<MissionProgressStatus, string> = {
  available: "bg-primary text-primary-foreground",
  in_progress: "bg-accent text-accent-foreground",
  submitted: "bg-warning text-warning-foreground",
  under_review: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  declined: "bg-destructive text-destructive-foreground",
  expired: "border-border bg-muted text-muted-foreground",
};

export function MissionStatus({ status }: { status: MissionProgressStatus }) {
  return (
    <Badge className={statusStyles[status]}>
      {MISSION_STATUS_LABELS[status]}
    </Badge>
  );
}
