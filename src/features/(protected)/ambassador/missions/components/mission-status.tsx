import { Badge } from "@/components/ui/badge";
import type { MissionProgressStatus } from "@/types/missions.type";

const statusConfig: Record<
  MissionProgressStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className: "bg-secondary text-secondary-foreground",
  },
  in_progress: {
    label: "In progress",
    className: "bg-accent text-accent-foreground",
  },
  submitted: {
    label: "Submitted",
    className: "bg-secondary text-secondary-foreground",
  },
  under_review: {
    label: "Under review",
    className: "bg-secondary text-secondary-foreground",
  },
  approved: {
    label: "Completed",
    className: "bg-accent text-accent-foreground",
  },
  rejected: {
    label: "Needs revision",
    className: "bg-destructive text-destructive-foreground",
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground",
  },
};

export function MissionStatus({ status }: { status: MissionProgressStatus }) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={`border-0 font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
