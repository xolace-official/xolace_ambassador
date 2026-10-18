import type { Mission } from "@/types/missions.type";

const STATUS_TALLY: {
  label: string;
  statuses: Mission["status"][];
}[] = [
  { label: "available", statuses: ["available"] },
  { label: "in progress", statuses: ["in_progress"] },
  { label: "under review", statuses: ["under_review"] },
  { label: "completed", statuses: ["approved"] },
];

// Derived from the list rather than passed in, so the numbers can never
// contradict the missions underneath them.
export function MissionStats({ missions }: { missions: Mission[] }) {
  const shown = STATUS_TALLY.map((entry) => ({
    label: entry.label,
    value: missions.filter((mission) => entry.statuses.includes(mission.status))
      .length,
  })).filter((entry) => entry.value > 0);

  if (shown.length === 0) {
    return null;
  }

  return (
    <p className="text-sm text-foreground/70">
      {shown.map((entry, index) => (
        <span key={entry.label}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <span className="font-medium tabular-nums text-foreground">
            {entry.value}
          </span>{" "}
          {entry.label}
        </span>
      ))}
    </p>
  );
}
