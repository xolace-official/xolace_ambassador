import { Badge } from "@/components/ui/badge";
import type { MissionCategory } from "@/types/missions.type";
import { MISSION_CATEGORY_LABELS } from "@/types/missions.type";

// Outlined, not filled, so the category stays quiet metadata and the status
// badge beside it is the only coloured signal on the card. Shared by the grid
// card and the detail page so the two cannot drift apart.
export function MissionTrackBadge({ track }: { track: MissionCategory }) {
  return (
    <Badge className="border-border bg-transparent text-foreground/80">
      {MISSION_CATEGORY_LABELS[track]}
    </Badge>
  );
}
