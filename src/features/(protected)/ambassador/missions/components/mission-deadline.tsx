import { CalendarDays } from "lucide-react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

interface MissionDeadlineProps {
  endsAt: string;
}

export function MissionDeadline({ endsAt }: MissionDeadlineProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CalendarDays aria-hidden="true" className="size-4" />

      <span>
        Ends <time dateTime={endsAt}>{formatter.format(new Date(endsAt))}</time>
      </span>
    </div>
  );
}
