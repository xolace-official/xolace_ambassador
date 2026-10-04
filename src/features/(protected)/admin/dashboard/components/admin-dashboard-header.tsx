import { CalendarDays } from "lucide-react";

export function AdminDashboardHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Overview
        </h1>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays aria-hidden="true" className="size-4" />
        <span>
          {new Intl.DateTimeFormat("en-GB", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date())}
        </span>
      </div>
    </div>
  );
}
